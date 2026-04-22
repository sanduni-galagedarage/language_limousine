import Sidebar from "../../components/Sidebar";
import { useState, useEffect } from "react";
import { Search, User, Calendar, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import axios from "axios";
import { API_BASE_URL } from "@/lib/config";
import { toast } from "react-toastify";

export default function View() {
  const [selectedDate, setSelectedDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Get auth token from sessionStorage or localStorage
  const getAuthToken = () => {
    return (
      sessionStorage.getItem("admin_token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("admin_token")
    );
  };

  // Configure axios client
  const apiClient = axios.create({
    baseURL: `${API_BASE_URL}/students`,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Add request interceptor to include auth token
  apiClient.interceptors.request.use(
    (config) => {
      const token = getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleViewStudents = async () => {
    if (!selectedDate) {
      toast.error("Please select a date first");
      return;
    }

    setIsLoading(true);
    setError("");
    setShowTable(false);

    try {
      const token = getAuthToken();
      if (!token) {
        setError("Access token required. Please log in again.");
        setTimeout(() => {
          window.location.href = "/admin/login";
        }, 2000);
        return;
      }

      const response = await apiClient.get("/", {
        params: {
          date: selectedDate,
          limit: "all", // Request all students for the date
        },
      });

      if (response.data.success) {
        setStudents(response.data.data.students);
        setShowTable(true);
        toast.success(
          `Found ${response.data.data.students.length} students for ${selectedDate}`
        );
      }
    } catch (err) {
      console.error("Error fetching students:", err);
      let errorMessage = "Failed to fetch students";

      if (err.response?.status === 401) {
        errorMessage = "Access token required. Please log in again.";
        setTimeout(() => {
          window.location.href = "/admin/login";
        }, 2000);
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter students based on search term
  const filteredStudents = students.filter(
    (student) =>
      student.studentGivenName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      student.studentFamilyName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      student.studentNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.trip?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.flight?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.school?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "Present":
        return "text-green-600 bg-green-100";
      case "Absent":
        return "text-red-600 bg-red-100";
      case "Late":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="flex min-h-screen bg-white overflow-x-hidden">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 overflow-x-hidden md:ml-64 min-h-screen w-full">
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Type to search..."
                className="w-full bg-gray-50 text-gray-900 pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-sm"
              />
            </div>

            {/* Admin User */}
            <div className="flex items-center space-x-3 ml-6">
              <span className="text-gray-900 font-medium">Admin User</span>
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 overflow-x-hidden bg-white">
          <div className="max-w-7xl mx-auto">
            {/* Page Title */}
            <h1 className="text-2xl font-semibold text-blue-500 mb-6">
              View Students
            </h1>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <span className="text-red-700">{error}</span>
                </div>
              </div>
            )}

            {/* Search and Date Selection Form */}
            <Card className="bg-white border-gray-200 mb-8 shadow-sm">
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Form Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    {/* Search Students */}
                    <div className="space-y-2">
                      <Label className="text-gray-700 text-sm font-medium">
                        Search Students
                      </Label>
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input
                          type="text"
                          placeholder="Search by name, number, trip, flight, or school..."
                          value={searchTerm}
                          onChange={handleSearchChange}
                          className="w-full bg-white text-gray-900 pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-blue-500 placeholder-gray-400 text-sm"
                        />
                      </div>
                    </div>

                    {/* Date Selection */}
                    <div className="space-y-2">
                      <Label className="text-gray-700 text-sm font-medium">
                        Select Date
                      </Label>
                      <div className="relative">
                        <Input
                          type="date"
                          value={selectedDate}
                          onChange={handleDateChange}
                          className="bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-10 w-full h-12 text-sm"
                        />
                        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
                      </div>
                    </div>

                    {/* View Students Button */}
                    <div>
                      <Button
                        onClick={handleViewStudents}
                        disabled={isLoading || !selectedDate}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-medium w-full h-12 disabled:opacity-50"
                      >
                        {isLoading ? "Loading..." : "View Students"}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Students Table */}
            {showTable && selectedDate ? (
              <Card className="bg-white border-gray-200 overflow-hidden shadow-sm">
                {/* Table Header */}
                <CardHeader className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Students for{" "}
                        {new Date(selectedDate).toLocaleDateString()}
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        {filteredStudents.length} student
                        {filteredStudents.length !== 1 ? "s" : ""} found
                      </p>
                    </div>
                  </div>
                </CardHeader>

                {/* Table */}
                <CardContent className="p-0 overflow-x-auto">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="text-gray-700 font-medium text-left px-4 py-3 border-b border-gray-200">
                            Excel Order
                          </th>
                          <th className="text-gray-700 font-medium text-left px-4 py-3 border-b border-gray-200">
                            Student No
                          </th>
                          <th className="text-gray-700 font-medium text-left px-4 py-3 border-b border-gray-200">
                            Student Name
                          </th>
                          <th className="text-gray-700 font-medium text-left px-4 py-3 border-b border-gray-200">
                            Trip
                          </th>
                          <th className="text-gray-700 font-medium text-left px-4 py-3 border-b border-gray-200">
                            Arrival Time
                          </th>
                          <th className="text-gray-700 font-medium text-left px-4 py-3 border-b border-gray-200">
                            Flight
                          </th>
                          <th className="text-gray-700 font-medium text-left px-4 py-3 border-b border-gray-200">
                            School
                          </th>
                          <th className="text-gray-700 font-medium text-left px-4 py-3 border-b border-gray-200">
                            D/I
                          </th>
                          <th className="text-gray-700 font-medium text-left px-4 py-3 border-b border-gray-200">
                            M/F
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.length > 0 ? (
                          filteredStudents.map((student, index) => (
                            <tr
                              key={student._id}
                              className="border-gray-200 hover:bg-gray-50"
                            >
                              <td className="text-gray-700 px-4 py-3 border-b border-gray-200">
                                {student.excelOrder || index + 1}
                              </td>
                              <td className="text-gray-700 px-4 py-3 border-b border-gray-200">
                                {student.studentNo}
                              </td>
                              <td className="text-gray-700 px-4 py-3 border-b border-gray-200">
                                {student.studentGivenName}{" "}
                                {student.studentFamilyName}
                              </td>
                              <td className="text-gray-700 px-4 py-3 border-b border-gray-200">
                                {student.trip}
                              </td>
                              <td className="text-gray-700 px-4 py-3 border-b border-gray-200">
                                {student.actualArrivalTime}
                              </td>
                              <td className="text-gray-700 px-4 py-3 border-b border-gray-200">
                                {student.flight}
                              </td>
                              <td className="text-gray-700 px-4 py-3 border-b border-gray-200">
                                {student.school}
                              </td>
                              <td className="text-gray-700 px-4 py-3 border-b border-gray-200">
                                {student.dOrI}
                              </td>
                              <td className="text-gray-700 px-4 py-3 border-b border-gray-200">
                                {student.mOrF}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="9"
                              className="text-center py-8 text-gray-500"
                            >
                              No students found for the selected date
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="text-center py-8">
                    <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Select a date to view students
                    </h3>
                    <p className="text-gray-500">
                      Choose a date from the date picker above and click "View
                      Students" to see the student data.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-gray-200 px-6 py-4 mt-8">
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
