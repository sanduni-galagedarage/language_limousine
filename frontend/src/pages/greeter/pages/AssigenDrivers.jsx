import Sidebar from "../components/Sidebar";
import { useState, useEffect } from "react";
import {
  Search,
  User,
  Settings,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  Eye,
  Calendar,
  Car,
  Users,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { assignmentAPI } from "@/lib/api";
import axios from "axios";
import { API_BASE_URL } from "@/lib/config";
import { toast } from "react-toastify";

export default function AssignDrivers() {
  // Tab state
  const [activeTab, setActiveTab] = useState("assign");

  // Assignment tab states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDriver, setSelectedDriver] = useState("");
  const [selectedSubDriver, setSelectedSubDriver] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [studentsData, setStudentsData] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [subdrivers, setSubdrivers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedDate, setSelectedDate] = useState(""); // YYYY-MM-DD

  // Manage assignments tab states
  const [assignmentsData, setAssignmentsData] = useState([]);
  const [assignmentsPage, setAssignmentsPage] = useState(1);
  const [assignmentsPerPage, setAssignmentsPerPage] = useState(10);
  const [totalAssignments, setTotalAssignments] = useState(0);
  const [assignmentsPages, setAssignmentsPages] = useState(0);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [assignmentSearchTerm, setAssignmentSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Cancel confirmation modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [assignmentToCancel, setAssignmentToCancel] = useState(null);

  // Get auth token from sessionStorage (matching the RoleLogin component)
  const getAuthToken = () => {
    return (
      sessionStorage.getItem("user_token") ||
      sessionStorage.getItem("greeter_token") ||
      localStorage.getItem("authToken")
    );
  };

  // Configure axios defaults
  const apiClient = axios.create({
    baseURL: API_BASE_URL,
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

  // Add response interceptor to handle auth errors
  apiClient.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response?.status === 401) {
        setError("Access token required. Please log in again.");
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      }
      return Promise.reject(error);
    }
  );

  // Fetch data on component mount
  useEffect(() => {
    if (activeTab === "assign") {
      fetchAssignmentData();
    } else {
      fetchAssignmentsData();
    }
  }, [
    activeTab,
    currentPage,
    entriesPerPage,
    searchTerm,
    assignmentsPage,
    assignmentsPerPage,
    assignmentSearchTerm,
    selectedStatus,
    selectedDate,
  ]);

  const fetchAssignmentData = async () => {
    setIsLoading(true);
    setError("");

    try {
      const token = getAuthToken();
      if (!token) {
        setError("Access token required. Please log in again.");
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
        return;
      }

      // If date is not selected, clear students (do NOT show all)
      if (!selectedDate) {
        setStudentsData([]);
        setTotalStudents(0);
        setTotalPages(0);
      } else {
        // Fetch unassigned students only for the selected date
        const studentsResponse = await apiClient.get(
          "/greeter/unassigned-students",
          {
            params: {
              page: currentPage,
              limit: entriesPerPage,
              search: searchTerm,
              date: selectedDate,
            },
          }
        );

        if (studentsResponse.data.success) {
          setStudentsData(studentsResponse.data.data.students);
          setTotalStudents(studentsResponse.data.data.pagination.totalStudents);
          setTotalPages(studentsResponse.data.data.pagination.totalPages);
        }
      }

      // Fetch drivers and subdrivers regardless of date
      const driversResponse = await apiClient.get("/greeter/drivers");
      if (driversResponse.data.success) {
        setDrivers(driversResponse.data.data.drivers);
        setSubdrivers(driversResponse.data.data.subdrivers);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      let errorMessage = "Failed to fetch data";

      if (err.response?.status === 401) {
        errorMessage = "Access token required. Please log in again.";
        setTimeout(() => {
          window.location.href = "/";
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

  const fetchAssignmentsData = async () => {
    setIsLoadingAssignments(true);
    setError("");

    try {
      const token = getAuthToken();
      if (!token) {
        setError("Access token required. Please log in again.");
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
        return;
      }

      // Fetch assignments
      const assignmentsResponse = await apiClient.get("/greeter/assignments", {
        params: {
          page: assignmentsPage,
          limit: assignmentsPerPage,
          search: assignmentSearchTerm,
          status: selectedStatus,
          date: selectedDate,
        },
      });

      if (assignmentsResponse.data.success) {
        const assignments = assignmentsResponse.data.data.assignments;
        console.log("🔍 Frontend - Fetched assignments:", assignments);
        if (assignments.length > 0) {
          console.log(
            "🔍 Frontend - Sample assignment structure:",
            assignments[0]
          );
        }
        setAssignmentsData(assignments);
        setTotalAssignments(
          assignmentsResponse.data.data.pagination.totalAssignments
        );
        setAssignmentsPages(
          assignmentsResponse.data.data.pagination.totalPages
        );
      }
    } catch (err) {
      console.error("Error fetching assignments:", err);
      let errorMessage = "Failed to fetch assignments";

      if (err.response?.status === 401) {
        errorMessage = "Access token required. Please log in again.";
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoadingAssignments(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleAssignmentSearchChange = (e) => {
    setAssignmentSearchTerm(e.target.value);
    setAssignmentsPage(1);
  };

  const handleDriverChange = (e) => {
    setSelectedDriver(e.target.value);
    if (e.target.value) {
      setSelectedSubDriver(""); // Clear subdriver when driver is selected
    }
    // Clear messages when selection changes
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubDriverChange = (e) => {
    setSelectedSubDriver(e.target.value);
    if (e.target.value) {
      setSelectedDriver(""); // Clear driver when subdriver is selected
    }
    // Clear messages when selection changes
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleCheckboxChange = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
    // Clear messages when selection changes
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSelectAllStudents = (e) => {
    if (e.target.checked) {
      const allStudentIds = studentsData.map((student) => student._id);
      setSelectedStudents(allStudentIds);
    } else {
      setSelectedStudents([]);
    }
  };

  const validateAssignment = () => {
    setError("");
    setSuccess("");

    if (!selectedDate) {
      setError("Please select a date before assigning students");
      return false;
    }

    if (selectedStudents.length === 0) {
      setError("Please select at least one student");
      return false;
    }

    if (!selectedDriver && !selectedSubDriver) {
      setError("Please select either a driver or subdriver");
      return false;
    }

    if (selectedDriver && selectedSubDriver) {
      setError("Please select either a driver OR subdriver, not both");
      return false;
    }

    return true;
  };

  const handleAssign = async () => {
    if (!validateAssignment()) {
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setError("Access token required. Please log in again.");
      toast.error("Access token required. Please log in again.");
      return;
    }

    setIsAssigning(true);
    setError("");
    setSuccess("");

    try {
      const assignmentData = {
        studentIds: selectedStudents,
        driverId: selectedDriver || null,
        subdriverId: selectedSubDriver || null,
        notes: notes.trim(),
        assignmentDate: selectedDate || undefined,
      };

      const response = await apiClient.post(
        "/greeter/assignments",
        assignmentData
      );

      if (response.data.success) {
        const successMessage =
          response.data.message ||
          `Successfully assigned ${selectedStudents.length} student(s)!`;
        setSuccess(successMessage);
        toast.success(successMessage, {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
          style: {
            borderRadius: "10px",
            background: "#4BB543",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "15px",
          },
          icon: "✅",
        });

        // Clear selections and refresh data
        setSelectedStudents([]);
        setSelectedDriver("");
        setSelectedSubDriver("");
        setNotes("");

        // Refresh the list to remove assigned students
        await fetchAssignmentData();
      }
    } catch (err) {
      console.error("Error assigning students:", err);
      let errorMessage = "Failed to assign students. Please try again.";

      if (err.response?.status === 401) {
        errorMessage = "Access token required. Please log in again.";
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      } else if (err.response?.status === 403) {
        errorMessage = "You don't have permission to perform this action.";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.request) {
        errorMessage =
          "Network error. Please check your connection and try again.";
      }

      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsAssigning(false);
    }
  };

  // Open cancel confirmation modal
  const handleCancelAssignmentClick = (assignment) => {
    setAssignmentToCancel(assignment);
    setShowCancelModal(true);
  };

  // Close cancel confirmation modal
  const closeCancelModal = () => {
    setShowCancelModal(false);
    setAssignmentToCancel(null);
  };

  // Confirm and execute cancel assignment
  const confirmCancelAssignment = async () => {
    if (!assignmentToCancel) return;

    const token = getAuthToken();
    if (!token) {
      toast.error("Access token required. Please log in again.");
      closeCancelModal();
      return;
    }

    setIsCancelling(true);
    setCancellingId(assignmentToCancel._id);

    try {
      console.log(
        "🔍 Frontend - Cancelling assignment with ID:",
        assignmentToCancel._id
      );
      console.log("🔍 Frontend - Full assignment object:", assignmentToCancel);

      const response = await apiClient.delete(
        `/greeter/assignments/${assignmentToCancel._id}`
      );

      if (response.data.success) {
        toast.success("Assignment cancelled successfully!", {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
          style: {
            borderRadius: "10px",
            background: "#4BB543",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "15px",
          },
          icon: "✅",
        });

        // Close modal and refresh assignments data
        closeCancelModal();
        await fetchAssignmentsData();

        // If we're on assign tab, also refresh unassigned students
        if (activeTab === "assign") {
          await fetchAssignmentData();
        }
      }
    } catch (err) {
      console.error("Error cancelling assignment:", err);
      let errorMessage = "Failed to cancel assignment. Please try again.";

      if (err.response?.status === 401) {
        errorMessage = "Access token required. Please log in again.";
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      } else if (err.response?.status === 403) {
        errorMessage = "You don't have permission to cancel this assignment.";
      } else if (err.response?.status === 404) {
        errorMessage = "Assignment not found or already cancelled.";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.request) {
        errorMessage =
          "Network error. Please check your connection and try again.";
      }

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    } finally {
      setIsCancelling(false);
      setCancellingId(null);
      closeCancelModal();
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleAssignmentsPageChange = (page) => {
    setAssignmentsPage(page);
  };

  const handleEntriesPerPageChange = (e) => {
    setEntriesPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const handleAssignmentsPerPageChange = (e) => {
    setAssignmentsPerPage(parseInt(e.target.value));
    setAssignmentsPage(1);
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setCurrentPage(1);
    setAssignmentsPage(1);
    setSelectedStudents([]);
    if (error) setError("");
    if (success) setSuccess("");
  };

  // Calculate pagination info
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = Math.min(startIndex + entriesPerPage, totalStudents);
  const assignmentsStartIndex = (assignmentsPage - 1) * assignmentsPerPage;
  const assignmentsEndIndex = Math.min(
    assignmentsStartIndex + assignmentsPerPage,
    totalAssignments
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-gray-200 text-gray-800";
      case "in_progress":
        return "bg-gray-100 text-gray-700";
      case "cancelled":
        return "bg-gray-300 text-gray-900";
      case "pending":
        return "bg-gray-100 text-gray-600";
      case "assigned":
        return "bg-gray-200 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusDisplay = (status) => {
    if (!status) return "ACTIVE";
    return status.replace("_", " ").toUpperCase();
  };

  const getPickupStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-gray-200 text-gray-800";
      case "in_progress":
        return "bg-gray-100 text-gray-700";
      case "not_started":
        return "bg-gray-100 text-gray-800";
      case "pending":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 overflow-x-hidden ml-0 md:ml-64 min-h-screen w-full">
        {/* Header */}
        <div className="bg-white px-4 md:px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto gap-4">
            {/* Search Bar */}
            <div className="relative flex-1 w-full max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Type to search..."
                value={
                  activeTab === "assign" ? searchTerm : assignmentSearchTerm
                }
                onChange={
                  activeTab === "assign"
                    ? handleSearchChange
                    : handleAssignmentSearchChange
                }
                className="w-full bg-gray-50 text-gray-900 pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-sm"
                disabled={isLoading || isLoadingAssignments}
              />
            </div>

            {/* Greeter User */}
            <div className="flex items-center space-x-3">
              <span className="text-gray-900 font-medium text-sm md:text-base">
                Greeter User
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
            {/* Page Title */}
            <h1 className="text-2xl font-semibold text-blue-500 mb-6">
              Driver Assignment Management
            </h1>

            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
              <button
                onClick={() => setActiveTab("assign")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "assign"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Users className="inline-block w-4 h-4 mr-2" />
                Assign Students
              </button>
              <button
                onClick={() => setActiveTab("manage")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "manage"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Eye className="inline-block w-4 h-4 mr-2" />
                Manage Assignments
              </button>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <span className="text-red-700">{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-300 rounded-lg flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-green-700">{success}</span>
              </div>
            )}

            {/* Assign Students Tab */}
            {activeTab === "assign" && (
              <>
                {/* Driver Selection Section */}
                <Card className="bg-white border-gray-200 mb-6 shadow-sm">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                      {/* Select Date for Assignment */}
                      <div className="flex flex-col">
                        <label className="text-gray-700 text-sm font-medium mb-2">
                          Select Date
                        </label>
                        <Input
                          type="date"
                          value={selectedDate}
                          onChange={handleDateChange}
                          className="bg-white text-gray-900 border border-gray-300 rounded px-4 py-3 text-sm focus:border-blue-500 focus:ring-blue-500"
                          disabled={isLoading || isAssigning}
                        />
                      </div>

                      <div className="flex flex-col">
                        <label className="text-gray-700 text-sm font-medium mb-2">
                          Select Driver
                        </label>
                        <select
                          value={selectedDriver}
                          onChange={handleDriverChange}
                          className="bg-white text-gray-900 border border-gray-300 rounded px-4 py-3 text-sm focus:border-blue-500 focus:ring-blue-500"
                          disabled={isLoading || isAssigning}
                        >
                          <option value="">-- Select Driver --</option>
                          {drivers.map((driver) => (
                            <option key={driver._id} value={driver._id}>
                              {driver.username} ({driver.driverID}) -{" "}
                              {driver.vehicleNumber}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col">
                        <label className="text-gray-700 text-sm font-medium mb-2">
                          Select Sub Driver
                        </label>
                        <select
                          value={selectedSubDriver}
                          onChange={handleSubDriverChange}
                          className="bg-white text-gray-900 border border-gray-300 rounded px-4 py-3 text-sm focus:border-blue-500 focus:ring-blue-500"
                          disabled={isLoading || isAssigning}
                        >
                          <option value="">-- Select Sub Driver --</option>
                          {subdrivers.map((subdriver) => (
                            <option key={subdriver._id} value={subdriver._id}>
                              {subdriver.username} ({subdriver.subdriverID}) -{" "}
                              {subdriver.vehicleNumber}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col">
                        <label className="text-gray-700 text-sm font-medium mb-2">
                          Notes (Optional)
                        </label>
                        <Input
                          type="text"
                          placeholder="Add assignment notes..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="bg-white text-gray-900 border border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          disabled={isLoading || isAssigning}
                        />
                      </div>

                      <div className="flex flex-col justify-end">
                        <Button
                          onClick={handleAssign}
                          disabled={
                            isAssigning ||
                            isLoading ||
                            selectedStudents.length === 0
                          }
                          className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isAssigning ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Assigning...
                            </>
                          ) : (
                            `Assign ${
                              selectedStudents.length > 0
                                ? `(${selectedStudents.length})`
                                : ""
                            }`
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Control Section */}
                <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-900 text-sm">Show</span>
                    <select
                      value={entriesPerPage}
                      onChange={handleEntriesPerPageChange}
                      className="bg-white text-gray-900 border border-gray-300 rounded px-3 py-1 text-sm"
                      disabled={isLoading || !selectedDate}
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                    <span className="text-gray-900 text-sm">entries</span>
                    <span className="text-gray-500 text-sm ml-4">
                      (Total: {totalStudents} unassigned students)
                    </span>
                  </div>
                </div>

                {/* Students Table */}
                <Card className="bg-white border-gray-200 overflow-hidden shadow-sm">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[1400px]">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="text-gray-700 font-medium text-left px-2 md:px-4 py-3 border-b border-gray-200">
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  onChange={handleSelectAllStudents}
                                  checked={
                                    studentsData.length > 0 &&
                                    selectedStudents.length ===
                                      studentsData.length
                                  }
                                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 mr-2"
                                  disabled={
                                    isLoading || studentsData.length === 0
                                  }
                                />
                                <span className="text-xs md:text-sm">
                                  Select All
                                </span>
                              </div>
                            </th>
                            <th className="text-gray-700 font-medium text-left px-2 md:px-4 py-3 border-b border-gray-200">
                              <span className="text-xs md:text-sm">
                                Trip
                              </span>
                            </th>
                            <th className="text-gray-700 font-medium text-left px-2 md:px-4 py-3 border-b border-gray-200">
                              <span className="text-xs md:text-sm">
                                Arr Time
                              </span>
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
                              <span className="text-xs md:text-sm">
                                Student Numb
                              </span>
                            </th>
                            <th className="text-gray-700 font-medium text-left px-2 md:px-4 py-3 border-b border-gray-200">
                              <span className="text-xs md:text-sm">
                                Student Given Name
                              </span>
                            </th>
                            <th className="text-gray-700 font-medium text-left px-2 md:px-4 py-3 border-b border-gray-200">
                              <span className="text-xs md:text-sm">
                                Student Family Name
                              </span>
                            </th>
                            <th className="text-gray-700 font-medium text-left px-2 md:px-4 py-3 border-b border-gray-200">
                              <span className="text-xs md:text-sm">
                                Host Given Name
                              </span>
                            </th>
                            <th className="text-gray-700 font-medium text-left px-2 md:px-4 py-3 border-b border-gray-200">
                              <span className="text-xs md:text-sm">
                                Host Family Name
                              </span>
                            </th>
                            <th className="text-gray-700 font-medium text-left px-2 md:px-4 py-3 border-b border-gray-200">
                              <span className="text-xs md:text-sm">
                                Phone
                              </span>
                            </th>
                            <th className="text-gray-700 font-medium text-left px-2 md:px-4 py-3 border-b border-gray-200">
                              <span className="text-xs md:text-sm">
                                Address
                              </span>
                            </th>
                            <th className="text-gray-700 font-medium text-left px-2 md:px-4 py-3 border-b border-gray-200">
                              <span className="text-xs md:text-sm">
                                City
                              </span>
                            </th>
                            <th className="text-gray-700 font-medium text-left px-2 md:px-4 py-3 border-b border-gray-200">
                              <span className="text-xs md:text-sm">
                                Special Instructions
                              </span>
                            </th>
                            <th className="text-gray-700 font-medium text-left px-2 md:px-4 py-3 border-b border-gray-200">
                              <span className="text-xs md:text-sm">
                                Study Permit Y/N
                              </span>
                            </th>
                            <th className="text-gray-700 font-medium text-left px-2 md:px-4 py-3 border-b border-gray-200">
                              <span className="text-xs md:text-sm">
                                Client
                              </span>
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {isLoading ? (
                            <tr className="border-gray-200">
                              <td
                                colSpan={18}
                                className="text-gray-700 text-center py-8 px-4 border-b border-gray-200 text-sm"
                              >
                                <div className="flex items-center justify-center">
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Loading students...
                                </div>
                              </td>
                            </tr>
                          ) : studentsData.length > 0 ? (
                            studentsData.map((student) => (
                              <tr
                                key={student._id}
                                className="border-gray-200 hover:bg-gray-50 transition-colors"
                              >
                                <td className="px-2 md:px-4 py-3 border-b border-gray-200">
                                  <input
                                    type="checkbox"
                                    checked={selectedStudents.includes(
                                      student._id
                                    )}
                                    onChange={() =>
                                      handleCheckboxChange(student._id)
                                    }
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                    disabled={isAssigning}
                                  />
                                </td>
                                <td className="text-gray-700 px-2 md:px-4 py-3 border-b border-gray-200 text-xs md:text-sm">
                                  {student.trip}
                                </td>
                                <td className="text-gray-700 px-2 md:px-4 py-3 border-b border-gray-200 text-xs md:text-sm">
                                  {student.actualArrivalTime || student.arrivalTime}
                                </td>
                                <td className="text-gray-700 px-2 md:px-4 py-3 border-b border-gray-200 text-xs md:text-sm">
                                  {student.flight}
                                </td>
                                <td className="text-gray-700 px-2 md:px-4 py-3 border-b border-gray-200 text-xs md:text-sm">
                                  {student.dOrI}
                                </td>
                                <td className="text-gray-700 px-2 md:px-4 py-3 border-b border-gray-200 text-xs md:text-sm">
                                  {student.mOrF}
                                </td>
                                <td className="text-gray-700 px-2 md:px-4 py-3 border-b border-gray-200 text-xs md:text-sm">
                                  {student.studentNo}
                                </td>
                                <td className="text-gray-700 px-2 md:px-4 py-3 border-b border-gray-200 text-xs md:text-sm">
                                  {student.studentGivenName}
                                </td>
                                <td className="text-gray-700 px-2 md:px-4 py-3 border-b border-gray-200 text-xs md:text-sm">
                                  {student.studentFamilyName}
                                </td>
                                <td className="text-gray-700 px-2 md:px-4 py-3 border-b border-gray-200 text-xs md:text-sm">
                                  {student.hostGivenName}
                                </td>
                                <td className="text-gray-700 px-2 md:px-4 py-3 border-b border-gray-200 text-xs md:text-sm">
                                  {student.hostFamilyName}
                                </td>
                                <td className="text-gray-700 px-2 md:px-4 py-3 border-b border-gray-200 text-xs md:text-sm">
                                  <div className="max-w-[120px] truncate">
                                    {student.phone && student.phone !== "N/A" ? (
                                      (() => {
                                        const numbersOnly = student.phone.replace(/[^0-9]/g, '');
                                        return numbersOnly ? (
                                          <a
                                            href={`tel:${numbersOnly}`}
                                            className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors"
                                            title={`Call ${numbersOnly}`}
                                          >
                                            {student.phone}
                                          </a>
                                        ) : (
                                          student.phone
                                        );
                                      })()
                                    ) : (
                                      student.phone || "N/A"
                                    )}
                                  </div>
                                </td>
                                <td className="text-gray-700 px-2 md:px-4 py-3 border-b border-gray-200 text-xs md:text-sm">
                                  <div className="max-w-[150px] truncate">
                                    {student.address}
                                  </div>
                                </td>
                                <td className="text-gray-700 px-2 md:px-4 py-3 border-b border-gray-200 text-xs md:text-sm">
                                  {student.city}
                                </td>
                                <td className="text-gray-700 px-2 md:px-4 py-3 border-b border-gray-200 text-xs md:text-sm">
                                  <div className="max-w-[120px] truncate">
                                    {student.specialInstructions || '-'}
                                  </div>
                                </td>
                                <td className="text-gray-700 px-2 md:px-4 py-3 border-b border-gray-200 text-xs md:text-sm">
                                  {student.studyPermit}
                                </td>
                                <td className="text-gray-700 px-2 md:px-4 py-3 border-b border-gray-200 text-xs md:text-sm">
                                  {student.client}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr className="border-gray-200">
                              <td
                                colSpan={18}
                                className="text-gray-700 text-center py-8 px-4 border-b border-gray-200 text-sm"
                              >
                                {!selectedDate
                                  ? "Please select a date to view unassigned students."
                                  : totalStudents === 0
                                  ? "No unassigned students found for the selected date."
                                  : "No students found matching your search criteria."}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-gray-700 text-sm order-2 sm:order-1">
                      Showing {startIndex + 1} to {endIndex} of {totalStudents}{" "}
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
                          currentPage <= 3
                            ? index + 1
                            : currentPage - 2 + index;
                        if (pageNumber > totalPages || pageNumber < 1)
                          return null;
                        return (
                          <Button
                            key={pageNumber}
                            onClick={() => handlePageChange(pageNumber)}
                            disabled={isLoading}
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
                      {totalPages > 5 && currentPage < totalPages - 2 && (
                        <>
                          <span className="text-gray-500 text-xs sm:text-sm">
                            ...
                          </span>
                          <Button
                            onClick={() => handlePageChange(totalPages)}
                            disabled={isLoading}
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
                )}
              </>
            )}

            {/* Manage Assignments Tab */}
            {activeTab === "manage" && (
              <>
                {/* Control Section */}
                <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-900 text-sm">Show</span>
                    <select
                      value={assignmentsPerPage}
                      onChange={handleAssignmentsPerPageChange}
                      className="bg-white text-gray-900 border border-gray-300 rounded px-3 py-1 text-sm"
                      disabled={isLoadingAssignments}
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                    <span className="text-gray-900 text-sm">entries</span>
                    <span className="text-gray-500 text-sm ml-4">
                      (Total: {totalAssignments} assignments)
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Date Filter for Manage Assignments */}
                    <div className="flex items-center space-x-2">
                      <label className="text-gray-700 text-sm">Date</label>
                      <Input
                        type="date"
                        value={selectedDate}
                        onChange={handleDateChange}
                        className="bg-white text-gray-900 border border-gray-300 rounded px-3 py-1 text-sm"
                        disabled={isLoadingAssignments}
                      />
                    </div>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="bg-white text-gray-900 border border-gray-300 rounded px-3 py-1 text-sm"
                      disabled={isLoadingAssignments}
                    >
                      <option value="">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Assignments Table */}
                <Card className="bg-white border-gray-200 overflow-hidden shadow-sm">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[1000px]">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="text-gray-700 font-medium text-left px-4 py-3 border-b border-gray-200">
                              <span className="text-sm">Student</span>
                            </th>
                            <th className="text-gray-700 font-medium text-left px-4 py-3 border-b border-gray-200">
                              <span className="text-sm">Driver/Subdriver</span>
                            </th>
                            <th className="text-gray-700 font-medium text-left px-4 py-3 border-b border-gray-200">
                              <span className="text-sm">Status</span>
                            </th>
                            <th className="text-gray-700 font-medium text-left px-4 py-3 border-b border-gray-200">
                              <span className="text-sm">Pickup Status</span>
                            </th>
                            <th className="text-gray-700 font-medium text-left px-4 py-3 border-b border-gray-200">
                              <span className="text-sm">Delivery Status</span>
                            </th>
                            <th className="text-gray-700 font-medium text-left px-4 py-3 border-b border-gray-200">
                              <span className="text-sm">Assigned Date</span>
                            </th>
                            <th className="text-gray-700 font-medium text-left px-4 py-3 border-b border-gray-200">
                              <span className="text-sm">Actions</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {isLoadingAssignments ? (
                            <tr className="border-gray-200">
                              <td
                                colSpan={7}
                                className="text-gray-700 text-center py-8 px-4 border-b border-gray-200 text-sm"
                              >
                                <div className="flex items-center justify-center">
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Loading assignments...
                                </div>
                              </td>
                            </tr>
                          ) : assignmentsData.length > 0 ? (
                            assignmentsData.map((assignment) => (
                              <tr
                                key={assignment._id}
                                className="border-gray-200 hover:bg-gray-50 transition-colors"
                              >
                                <td className="px-4 py-3 border-b border-gray-200">
                                  <div>
                                    <div className="font-medium text-gray-900">
                                      {assignment.studentId?.studentGivenName}{" "}
                                      {assignment.studentId?.studentFamilyName}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {assignment.studentId?.studentNo} •{" "}
                                      {assignment.studentId?.flight}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3 border-b border-gray-200">
                                  <div>
                                    {assignment.driverId ? (
                                      <>
                                        <div className="font-medium text-gray-900">
                                          {assignment.driverId?.username}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                          Driver •{" "}
                                          {assignment.driverId?.vehicleNumber}
                                        </div>
                                      </>
                                    ) : assignment.subdriverId ? (
                                      <>
                                        <div className="font-medium text-gray-900">
                                          {assignment.subdriverId?.username}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                          Sub Driver •{" "}
                                          {
                                            assignment.subdriverId
                                              ?.vehicleNumber
                                          }
                                        </div>
                                      </>
                                    ) : (
                                      <span className="text-gray-400">
                                        No driver assigned
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3 border-b border-gray-200">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                      assignment.status
                                    )}`}
                                  >
                                    {getStatusDisplay(assignment.status)}
                                  </span>
                                </td>
                                <td className="px-4 py-3 border-b border-gray-200">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPickupStatusColor(
                                      assignment.pickupStatus
                                    )}`}
                                  >
                                    {assignment.pickupStatus
                                      ?.replace("_", " ")
                                      .toUpperCase() || "NOT STARTED"}
                                  </span>
                                </td>
                                <td className="px-4 py-3 border-b border-gray-200">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPickupStatusColor(
                                      assignment.deliveryStatus
                                    )}`}
                                  >
                                    {assignment.deliveryStatus
                                      ?.replace("_", " ")
                                      .toUpperCase() || "NOT STARTED"}
                                  </span>
                                </td>
                                <td className="px-4 py-3 border-b border-gray-200">
                                  <div className="text-sm text-gray-900">
                                    {new Date(
                                      assignment.createdAt
                                    ).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </div>
                                </td>
                                <td className="px-4 py-3 border-b border-gray-200">
                                  <div className="flex items-center space-x-2">
                                    {/* Show Cancel button for assignments that can be cancelled */}
                                    {((assignment.status?.toLowerCase() ===
                                      "assigned" &&
                                      assignment.pickupStatus?.toLowerCase() ===
                                        "pending" &&
                                      assignment.deliveryStatus?.toLowerCase() ===
                                        "pending") ||
                                      assignment.status?.toLowerCase() ===
                                        "pending" ||
                                      assignment.status?.toLowerCase() ===
                                        "in_progress" ||
                                      !assignment.status) && (
                                      <Button
                                        onClick={() =>
                                          handleCancelAssignmentClick(
                                            assignment
                                          )
                                        }
                                        disabled={
                                          isCancelling &&
                                          cancellingId === assignment._id
                                        }
                                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        {isCancelling &&
                                        cancellingId === assignment._id ? (
                                          <>
                                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                            Cancelling...
                                          </>
                                        ) : (
                                          <>
                                            <X className="mr-1 h-3 w-3" />
                                            Cancel
                                          </>
                                        )}
                                      </Button>
                                    )}

                                    {/* Show status indicators */}
                                    {assignment.status === "cancelled" && (
                                      <span className="text-xs text-gray-500 italic">
                                        Cancelled
                                      </span>
                                    )}
                                    {assignment.status === "completed" && (
                                      <span className="text-xs text-green-600 font-medium">
                                        ✓ Completed
                                      </span>
                                    )}

                                    {/* Show notes if available */}
                                    {assignment.notes && (
                                      <div
                                        className="text-xs text-gray-500 max-w-[100px] truncate"
                                        title={assignment.notes}
                                      >
                                        Note: {assignment.notes}
                                      </div>
                                    )}

                                    {/* Show default action for assignments without specific status */}
                                    {!assignment.status && (
                                      <span className="text-xs text-blue-600 font-medium">
                                        Active
                                      </span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr className="border-gray-200">
                              <td
                                colSpan={7}
                                className="text-gray-700 text-center py-8 px-4 border-b border-gray-200 text-sm"
                              >
                                {totalAssignments === 0
                                  ? "No assignments found."
                                  : "No assignments found matching your search criteria."}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Assignments Pagination */}
                {assignmentsPages > 1 && (
                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-gray-700 text-sm order-2 sm:order-1">
                      Showing {assignmentsStartIndex + 1} to{" "}
                      {assignmentsEndIndex} of {totalAssignments} entries
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2 order-1 sm:order-2">
                      <Button
                        onClick={() =>
                          handleAssignmentsPageChange(assignmentsPage - 1)
                        }
                        disabled={assignmentsPage === 1 || isLoadingAssignments}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 sm:px-3 py-1 rounded text-xs sm:text-sm disabled:opacity-50"
                      >
                        Prev
                      </Button>
                      {[...Array(Math.min(5, assignmentsPages))].map(
                        (_, index) => {
                          const pageNumber =
                            assignmentsPage <= 3
                              ? index + 1
                              : assignmentsPage - 2 + index;
                          if (pageNumber > assignmentsPages || pageNumber < 1)
                            return null;
                          return (
                            <Button
                              key={pageNumber}
                              onClick={() =>
                                handleAssignmentsPageChange(pageNumber)
                              }
                              disabled={isLoadingAssignments}
                              className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm ${
                                assignmentsPage === pageNumber
                                  ? "bg-black text-white"
                                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                              }`}
                            >
                              {pageNumber}
                            </Button>
                          );
                        }
                      )}
                      {assignmentsPages > 5 &&
                        assignmentsPage < assignmentsPages - 2 && (
                          <>
                            <span className="text-gray-500 text-xs sm:text-sm">
                              ...
                            </span>
                            <Button
                              onClick={() =>
                                handleAssignmentsPageChange(assignmentsPages)
                              }
                              disabled={isLoadingAssignments}
                              className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm ${
                                assignmentsPage === assignmentsPages
                                  ? "bg-black text-white"
                                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                              }`}
                            >
                              {assignmentsPages}
                            </Button>
                          </>
                        )}
                      <Button
                        onClick={() =>
                          handleAssignmentsPageChange(assignmentsPage + 1)
                        }
                        disabled={
                          assignmentsPage === assignmentsPages ||
                          isLoadingAssignments
                        }
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 sm:px-3 py-1 rounded text-xs sm:text-sm disabled:opacity-50"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
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

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Cancel Assignment
                </h3>
                <button
                  onClick={closeCancelModal}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                  disabled={isCancelling}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-3">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-gray-700">
                    Are you sure you want to cancel this assignment?
                  </p>
                </div>

                {assignmentToCancel && (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900 mb-1">
                        Student:{" "}
                        {assignmentToCancel.studentId?.studentGivenName}{" "}
                        {assignmentToCancel.studentId?.studentFamilyName}
                      </div>
                      <div className="text-gray-600 mb-1">
                        Student No: {assignmentToCancel.studentId?.studentNo}
                      </div>
                      <div className="text-gray-600 mb-1">
                        Flight: {assignmentToCancel.studentId?.flight}
                      </div>
                      <div className="text-gray-600">
                        {assignmentToCancel.driverId ? (
                          <>Driver: {assignmentToCancel.driverId?.username}</>
                        ) : (
                          <>
                            Sub Driver:{" "}
                            {assignmentToCancel.subdriverId?.username}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-sm text-gray-600 mt-3">
                  This action will return the student to the unassigned list and
                  cannot be undone.
                </p>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end space-x-3">
                <Button
                  onClick={closeCancelModal}
                  disabled={isCancelling}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded text-sm font-medium disabled:opacity-50"
                >
                  Keep Assignment
                </Button>
                <Button
                  onClick={confirmCancelAssignment}
                  disabled={isCancelling}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCancelling ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <X className="mr-2 h-4 w-4" />
                      Cancel Assignment
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
