import clsx from "clsx";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Search,
  UserCheck,
  Clock,
  UserPlus,
  FileText,
} from "lucide-react";

import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";

import config from '../config';

/* ---------------- Circular Progress Component ---------------- */

const ProgressRing = ({ radius, stroke, progress }) => {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset =
    circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="rotate-[-90deg]"
      >
        <circle
          stroke="#2a2a35"
          strokeWidth={stroke}
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="url(#gradient)"
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

/* ---------------- Dashboard ---------------- */

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_students: 0,
    present_today: 0,
    percentage: 0,
    recent_activity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${config.API_BASE_URL}/attendance/stats`);
        const data = await response.json();
        if (response.ok) {
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // Poll every 30 seconds for live updates
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 pt-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-blue-500 p-[2px]">
            <img
              src="https://i.pravatar.cc/150?u=admin"
              alt="Admin"
              className="rounded-full bg-dark-bg p-0.5 w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-sm text-gray-400 font-medium">
              Admin Console
            </h1>
            <p className="text-primary text-xs font-bold tracking-wider">
              SYSTEM SECURE
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="ghost" className="w-10 h-10 rounded-full p-0 bg-card-bg">
            <Search size={18} />
          </Button>
          <Button
            variant="ghost"
            className="w-10 h-10 rounded-full p-0 bg-card-bg relative"
          >
            <Bell size={18} />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-success rounded-full border-2 border-card-bg"></span>
          </Button>
        </div>
      </div>

      {/* Title */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white mb-1">
          Today&apos;s Pulse
        </h2>
        <p className="text-gray-400 text-sm">
          Real-time biometric analytics
        </p>
      </div>

      {/* Main Stats */}
      <Card className="mb-6 bg-gradient-to-br from-[#1c1c26] to-[#16161e] border-none">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-400 font-bold tracking-widest uppercase mb-1">
              Overall Attendance
            </p>
            <h3 className="text-5xl font-bold text-white mb-2">
              {loading ? <Skeleton className="h-12 w-24" /> : `${stats.percentage}%`}
            </h3>
            <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-1 rounded-full">
              ACTIVE TODAY
            </span>
            <p className="text-gray-500 text-xs mt-3">
              {loading ? (
                <Skeleton className="h-3 w-32" />
              ) : (
                `${stats.present_today} / ${stats.total_students} checked in`
              )}
            </p>
          </div>

          <ProgressRing radius={60} stroke={8} progress={stats.percentage} />
        </div>

        <div className="mt-6 w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-primary h-full rounded-full"
            style={{ width: `${stats.percentage}%` }}
          ></div>
        </div>
      </Card>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card className="p-4 flex flex-col justify-between h-32">
          <div className="w-8 h-8 rounded-full bg-warning/20 text-warning flex items-center justify-center mb-2">
            <Clock size={16} />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase">
              Late Arrivals
            </p>
            <h4 className="text-2xl font-bold text-white">
              {loading ? <Skeleton className="h-8 w-12" /> : stats.late_today || "0"}
            </h4>
            <p className="text-warning text-[10px] mt-1 font-medium">
              NEED ATTENTION
            </p>
          </div>
        </Card>

        <Card className="p-4 flex flex-col justify-between h-32">
          <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center mb-2">
            <UserPlus size={16} />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase">
              Total Students
            </p>
            <h4 className="text-2xl font-bold text-white">
              {loading ? <Skeleton className="h-8 w-12" /> : stats.total_students}
            </h4>
            <p className="text-accent text-[10px] mt-1 font-medium">
              REGISTERED
            </p>
          </div>
        </Card>
      </div>

      {/* Management Hub */}
      <h3 className="text-xs text-gray-500 font-bold tracking-widest uppercase mb-4">
        Management Hub
      </h3>

      <div className="grid grid-cols-3 gap-3 mb-8">
        <Button
          onClick={() => navigate('/scanner')}
          className="h-24 flex-col gap-1 rounded-2xl bg-gradient-to-br from-primary to-blue-600 border-none shadow-lg shadow-primary/25"
        >
          <UserCheck size={20} />
          <span className="text-[10px] font-bold mt-1 text-center leading-tight">
            MARK
            <br />
            ATTENDANCE
          </span>
        </Button>

        <Button
          variant="outline"
          onClick={() => navigate('/enroll')}
          className="h-24 flex-col gap-1 rounded-2xl border-white/5 bg-card-bg hover:bg-card-bg/80 text-gray-300"
        >
          <UserPlus size={20} className="text-accent" />
          <span className="text-[10px] font-bold mt-1 text-center leading-tight">
            REGISTER
            <br />
            USER
          </span>
        </Button>

        <Button
          variant="outline"
          onClick={() => navigate('/reports')}
          className="h-24 flex-col gap-1 rounded-2xl border-white/5 bg-card-bg hover:bg-card-bg/80 text-gray-300"
        >
          <FileText size={20} className="text-gray-400" />
          <span className="text-[10px] font-bold mt-1 text-center leading-tight">
            VIEW
            <br />
            REPORTS
          </span>
        </Button>
      </div>

      {/* Live Activity */}
      <h3 className="text-xs text-gray-500 font-bold tracking-widest uppercase mb-4">
        Live Activity
      </h3>

      <div className="space-y-3">
        {loading ? (
          [1, 2].map(i => (
            <Card key={i} className="p-3 flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
              <div className="flex flex-col items-end gap-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
            </Card>
          ))
        ) : stats.recent_activity.length > 0 ? (
          stats.recent_activity.map((activity, i) => (
            <Card key={i} className="p-3 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">
                  {activity.name}
                </h4>
                <p className="text-[10px] text-gray-500">
                  Biometric Auth • Gate 01
                </p>
              </div>
              <div className="text-right">
                <p className={clsx("text-xs font-bold", activity.color)}>
                  {activity.time}
                </p>
                <p className="text-[10px] text-gray-600 uppercase font-medium">
                  {activity.status}
                </p>
              </div>
            </Card>
          ))
        ) : (
          <p className="text-center text-gray-500 text-xs py-4">No recent activity</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
