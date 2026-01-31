import { useState, useEffect } from "react";
import {
  ChevronLeft,
  SlidersHorizontal,
  Search,
  Download,
  X,
  User,
  Calendar
} from "lucide-react";

import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import config from "../config";
import toast from "react-hot-toast";

/* ---------------- Reports Page ---------------- */

const Reports = () => {
  // Report Data
  const [reportData, setReportData] = useState({
    weekly_trend: [],
    avg_attendance: 0,
    today_present: 0,
    punctuality: 0,
    recent_logs: []
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [range, setRange] = useState("7d"); // 7d, 30d, 90d

  // Student Search
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Fetch Students for Search
  useEffect(() => {
    fetch(`${config.API_BASE_URL}/enroll/students`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setStudents(data.students);
      })
      .catch(err => console.error("Failed to load students", err));
  }, []);

  // Fetch Report Data
  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const studentParam = selectedStudent ? `&student_id=${selectedStudent.id}` : "";
        const response = await fetch(`${config.API_BASE_URL}/attendance/report?range=${range}${studentParam}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          setReportData(data);
        }
      } catch (error) {
        console.error("Failed to fetch report", error);
        toast.error("Failed to update report");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [range, selectedStudent]);

  const handleDownloadCSV = async () => {
    const loadingToast = toast.loading("Generating detailed report...");
    try {
      const token = localStorage.getItem("token");
      const studentParam = selectedStudent ? `&student_id=${selectedStudent.id}` : "";
      const response = await fetch(`${config.API_BASE_URL}/attendance/export?range=${range}${studentParam}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (!response.ok) throw new Error("Export failed");

      if (data.length === 0) {
        toast.error("No data found for this period", { id: loadingToast });
        return;
      }

      // Convert JSON to CSV
      const headers = ["Date", "Time", "Student Name", "Admission No", "Status"];
      const csvRows = [headers.join(",")];

      data.forEach(row => {
        const values = [
          row.Date,
          row.Time,
          `"${row["Student Name"]}"`, // Quote name to handle spaces
          row["Admission No"],
          row.Status
        ];
        csvRows.push(values.join(","));
      });

      const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `attendance_report_${range}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Download started!", { id: loadingToast });

    } catch (err) {
      toast.error("Failed to download report", { id: loadingToast });
    }
  };

  const filteredStudents = students.filter(s =>
    `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.admission_number.includes(searchQuery)
  ).slice(0, 5); // Limit suggestions

  return (
    <div className="p-6 pt-8 pb-20 relative min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-bold text-lg">Analytics</h1>

        <div className="flex gap-2">
          <Button
            onClick={() => setIsSearching(!isSearching)}
            variant="ghost"
            className={`w-10 h-10 rounded-full p-0 transition-colors ${isSearching ? 'bg-primary text-white' : 'bg-card-bg text-gray-400'}`}
          >
            <Search size={18} />
          </Button>
          <Button
            onClick={handleDownloadCSV}
            variant="ghost"
            className="bg-success/10 text-success rounded-full w-10 h-10 p-0 hover:bg-success/20"
            title="Export CSV"
          >
            <Download size={18} />
          </Button>
        </div>
      </div>

      {/* Search Overlay */}
      {isSearching && (
        <div className="mb-6 animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input
              autoFocus
              placeholder="Search student name or ID..."
              className="w-full bg-card-bg border border-primary/50 rounded-2xl py-3 pl-10 pr-10 text-sm text-white focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#1e1e2d] border border-white/5 rounded-xl shadow-2xl z-50 overflow-hidden">
                {filteredStudents.map(s => (
                  <div
                    key={s.id}
                    onClick={() => {
                      setSelectedStudent(s);
                      setIsSearching(false);
                      setSearchQuery("");
                    }}
                    className="p-3 hover:bg-white/5 cursor-pointer flex items-center justify-between border-b border-white/5 last:border-0"
                  >
                    <span className="text-sm font-bold text-gray-200">{s.first_name} {s.last_name}</span>
                    <span className="text-xs text-gray-500">{s.admission_number}</span>
                  </div>
                ))}
                {filteredStudents.length === 0 && (
                  <div className="p-3 text-center text-xs text-gray-500">No students found</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active Student Filter Chip */}
      {selectedStudent && (
        <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-xl p-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <User size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-primary">Filtering by Student</p>
              <p className="text-sm font-bold text-white leading-none">{selectedStudent.first_name} {selectedStudent.last_name}</p>
            </div>
          </div>
          <button
            onClick={() => setSelectedStudent(null)}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Date Range Filters */}
      <div className="flex bg-card-bg p-1 rounded-2xl mb-6 border border-white/5">
        {[
          { label: 'Week', val: '7d' },
          { label: 'Month', val: '30d' },
          { label: 'Quarter', val: '90d' }
        ].map((opt) => (
          <button
            key={opt.val}
            onClick={() => setRange(opt.val)}
            className={`flex-1 text-xs font-bold py-2.5 rounded-xl transition-all ${range === opt.val
              ? "bg-primary text-white shadow-lg"
              : "text-gray-500 hover:text-gray-300"
              }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Chart Card */}
      <Card className="mb-6 p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">
              Avg. Attendance
            </p>
            <h2 className="text-4xl font-bold text-white">
              {loading ? <Skeleton className="h-10 w-24" /> : `${reportData.avg_attendance}%`}
            </h2>
          </div>
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" aspect={2.5}>
          {loading ? (
            <div className="w-full h-full flex items-end gap-1">
              {Array.from({ length: range === '90d' ? 20 : 7 }).map((_, i) => (
                <Skeleton key={i} className={`flex-1 rounded-t bg-primary/20`} style={{ height: `${Math.random() * 60 + 20}%` }} />
              ))}
            </div>
          ) : (
            <AreaChart data={reportData.weekly_trend}>
              <defs>
                <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="day"
                tick={{ fill: "#6b7280", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                dy={10}
                interval={range === '90d' ? 6 : 0} // Skip ticks for 90d
              />
              <Tooltip
                contentStyle={{ backgroundColor: "#1c1c26", borderRadius: "8px", border: "none" }}
                itemStyle={{ color: "#fff", fontSize: "12px" }}
              />
              <Area type="monotone" dataKey="attendance" stroke="#7c3aed" strokeWidth={3} fill="url(#colorAttendance)" />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">
            Total Records
          </p>
          <h3 className="text-2xl font-bold text-white">
            {loading ? <Skeleton className="h-8 w-16" /> : reportData.total_present}
          </h3>
          <p className="text-success text-[10px] mt-1 font-medium">
            In Selected Range
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">
            On-Time Rate
          </p>
          <h3 className="text-2xl font-bold text-white">
            {loading ? <Skeleton className="h-8 w-16" /> : `${reportData.punctuality}%`}
          </h3>
          <p className="text-warning text-[10px] mt-1 font-medium">
            (Before 8:30 AM)
          </p>
        </Card>
      </div>

      {/* Recent Activity Table */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Recent Activity</h3>
          <p className="text-xs text-gray-500">Latest records in selected range</p>
        </div>

        <div className="bg-card-bg border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-gray-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-4">Student</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Time</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {reportData.recent_logs && reportData.recent_logs.length > 0 ? (
                  reportData.recent_logs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white">{log.name}</div>
                        <div className="text-xs text-gray-500">{log.admission_number}</div>
                      </td>
                      <td className="p-4 text-gray-400">{log.date}</td>
                      <td className="p-4 text-white font-mono text-xs">{log.time}</td>
                      <td className="p-4 text-center">
                        <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold ${log.status === 'Present'
                            ? 'bg-success/10 text-success'
                            : 'bg-warning/10 text-warning'
                          }`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-gray-500 text-xs">
                      No activity found for this period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {reportData.recent_logs && reportData.recent_logs.length >= 50 && (
            <div className="p-3 text-center text-[10px] text-gray-500 border-t border-white/5">
              Showing last 50 records. Export for full history.
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Reports;
