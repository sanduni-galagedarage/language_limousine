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
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);

  // Fetch data on component mount and when date changes
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

  // Format Excel numeric time (fraction of a day) or plain time strings to HH:MM
  const formatTimeHM = (value) => {
    if (value === null || value === undefined) return "N/A";
    // If already a time-like string with ':' return trimmed value
    if (typeof value === "string" && value.includes(":")) {
      const v = value.trim();
      if (v.length === 0) return "N/A";
      return v;
    }
    const num = typeof value === "number" ? value : parseFloat(value);
    if (!isNaN(num) && isFinite(num)) {
      // Excel stores time as fraction of 24 hours
      let totalMinutes = Math.round(num * 24 * 60);
      // Normalize within 0-1440
      totalMinutes = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
      return `${pad(hours)}:${pad(minutes)}`;
    }
    return "N/A";
  };

  const fetchAssignments = async () => {
    setIsLoading(true);
    try {
      const apiFunction = showCompletedTasks
        ? assignmentAPI.getDriverCompletedTasks
        : assignmentAPI.getDriverAssignments;

      const response = await apiFunction({
        page: currentPage,
        limit: entriesPerPage,
        date: selectedDate,
      });

      if (response.data.success) {
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
      const response = await assignmentAPI.updatePickupStatus(assignmentId, {
        pickupStatus: newStatus,
      });

      if (response.data.success) {
        // Update the local state
        setAssignments((prev) =>
          prev.map((assignment) =>
            assignment._id === assignmentId
              ? { ...assignment, pickupStatus: newStatus }
              : assignment
          )
        );
        alert(`Pickup status updated to ${newStatus}`);
        // Re-fetch to ensure counts and any derived fields are accurate
        fetchAssignments();
      }
    } catch (error) {
      console.error("Error updating pickup status:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update pickup status";
      alert(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeliveryStatusUpdate = async (assignmentId, newStatus) => {
    setIsUpdating(true);
    try {
      const response = await assignmentAPI.updateDeliveryStatus(assignmentId, {
        deliveryStatus: newStatus,
      });

      if (response.data.success) {
        // Update the local state
        setAssignments((prev) =>
          prev.map((assignment) =>
            assignment._id === assignmentId
              ? { ...assignment, deliveryStatus: newStatus }
              : assignment
          )
        );
        alert(`Delivery status updated to ${newStatus}`);
        // Re-fetch to ensure counts and any derived fields are accurate
        fetchAssignments();
      }
    } catch (error) {
      console.error("Error updating delivery status:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update delivery status";
      alert(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  // Filter assignments based on search term
  const filteredAssignments = assignments.filter(
    (assignment) =>
      assignment.studentId?.studentGivenName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      assignment.studentId?.studentNo
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      assignment.studentId?.flight
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  // Pagination
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const currentAssignments = filteredAssignments;

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleEntriesPerPageChange = (e) => {
    setEntriesPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  return (
    <div className="flex min-h-screen bg-white overflow-x-hidden">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 overflow-x-hidden ml-0 md:ml-64 min-h-screen w-full">
        {/* Header */}
        <div className="bg-white px-4 md:px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto gap-4">
            {/* Title */}
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
              Driver Dashboard {showCompletedTasks && "- Completed Tasks"}
            </h1>

            {/* Date Selector */}
            <div className="flex items-center space-x-4">
              <label className="text-gray-700 text-sm font-medium">Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="bg-white text-gray-900 border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>

            {/* Completed Tasks Toggle */}
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => {
                  setShowCompletedTasks(!showCompletedTasks);
                  setCurrentPage(1);
                }}
                variant={showCompletedTasks ? "default" : "outline"}
                className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded text-sm"
              >
                {showCompletedTasks ? "Show All Tasks" : "Show Completed Tasks"}
              </Button>
            </div>

            {/* Search Bar */}
            <div className="relative flex-1 w-full max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Type to search..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full bg-gray-50 text-gray-900 pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-sm"
              />
            </div>

            {/* Driver User */}
            <div className="flex items-center space-x-3">
              <span className="text-gray-900 font-medium text-sm md:text-base">
                Driver User
              </span>
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
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
                          ? "Completed Tasks"
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

              {!showCompletedTasks && (
                <>
                  <Card className="bg-gray-50 border-gray-300">
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
                        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                          <XCircle className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-50 border-gray-300">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Completed Pickup
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {
                              assignments.filter(
                                (a) => a.pickupStatus === "Completed"
                              ).length
                            }
                          </p>
                        </div>
                        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-50 border-gray-300">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Completed Delivery
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {
                              assignments.filter(
                                (a) => a.deliveryStatus === "Completed"
                              ).length
                            }
                          </p>
                        </div>
                        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {showCompletedTasks && (
                <>
                  <Card className="bg-gray-50 border-gray-300">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Completed Pickups
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {
                              assignments.filter(
                                (a) => a.pickupStatus === "Completed"
                              ).length
                            }
                          </p>
                        </div>
                        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-50 border-gray-300">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Completed Deliveries
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {
                              assignments.filter(
                                (a) => a.deliveryStatus === "Completed"
                              ).length
                            }
                          </p>
                        </div>
                        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-50 border-gray-300">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Fully Completed
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {
                              assignments.filter(
                                (a) =>
                                  a.pickupStatus === "Completed" &&
                                  a.deliveryStatus === "Completed"
                              ).length
                            }
                          </p>
                        </div>
                        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* Control Section */}
            <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <span className="text-gray-900 text-sm">Show</span>
                <select
                  value={entriesPerPage}
                  onChange={handleEntriesPerPageChange}
                  className="bg-white text-gray-900 border border-gray-300 rounded px-3 py-1 text-sm"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-gray-900 text-sm">entries</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-900 text-sm">Search:</span>
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="bg-white text-gray-900 border border-gray-300 rounded px-3 py-1 text-sm w-full sm:w-48"
                />
              </div>
            </div>

            {/* Assignments Table */}
            <Card className="bg-white border-gray-200 overflow-hidden shadow-sm">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1600px]">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-gray-700 font-medium text-left px-2 md:px-4 py-3 border-b border-gray-200">
                          <span className="text-xs md:text-sm">Pick Up</span>
                        </th>
                        <th className="text-gray-700 font-medium text-left px-2 md:px-4 py-3 border-b border-gray-200">
                          <span className="text-xs md:text-sm">Delivered</span>
                        </th>
                        <th className="text-gray-700 font-medium text-left px-2 md:px-4 py-3 border-b border-gray-200">
                          <span className="text-xs md:text-sm">Trip</span>
                        </th>
                        <th className="text-gray-700 font-medium text-left px-2 md:px-4 py-3 border-b border-gray-200">
                          <span className="text-xs md:text-sm">Arr Time</span>
                        </th>
                        <th className="text-gray-700 font-medium text-left px-2 md:px-4 py-3 border-b border-gray-200">
                          <span className="text-xs md:text-sm">Flight #</span>
                        </th>
                        <th className="text-gray-700 font-medium text-left px-2 md:px-4 py-3 border-b border-gray-200">
                          <span className="text-xs md:text-sm">D/I</span>
                        </th>
                        <th className="text-gray-700 font-medium text-left px-2 md:px-4 py-3 border-b border-gray-200">
                          <span className="text-xs md:text-sm">M or F</span>
                        </th>
                        <th className="text-gray-700 font-medium text-left px-2 md:px-4 py-3 border-b border-gray-200">
                          <span className="text-xs md:text-sm">Student Numb</span>
                        </th>
                        <th className="text-gray-700 font-medium text-left px-2 md:px-4 py-3 border-b border-gray-200">
                          <span className="text-xs md:text-sm">Student Given Name</span>
                        </th>
                        <th className="text-gray-700 font-medium text-left px-2 md:px-4 py-3 border-b border-gray-200">
                          <span className="text-xs md:text-sm">Student Family Name</span>
                        </th>
                        <th className="text-gray-700 font-medium text-left px-2 md:px-4 py-3 border-b border-gray-200">
                          <span className="text-xs md:text-sm">Host Given Name</span>
                        </th>
                        <th className="text-gray-700 font-medium text-left px-2 md:px-4 py-3 border-b border-gray-200">
                          <span className="text-xs md:text-sm">Host Family Name</span>
                        </th>
                        <th className="text-gray-700 font-medium text-left px-2 md:px-4 py-3 border-b border-gray-200">
                          <span className="text-xs md:text-sm">Phone</span>
                        </th>
                        <th className="text-gray-700 font-medium text-left px-2 md:px-4 py-3 border-b border-gray-200">
                          <span className="text-xs md:text-sm">Address</span>
                        </th>
                        <th className="text-gray-700 font-medium text-left px-2 md:px-4 py-3 border-b border-gray-200">
                          <span className="text-xs md:text-sm">City</span>
                        </th>
                        <th className="text-gray-700 font-medium text-left px-2 md:px-4 py-3 border-b border-gray-200">
                          <span className="text-xs md:text-sm">Special Instructions</span>
                        </th>
                        <th className="text-gray-700 font-medium text-left px-2 md:px-4 py-3 border-b border-gray-200">
                          <span className="text-xs md:text-sm">Study Permit Y/N</span>
                        </th>
                        <th className="text-gray-700 font-medium text-left px-2 md:px-4 py-3 border-b border-gray-200">
                          <span className="text-xs md:text-sm">Client</span>
                        </th>
                        {!showCompletedTasks && (
                          <th className="text-gray-700 font-medium text-left px-2 md:px-4 py-3 border-b border-gray-200">
                            <span className="text-xs md:text-sm">Actions</span>
                          </th>
                        )}
                        {showCompletedTasks && (
                          <th className="text-gray-700 font-medium text-left px-2 md:px-4 py-3 border-b border-gray-200">
                            <span className="text-xs md:text-sm">Completion Time</span>
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        <tr className="border-gray-200">
                          <td
                            colSpan={showCompletedTasks ? 19 : 20}
                            className="text-gray-700 text-center py-8 px-4 border-b border-gray-200 text-sm"
                          >
                            <div className="flex items-center justify-center">
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Loading assignments...
                            </div>
                          </td>
                        </tr>
                      ) : currentAssignments.length > 0 ? (
                        currentAssignments.map((assignment) => (
                          <tr
                            key={assignment._id}
                            className="border-gray-200 hover:bg-gray-50 transition-colors"
                          >
                            <td className="text-gray-700 px-2 md:px-4 py-3 border-b border-gray-200 text-xs md:text-sm">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  assignment.pickupStatus === "Completed"
                                    ? "bg-gray-200 text-gray-800"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {assignment.pickupStatus}
                              </span>
                            </td>
                            <td className="text-gray-700 px-2 md:px-4 py-3 border-b border-gray-200 text-xs md:text-sm">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  assignment.deliveryStatus === "Completed"
                                    ? "bg-gray-200 text-gray-800"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {assignment.deliveryStatus}
                              </span>
                            </td>
                            <td className="text-gray-700 px-2 md:px-4 py-3 border-b border-gray-200 text-xs md:text-sm">
                              {assignment.studentId?.trip}
                            </td>
                            <td className="text-gray-700 px-2 md:px-4 py-3 border-b border-gray-200 text-xs md:text-sm">
                              {assignment.studentId?.actualArrivalTime || assignment.studentId?.arrivalTime}
                            </td>
                            <td className="text-gray-700 px-2 md:px-4 py-3 border-b border-gray-200 text-xs md:text-sm">
                              {assignment.studentId?.flight}
                            </td>
                            <td className="text-gray-700 px-2 md:px-4 py-3 border-b border-gray-200 text-xs md:text-sm">
                              {assignment.studentId?.dOrI}
                            </td>
                            <td className="text-gray-700 px-2 md:px-4 py-3 border-b border-gray-200 text-xs md:text-sm">
                              {assignment.studentId?.mOrF}
                            </td>
                            <td className="text-gray-700 px-2 md:px-4 py-3 border-b border-gray-200 text-xs md:text-sm">
                              {assignment.studentId?.studentNo}
                            </td>
                            <td className="text-gray-700 px-2 md:px-4 py-3 border-b border-gray-200 text-xs md:text-sm">
                              {assignment.studentId?.studentGivenName}
                            </td>
                            <td className="text-gray-700 px-2 md:px-4 py-3 border-b border-gray-200 text-xs md:text-sm">
                              {assignment.studentId?.studentFamilyName}
                            </td>
                            <td className="text-gray-700 px-2 md:px-4 py-3 border-b border-gray-200 text-xs md:text-sm">
                              {assignment.studentId?.hostGivenName}
                            </td>
                            <td className="text-gray-700 px-2 md:px-4 py-3 border-b border-gray-200 text-xs md:text-sm">
                              {assignment.studentId?.hostFamilyName}
                            </td>
                            <td className="text-gray-700 px-2 md:px-4 py-3 border-b border-gray-200 text-xs md:text-sm">
                              <div className="max-w-[120px] truncate">
                                {assignment.studentId?.phone && assignment.studentId.phone !== "N/A" ? (
                                  (() => {
                                    const numbersOnly = assignment.studentId.phone.replace(/[^0-9]/g, '');
                                    return numbersOnly ? (
                                      <a
                                        href={`tel:${numbersOnly}`}
                                        className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors"
                                        title={`Call ${numbersOnly}`}
                                      >
                                        {assignment.studentId.phone}
                                      </a>
                                    ) : (
                                      assignment.studentId.phone
                                    );
                                  })()
                                ) : (
                                  "N/A"
                                )}
                              </div>
                            </td>
                            <td className="text-gray-700 px-2 md:px-4 py-3 border-b border-gray-200 text-xs md:text-sm">
                              <div className="max-w-[150px] truncate">
                                {assignment.studentId?.address}
                              </div>
                            </td>
                            <td className="text-gray-700 px-2 md:px-4 py-3 border-b border-gray-200 text-xs md:text-sm">
                              {assignment.studentId?.city}
                            </td>
                            <td className="text-gray-700 px-2 md:px-4 py-3 border-b border-gray-200 text-xs md:text-sm">
                              <div className="max-w-[120px] truncate">
                                {assignment.studentId?.specialInstructions || '-'}
                              </div>
                            </td>
                            <td className="text-gray-700 px-2 md:px-4 py-3 border-b border-gray-200 text-xs md:text-sm">
                              {assignment.studentId?.studyPermit}
                            </td>
                            <td className="text-gray-700 px-2 md:px-4 py-3 border-b border-gray-200 text-xs md:text-sm">
                              {assignment.studentId?.client}
                            </td>
                            {!showCompletedTasks && (
                              <td className="text-gray-700 px-2 md:px-4 py-3 border-b border-gray-200 text-xs md:text-sm">
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
                              <td className="text-gray-700 px-2 md:px-4 py-3 border-b border-gray-200 text-xs md:text-sm">
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
                        ))
                      ) : (
                        <tr className="border-gray-200">
                          <td
                            colSpan={showCompletedTasks ? 19 : 20}
                            className="text-gray-700 text-center py-8 px-4 border-b border-gray-200 text-sm"
                          >
                            {totalAssignments === 0
                              ? showCompletedTasks
                                ? "No completed tasks found for today."
                                : "No assignments found for today."
                              : "No assignments found matching your search criteria."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Pagination */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-gray-700 text-sm order-2 sm:order-1">
                Showing {startIndex + 1} to{" "}
                {Math.min(endIndex, totalAssignments)} of {totalAssignments}{" "}
                entries
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2 order-1 sm:order-2">
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 sm:px-3 py-1 rounded text-xs sm:text-sm disabled:opacity-50"
                >
                  Prev
                </Button>
                {[...Array(Math.min(5, totalPages))].map((_, index) => {
                  const pageNumber =
                    currentPage <= 3 ? index + 1 : currentPage - 2 + index;
                  if (pageNumber > totalPages) return null;
                  return (
                    <Button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm ${
                        currentPage === pageNumber
                          ? "bg-black text-white"
                          : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                      }`}
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
                {totalPages > 5 && (
                  <>
                    <span className="text-gray-500 text-xs sm:text-sm">
                      ...
                    </span>
                    <Button
                      onClick={() => handlePageChange(totalPages)}
                      className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm ${
                        currentPage === totalPages
                          ? "bg-black text-white"
                          : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                      }`}
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || isLoading}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 sm:px-3 py-1 rounded text-xs sm:text-sm disabled:opacity-50"
                >
                  Next
                </Button>
              </div>
            </div>
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
