import React, { useEffect, useState } from "react";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import socket from "../utils/socket.js";
import { FaRupeeSign, FaShoppingBag, FaUsers, FaBox } from "react-icons/fa";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import DashboardCard from "../components/DashboardCard";

const AdminDashboard = () => {
  const [stats, setStats] = useState({});

  const revenueData = [
    { month: "Jan", revenue: 1200 },
    { month: "Feb", revenue: 2100 },
    { month: "Mar", revenue: 1800 },
    { month: "Apr", revenue: 3000 },
    { month: "May", revenue: 2400 },
    { month: "Jun", revenue: 5883 },
  ];

  const fetchStats = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.dashboardStats,
      });

      setStats(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchStats();

    socket.on("dashboard-updated", () => {
      console.log("Dashboard updating...");
      fetchStats();
    });

    return () => {
      socket.off("dashboard-updated");
      console.log("Dashboard event received");
    };
  }, []);

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Dashboard</h1>

        <p className="text-gray-500 mt-1">Welcome back, Lalit 👋</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <DashboardCard
          title="Today's Revenue"
          value={`₹${stats.todayRevenue || 0}`}
          icon={<FaRupeeSign />}
          color="bg-purple-500"
        />

        <DashboardCard
          title="Today's Orders"
          value={stats.todayOrders || 0}
          icon={<FaShoppingBag />}
          color="bg-blue-500"
        />

        <DashboardCard
          title="Monthly Revenue"
          value={`₹${stats.monthlyRevenue || 0}`}
          icon={<FaRupeeSign />}
          color="bg-green-500"
        />

        <DashboardCard
          title="Monthly Orders"
          value={stats.monthlyOrders || 0}
          icon={<FaShoppingBag />}
          color="bg-orange-500"
        />

        <DashboardCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue || 0}`}
          icon={<FaRupeeSign />}
          color="bg-indigo-500"
        />

        <DashboardCard
          title="Total Orders"
          value={stats.totalOrders || 0}
          icon={<FaShoppingBag />}
          color="bg-cyan-500"
        />

        <DashboardCard
          title="Total Users"
          value={stats.totalUsers || 0}
          icon={<FaUsers />}
          color="bg-emerald-500"
        />

        <DashboardCard
          title="Total Products"
          value={stats.totalProducts || 0}
          icon={<FaBox />}
          color="bg-pink-500"
        />
      </div>

      <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-800">Revenue Overview</h2>

          <span className="text-sm text-gray-500">Last 6 Months</span>
        </div>

        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />

                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>

              <XAxis dataKey="month" tickLine={false} axisLine={false} />

              <YAxis tickLine={false} axisLine={false} />

              <Tooltip />

              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#8b5cf6"
                fillOpacity={1}
                fill="url(#colorRevenue)"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
