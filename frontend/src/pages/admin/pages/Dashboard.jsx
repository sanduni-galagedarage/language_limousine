import React, { useState, useEffect } from "react";
import {
  Search,
  User,
  Car,
  Users,
  UserCheck,
  LogOut,
  RefreshCw,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Upload,
  Plus,
  Eye,
  UserPlus,
  Clock,
  Printer,
  MapPin,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL } from "@/lib/config";
import { userAPI, studentAPI, assignmentAPI, waitingTimeAPI } from "@/lib/api";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    students: { total: 0, active: 0, inactive: 0 },
    drivers: { total: 0, active: 0, inactive: 0 },
    subdrivers: { total: 0, active: 0, inactive: 0 },
    greeters: { total: 0, active: 0, inactive: 0 },
    schools: { total: 0, active: 0, inactive: 0 },
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [systemStatus, setSystemStatus] = useState({
    database: "operational",
    api: "operational",
    frontend: "operational",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [live, setLive] = useState(true);
  const [statusCounts, setStatusCounts] = useState({
    waiting: 0,
    inCar: 0,
    delivered: 0,
  });

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    gender: "",
    role: "",
  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch user statistics
      const userStatsResponse = await userAPI.getUserStats();
      const userStatsData = userStatsResponse.data.data;

      // Fetch student count
      const studentsResponse = await studentAPI.getAllStudents({ limit: 1 });
      const totalStudents = studentsResponse.data.total || 0;

      // Fetch recent assignments
      const assignmentsResponse = await assignmentAPI.getAssignments({
        limit: 5,
      });
      const recentAssignments = assignmentsResponse.data.assignments || [];

      // Today in America/Vancouver
      const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Vancouver",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).formatToParts(new Date());
      const get = (t) => parts.find((p) => p.type === t)?.value || "";
      const today = `${get("year")}-${get("month")}-${get("day")}`;

      // Fetch waiting time stats (status overview for today)
      try {
        const wtResp = await waitingTimeAPI.getWaitingTimeStats({
          date: today,
        });
        const wt = wtResp.data?.data || {};
        setStatusCounts({
          waiting: wt.waiting ?? 0,
          inCar: wt.inCar ?? 0,
          delivered: wt.delivered ?? 0,
        });
      } catch (e) {
        // Non-fatal
      }

      // Fetch completed tasks count for today
      let completedToday = 0;
      try {
        const compResp = await assignmentAPI.getAssignments({
          date: today,
          status: "Completed",
          limit: "all",
        });
        completedToday =
          compResp.data?.data?.assignments?.length ||
          compResp.data?.assignments?.length ||
          0;
      } catch (e) {
        // Non-fatal
      }

      // Update stats
      setStats({
        students: { total: totalStudents, active: totalStudents, inactive: 0 },
        drivers: userStatsData.stats?.Driver || {
          total: 0,
          active: 0,
          inactive: 0,
        },
        subdrivers: userStatsData.stats?.Subdriver || {
          total: 0,
          active: 0,
          inactive: 0,
        },
        greeters: userStatsData.stats?.Greeter || {
          total: 0,
          active: 0,
          inactive: 0,
        },
        schools: userStatsData.stats?.School || {
          total: 0,
          active: 0,
          inactive: 0,
        },
      });

      // Update recent activity
      const activity = recentAssignments.map((assignment) => ({
        id: assignment._id,
        type: "assignment",
        message: `Student ${
          assignment.student?.name || "Unknown"
        } assigned to ${assignment.driver?.username || "Unknown"}`,
        timestamp: new Date(assignment.createdAt),
        status: assignment.status,
      }));
      setRecentActivity(activity);

      // Check system status
      try {
        await fetch(`${API_BASE_URL}/health`);
        setSystemStatus((prev) => ({ ...prev, api: "operational" }));
      } catch (err) {
        setSystemStatus((prev) => ({ ...prev, api: "error" }));
      }

      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    fetchDashboardData();

    const interval = setInterval(() => {
      if (live) fetchDashboardData();
    }, 10000);
    return () => clearInterval(interval);
  }, [live]);

  // Logout function
  const handleLogout = () => {
    sessionStorage.removeItem("admin_token");
    sessionStorage.removeItem("admin_user");
    window.location.href = "/";
  };

  const handleRegisterInput = (e) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({ ...prev, [name]: value }));
    if (registerError) setRegisterError("");
    if (registerSuccess) setRegisterSuccess("");
  };

  const handleRegister = async () => {
    setRegisterLoading(true);
    setRegisterError("");
    setRegisterSuccess("");
    try {
      const token = sessionStorage.getItem("admin_token");
      if (!token) throw new Error("Admin token not found. Please login again.");
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(registerData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Registration failed");
      setRegisterSuccess("User registered successfully!");
      setRegisterData({
        username: "",
        email: "",
        password: "",
        gender: "",
        role: "",
      });
      // Refresh dashboard data after successful registration
      fetchDashboardData();
    } catch (err) {
      setRegisterError(err.message);
    } finally {
      setRegisterLoading(false);
    }
  };

  const statsCards = [
    {
      id: 1,
      title: "Total Schools",
      value: stats.schools.total.toString(),
      icon: User,
      bgColor: "bg-black",
      trend: "+5%",
      trendUp: true,
    },
    {
      id: 2,
      title: "Total Drivers",
      value: stats.drivers.total.toString(),
      icon: Car,
      bgColor: "bg-black",
      trend: "+2%",
      trendUp: true,
    },
    {
      id: 3,
      title: "Total Subdrivers",
      value: stats.subdrivers.total.toString(),
      icon: Users,
      bgColor: "bg-black",
      trend: "+1%",
      trendUp: true,
    },
    {
      id: 4,
      title: "Total Greeters",
      value: stats.greeters.total.toString(),
      icon: UserCheck,
      bgColor: "bg-black",
      trend: "0%",
      trendUp: false,
    },
  ];

  const getStatusIcon = (status) => {
    return status === "operational" ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <AlertCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusColor = (status) => {
    return status === "operational" ? "text-green-600" : "text-red-600";
  };

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 min-h-screen w-full">
        {/* Header */}
        <div className="bg-white px-4 md:px-6 py-4 border-b border-gray-300 shadow-sm">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="md:hidden w-12"></div>

            {/* Search Bar */}
            <div className="relative flex-1 max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Type to search..."
                className="w-full bg-gray-100 text-gray-900 pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent placeholder-gray-500 text-sm"
              />
            </div>

            {/* Admin User + Refresh + Logout */}
            <div className="flex items-center space-x-3 ml-6">
              <span className="hidden sm:block text-black font-medium">
                Admin User
              </span>
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>

              {/* Refresh Button */}
              <Button
                onClick={fetchDashboardData}
                disabled={loading}
                variant="outline"
                size="sm"
                className="border-gray-400 hover:bg-gray-100"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>

              <Button
                onClick={() => setLive((v) => !v)}
                disabled={loading}
                variant="outline"
                size="sm"
                className={`border-gray-400 ${live ? "bg-gray-100" : ""}`}
                title="Toggle live auto-refresh"
              >
                <span
                  className={`h-2 w-2 rounded-full mr-2 ${
                    live ? "bg-black" : "bg-gray-400"
                  }`}
                />
                {live ? "Live On" : "Live Off"}
              </Button>

              {/* Logout Button */}
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-red-500 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-200"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Error Alert */}
            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Last Updated Info */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Dashboard
              </h1>
              <div className="text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
              {statsCards.map((stat) => {
                const IconComponent = stat.icon;
                return (
                  <Card
                    key={stat.id}
                    className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 text-white hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <p className="text-slate-200 text-sm font-medium">
                            {stat.title}
                          </p>
                          <p className="text-3xl md:text-4xl font-bold">
                            {loading ? "..." : stat.value}
                          </p>
                          <div className="flex items-center space-x-1">
                            <TrendingUp
                              className={`h-4 w-4 ${
                                stat.trendUp ? "text-green-400" : "text-slate-400"
                              }`}
                            />
                            <Badge
                              variant="secondary"
                              className={`text-xs ${
                                stat.trendUp
                                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                                  : "bg-slate-500/20 text-slate-400 border-slate-500/30"
                              }`}
                            >
                              {stat.trend}
                            </Badge>
                          </div>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-0 bg-white/10 rounded-full blur-xl"></div>
                          <div className="relative bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                            <IconComponent className="h-8 w-8" />
                          </div>
                        </div>
                      </div>
                      {/* Decorative gradient overlay */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Dashboard Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Quick Actions */}
              <Card className="lg:col-span-2 shadow-lg border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">
                      Quick Actions
                    </h2>
                    <Badge variant="outline" className="text-xs">
                      6 Actions Available
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Button
                      className="w-full h-12 bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      onClick={() => navigate("/admin/admin-students/upload")}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Students
                    </Button>
                    <Button
                      className="w-full h-12 bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      onClick={() => navigate("/admin/admin-students/add")}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Student
                    </Button>
                    <Button
                      className="w-full h-12 bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      onClick={() => navigate("/admin/admin-students/view")}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Students
                    </Button>
                    <Button
                      className="w-full h-12 bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      onClick={() => navigate("/admin/assigndrivers")}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Assign Drivers
                    </Button>
                    <Button
                      className="w-full h-12 bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      onClick={() => navigate("/admin/admin-waitingtime")}
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Update Waiting Time
                    </Button>
                    <Button
                      className="w-full h-12 bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      onClick={() => navigate("/admin/printmap")}
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      Print Map
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* System Status */}
              <Card className="shadow-lg border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">
                      System Status
                    </h2>
                    <Badge
                      variant={
                        Object.values(systemStatus).every(s => s === "operational")
                          ? "default"
                          : "destructive"
                      }
                      className="text-xs"
                    >
                      {Object.values(systemStatus).filter(s => s === "operational").length}/
                      {Object.keys(systemStatus).length} Online
                    </Badge>
                  </div>
                  <div className="space-y-4">
                    {Object.entries(systemStatus).map(([service, status]) => (
                      <div
                        key={service}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(status)}
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {service}
                          </span>
                        </div>
                        <Badge
                          variant={status === "operational" ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {status}
                        </Badge>
                      </div>
                    ))}
                  </div>

                  {/* Quick Stats */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700 mb-4">
                      Today's Overview
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">
                          {stats.drivers.active + stats.subdrivers.active + stats.greeters.active}
                        </p>
                        <p className="text-xs text-gray-600 font-medium">Active Users</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">
                          {statusCounts.delivered}
                        </p>
                        <p className="text-xs text-green-600 font-medium">Delivered</p>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <p className="text-2xl font-bold text-orange-600">
                          {statusCounts.waiting}
                        </p>
                        <p className="text-xs text-orange-600 font-medium">Waiting</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">
                          {statusCounts.inCar}
                        </p>
                        <p className="text-xs text-purple-600 font-medium">In Transit</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Dashboard Content */}
            <Card className="shadow-lg border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Performance Metrics
                  </h2>
                  <Badge variant="outline" className="text-xs">
                    Real-time Data
                  </Badge>
                </div>
                <p className="text-gray-600 mb-6 text-sm">
                  Monitor key performance indicators and system metrics in real-time.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="bg-gradient-to-br from-gray-800 to-black text-white border-0">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium mb-1">Today's Routes</h3>
                          <p className="text-2xl font-bold">{recentActivity.length}</p>
                          <p className="text-gray-100 text-xs">Active assignments</p>
                        </div>
                        <div className="bg-white/20 rounded-lg p-2">
                          <MapPin className="h-5 w-5" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white border-0">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium mb-1">Completed</h3>
                          <p className="text-2xl font-bold">
                            {recentActivity.filter((a) => a.status === "completed").length}
                          </p>
                          <p className="text-green-100 text-xs">Successful trips</p>
                        </div>
                        <div className="bg-white/20 rounded-lg p-2">
                          <CheckCircle className="h-5 w-5" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-600 to-purple-700 text-white border-0">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium mb-1">System Health</h3>
                          <p className="text-2xl font-bold">
                            {Object.values(systemStatus).filter((s) => s === "operational").length}/
                            {Object.keys(systemStatus).length}
                          </p>
                          <p className="text-purple-100 text-xs">Services online</p>
                        </div>
                        <div className="bg-white/20 rounded-lg p-2">
                          <AlertCircle className="h-5 w-5" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-orange-600 to-orange-700 text-white border-0">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium mb-1">Response Time</h3>
                          <p className="text-2xl font-bold">~2s</p>
                          <p className="text-orange-100 text-xs">Avg API response</p>
                        </div>
                        <div className="bg-white/20 rounded-lg p-2">
                          <TrendingUp className="h-5 w-5" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-gray-300 px-4 md:px-6 py-4 mt-6 md:mt-8">
          <div className="max-w-7xl mx-auto">
            <p className="text-center text-gray-500 text-sm">
              Copyright © 2024. All right reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
