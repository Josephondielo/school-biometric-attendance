import { useState, useEffect } from "react";
import {
  Search,
  SlidersHorizontal,
  Plus,
  ChevronRight,
  ShieldAlert,
  Award,
} from "lucide-react";

import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import config from "../config";
import api from "../api/client";
import { toast } from "react-hot-toast";

const Users = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, usersRes] = await Promise.all([
          api.get("/enroll/students"),
          api.get("/auth/users")
        ]);

        const studentsData = studentsRes.data;
        const usersData = usersRes.data;

        let allUsers = [];

        if (studentsData.students) {
          allUsers = [
            ...allUsers,
            ...studentsData.students.map(s => ({
              id: `student-${s.id}`,
              realId: s.id,
              name: `${s.first_name} ${s.last_name}`,
              role: s.role || "STUDENT",
              desc: s.admission_number,
              status: "BIOMETRIC ENROLLED",
              statusColor: "text-accent",
              img: `https://ui-avatars.com/api/?name=${encodeURIComponent(s.first_name)}+${encodeURIComponent(s.last_name)}&background=random`,
              alert: false
            }))
          ];
        }

        if (usersData.users) {
          allUsers = [
            ...allUsers,
            ...usersData.users.map(u => ({
              id: `user-${u.id}`,
              realId: u.id,
              name: u.username,
              role: u.role.toUpperCase(),
              desc: "System User",
              status: "ACTIVE USER",
              statusColor: "text-primary",
              img: `https://ui-avatars.com/api/?name=${encodeURIComponent(u.username)}&background=0D8ABC&color=fff`,
              alert: false
            }))
          ];
        }

        setUsers(allUsers);
      } catch (error) {
        console.error("Failed to fetch users:", error.response?.data || error.message);
        toast.error(`Refresh failed: ${error.response?.data?.error || "Connection error"}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  const filteredUsers = users.filter((user) => {
    // 1. Tab Filtering
    const matchesTab = activeTab === "All" ||
      (activeTab === "Students" && user.role === "STUDENT") ||
      (activeTab === "Admin" && user.role === "ADMIN") ||
      (activeTab === "Staff" && user.role !== "STUDENT" && user.role !== "ADMIN");

    if (!matchesTab) return false;

    // 2. Search Filtering
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    return (
      (user.name || "").toLowerCase().includes(query) ||
      (user.desc || "").toLowerCase().includes(query)
    );
  });

  return (
    <div className="p-6 pt-8 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30">
            <Award size={20} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Directory</h1>
            <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">
              {loading ? <Skeleton className="h-3 w-20" /> : `${users.length} Users Total`}
            </p>
          </div>
        </div>

        <Button variant="ghost" className="bg-card-bg w-10 h-10 rounded-full p-0">
          <SlidersHorizontal size={18} />
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
          size={18}
        />
        <input
          placeholder="Search students or staff..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-card-bg border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 transition-colors"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
        {["All", "Admin", "Staff", "Students"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-xs font-bold px-6 py-2.5 rounded-xl transition-all whitespace-nowrap ${activeTab === tab
              ? "bg-primary text-white shadow-lg shadow-primary/20"
              : "bg-card-bg border border-white/5 text-gray-400 hover:text-white"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* User List */}
      <div className="space-y-3">
        {loading ? (
          // Skeletons
          [1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-4 flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="w-8 h-8 rounded-full" />
            </Card>
          ))
        ) : (
          filteredUsers.map((user) => (
            <Card
              key={user.id}
              className={`p-4 flex items-center gap-4 transition-colors ${user.alert
                ? "bg-gradient-to-r from-card-bg to-[#2a2a20] border-l-4 border-l-warning"
                : user.role === "ADMIN"
                  ? "bg-gradient-to-r from-card-bg to-[#1e1e2d] border-l-4 border-l-primary"
                  : "hover:bg-card-bg/80"
                }`}
            >
              <div className="relative">
                <img
                  src={user.img}
                  alt={user.name}
                  className={`w-12 h-12 rounded-xl object-cover border border-white/10 ${user.alert ? "grayscale opacity-80" : ""
                    }`}
                />
                <div
                  className={`absolute -top-1.5 -right-1.5 rounded-full p-0.5 border-2 border-card-bg ${user.alert
                    ? "bg-warning"
                    : user.role === "ADMIN"
                      ? "bg-primary"
                      : "bg-accent"
                    }`}
                >
                  {user.alert ? (
                    <ShieldAlert size={10} className="text-black" />
                  ) : (
                    <Award size={10} className="text-white" />
                  )}
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-bold text-white text-sm">{user.name}</h3>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                    {user.role}
                  </span>
                </div>
                <p className="text-gray-500 text-[10px] mb-1">
                  {user.desc} • ID: #{user.realId}
                </p>
                <div className={`text-[9px] font-bold ${user.statusColor}`}>
                  {user.status}
                </div>
              </div>

              {user.alert ? (
                <button className="bg-primary/20 text-primary w-8 h-8 rounded-full flex items-center justify-center">
                  <Plus size={16} />
                </button>
              ) : (
                <ChevronRight size={16} className="text-gray-600" />
              )}
            </Card>
          ))
        )}
      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-24 right-6 w-14 h-14 bg-primary hover:bg-primary-hover text-white rounded-2xl shadow-xl shadow-primary/40 flex items-center justify-center">
        <Plus size={28} />
      </button>
    </div>
  );
};

export default Users;
