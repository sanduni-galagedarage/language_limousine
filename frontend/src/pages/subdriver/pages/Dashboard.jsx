import Sidebar from "../components/Sidebar";
import { useState, useEffect } from "react";
import {
  Search,
  User,
  Settings,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { assignmentAPI } from "@/lib/api";

// Utility function to format time to 12-hour format with AM/PM
const formatTimeToAMPM = (timeString) => {
  if (!timeString) return "N/A";

  try {
    // If it's already in 12-hour format, return as is
    if (timeString.includes("AM") || timeString.includes("PM")) {
      return timeString;
    }

    // If it's in 24-hour format, convert to 12-hour
    if (timeString.includes(":")) {
      const [hours, minutes] = timeString.split(":");
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    }

    return timeString;
  } catch (error) {
    return timeString;
  }
};

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [totalAssignments, setTotalAssignments] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [showCompletedTasks, setShowCompletedTasks] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, [currentPage, entriesPerPage, selectedDate, showCompletedTasks]);

  // Light polling to keep counts fresh
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchAssignments();
    }, 20000); // 20s
    return () => clearInterval(intervalId);
  }, [selectedDate, showCompletedTasks]);

  const fetchAssignments = async () => {
    setIsLoading(true);
    try {
      const apiFunction = showCompletedTasks
        ? assignmentAPI.getSubdriverCompletedTasks
        : assignmentAPI.getSubdriverAssignments;

      const response = await apiFunction({
        page: currentPage,
        limit: entriesPerPage,
        date: selectedDate,
      });

      if (response.data.success) {
        console.log(
          "📋 Subdriver assignments data:",
          response.data.data.assignments
        );
        if (response.data.data.assignments.length > 0) {
          console.log(
            "📚 Sample assignment student data:",
            response.data.data.assignments[0].studentId
          );
        }
        setAssignments(response.data.data.assignments);
        setTotalAssignments(response.data.data.pagination.totalAssignments);
        setTotalPages(response.data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
      alert("Failed to fetch assignments. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setCurrentPage(1);
  };

  const handlePickupStatusUpdate = async (assignmentId, newStatus) => {
    setIsUpdating(true);
    try {
      const response = await assignmentAPI.updateSubdriverPickupStatus(
        assignmentId,
        {
          pickupStatus: newStatus,
        }
      );

      if (response.data.success) {
        setAssignments((prev) =>
          prev.map((assignment) =>
            assignment._id === assignmentId
              ? { ...assignment, pickupStatus: newStatus }
              : assignment
          )
        );
        alert(`Pickup status updated to ${newStatus}`);
        fetchAssignments();
      }
    } catch (error) {
      console.error("Error updating pickup status:", error);
      alert(error.response?.data?.message || "Failed to update pickup status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeliveryStatusUpdate = async (assignmentId, newStatus) => {
    setIsUpdating(true);
    try {
      const response = await assignmentAPI.updateSubdriverDeliveryStatus(
        assignmentId,
        {
          deliveryStatus: newStatus,
        }
      );

      if (response.data.success) {
        setAssignments((prev) =>
          prev.map((assignment) =>
            assignment._id === assignmentId
              ? { ...assignment, deliveryStatus: newStatus }
              : assignment
          )
        );
        alert(`Delivery status updated to ${newStatus}`);
        fetchAssignments();
      }
    } catch (error) {
      console.error("Error updating delivery status:", error);
      alert(
        error.response?.data?.message || "Failed to update delivery status"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "text-gray-800 bg-gray-200";
      case "In Progress":
        return "text-gray-700 bg-gray-100";
      case "Pending":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="w-4 h-4" />;
      case "In Progress":
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case "Pending":
        return <XCircle className="w-4 h-4" />;
      default:
        return <XCircle className="w-4 h-4" />;
    }
  };

  // Filter assignments based on search term
  const filteredAssignments = assignments.filter((assignment) => {
    const studentName =
      assignment.studentId?.studentGivenName &&
      assignment.studentId?.studentFamilyName
        ? `${assignment.studentId.studentGivenName} ${assignment.studentId.studentFamilyName}`.toLowerCase()
        : "";
    const studentNo = assignment.studentId?.studentNo?.toLowerCase() || "";
    const flight = assignment.studentId?.flight?.toLowerCase() || "";

    return (
      studentName.includes(searchTerm.toLowerCase()) ||
      studentNo.includes(searchTerm.toLowerCase()) ||
      flight.includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 overflow-x-hidden ml-0 md:ml-64 min-h-screen">
        {/* Header */}
        <div className="bg-white px-4 md:px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
              Subdriver Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-600">Subdriver</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4 md:p-6 overflow-x-hidden bg-white">
          <div className="max-w-7xl mx-auto">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-gray-50 border-gray-300">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">
                        {showCompletedTasks
                          ? "Total Completed"
                          : "Total Assignments"}
                      </p>
                      <p className="text-2xl font-bold text-blue-900">
                        {totalAssignments}
                      </p>
                    </div>
                    <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {showCompletedTasks ? (
                <>
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-600">
                            Pickups Completed
                          </p>
                          <p className="text-2xl font-bold text-green-900">
                            {
                              assignments.filter(
                                (a) => a.pickupStatus === "Completed"
                              ).length
                            }
                          </p>
                        </div>
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-purple-50 border-purple-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-purple-600">
                            Deliveries Completed
                          </p>
                          <p className="text-2xl font-bold text-purple-900">
                            {
                              assignments.filter(
                                (a) => a.deliveryStatus === "Completed"
                              ).length
                            }
                          </p>
                        </div>
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-orange-50 border-orange-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-orange-600">
                            Fully Completed
                          </p>
                          <p className="text-2xl font-bold text-orange-900">
                            {
                              assignments.filter(
                                (a) =>
                                  a.pickupStatus === "Completed" &&
                                  a.deliveryStatus === "Completed"
                              ).length
                            }
                          </p>
                        </div>
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <>
                  <Card className="bg-yellow-50 border-yellow-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-yellow-600">
                            Pending Pickup
                          </p>
                          <p className="text-2xl font-bold text-yellow-900">
                            {
                              assignments.filter(
                                (a) => a.pickupStatus === "Pending"
                              ).length
                            }
                          </p>
                        </div>
                        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                          <XCircle className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-600">
                            Completed Pickup
                          </p>
                          <p className="text-2xl font-bold text-green-900">
                            {
                              assignments.filter(
                                (a) => a.pickupStatus === "Completed"
                              ).length
                            }
                          </p>
                        </div>
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-purple-50 border-purple-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-purple-600">
                            Completed Delivery
                          </p>
                          <p className="text-2xl font-bold text-purple-900">
                            {
                              assignments.filter(
                                (a) => a.deliveryStatus === "Completed"
                              ).length
                            }
                          </p>
                        </div>
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* Search and Filter Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Search students, flights..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      className="pl-10 w-full sm:w-64"
                    />
                  </div>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    className="w-full sm:w-auto"
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <Button
                    variant={showCompletedTasks ? "outline" : "default"}
                    onClick={() => setShowCompletedTasks(false)}
                    className="text-sm"
                  >
                    Active Tasks
                  </Button>
                  <Button
                    variant={showCompletedTasks ? "default" : "outline"}
                    onClick={() => setShowCompletedTasks(true)}
                    className="text-sm"
                  >
                    Completed Tasks
                  </Button>
                </div>
              </div>
            </div>

            {/* Assignments Table */}
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {showCompletedTasks
                      ? "Completed Tasks"
                      : "Active Assignments"}
                  </h2>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    <span className="ml-2 text-gray-600">
                      {showCompletedTasks
                        ? "Loading completed tasks..."
                        : "Loading assignments..."}
                    </span>
                  </div>
                ) : filteredAssignments.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">
                      {searchTerm
                        ? "No completed tasks found matching your search."
                        : showCompletedTasks
                        ? "No completed tasks found for this date."
                        : "No active assignments found for this date."}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Excel Order
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Student
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Flight Number
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Arrival Time
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Pickup Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Delivery Status
                          </th>
                          {!showCompletedTasks && (
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          )}
                          {showCompletedTasks && (
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Completion Time
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredAssignments.map((assignment) => (
                          <tr key={assignment._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {assignment.studentId?.excelOrder ||
                                  assignment._id.slice(-6)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {assignment.studentId?.studentGivenName &&
                                  assignment.studentId?.studentFamilyName
                                    ? `${assignment.studentId.studentGivenName} ${assignment.studentId.studentFamilyName}`
                                    : "N/A"}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {assignment.studentId?.studentNo || "N/A"}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {assignment.studentId?.flight || "N/A"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {formatTimeToAMPM(
                                  assignment.studentId?.arrivalTime
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                  assignment.pickupStatus
                                )}`}
                              >
                                {getStatusIcon(assignment.pickupStatus)}
                                <span className="ml-1">
                                  {assignment.pickupStatus || "Pending"}
                                </span>
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                  assignment.deliveryStatus
                                )}`}
                              >
                                {getStatusIcon(assignment.deliveryStatus)}
                                <span className="ml-1">
                                  {assignment.deliveryStatus || "Pending"}
                                </span>
                              </span>
                            </td>
                            {!showCompletedTasks && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() =>
                                      handlePickupStatusUpdate(
                                        assignment._id,
                                        "Completed"
                                      )
                                    }
                                    disabled={
                                      isUpdating ||
                                      assignment.pickupStatus === "Completed"
                                    }
                                    className="text-xs"
                                  >
                                    Mark Picked Up
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() =>
                                      handleDeliveryStatusUpdate(
                                        assignment._id,
                                        "Completed"
                                      )
                                    }
                                    disabled={
                                      isUpdating ||
                                      assignment.deliveryStatus === "Completed"
                                    }
                                    className="text-xs"
                                  >
                                    Mark Delivered
                                  </Button>
                                </div>
                              </td>
                            )}
                            {showCompletedTasks && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="text-xs">
                                  {assignment.pickupTime && (
                                    <div className="mb-1">
                                      <span className="font-medium">
                                        Pickup:
                                      </span>{" "}
                                      {new Date(
                                        assignment.pickupTime
                                      ).toLocaleTimeString("en-CA", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        second: "2-digit",
                                        hour12: true,
                                        timeZone: "America/Vancouver",
                                      })}
                                    </div>
                                  )}
                                  {assignment.deliveryTime && (
                                    <div>
                                      <span className="font-medium">
                                        Delivery:
                                      </span>{" "}
                                      {new Date(
                                        assignment.deliveryTime
                                      ).toLocaleTimeString("en-CA", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        second: "2-digit",
                                        hour12: true,
                                        timeZone: "America/Vancouver",
                                      })}
                                    </div>
                                  )}
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
