import Sidebar from "../components/Sidebar";
import { useState, useEffect } from "react";
import {
  User,
  MessageSquare,
  Save,
  Info,
  AlertTriangle,
  Search,
  Calendar,
  Loader2,
  AlertCircle,
  CheckCircle,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { API_BASE_URL } from "@/lib/config";
import { toast } from "react-toastify";

export default function AbsentFeedbackGreeters() {
  const [studentsData, setStudentsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(""); // Backend format: MM/DD/YYYY
  const [dateInputValue, setDateInputValue] = useState(""); // HTML input format: YYYY-MM-DD
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Feedback dialog state
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackType, setFeedbackType] = useState("absent");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Set default date to today (America/Vancouver)
  useEffect(() => {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Vancouver",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());
    const get = (type) => parts.find((p) => p.type === type)?.value || "";
    // Backend expects MM/DD/YYYY
    setSelectedDate(`${get("month")}/${get("day")}/${get("year")}`);
    // Input expects YYYY-MM-DD
    setDateInputValue(`${get("year")}-${get("month")}-${get("day")}`);
  }, []);

  // Fetch data when date changes
  useEffect(() => {
    if (selectedDate) {
      fetchAbsentFeedbackData();
    }
  }, [selectedDate, currentPage, entriesPerPage, searchTerm]);

  const fetchAbsentFeedbackData = async () => {
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

      const response = await apiClient.get("/absent-feedback", {
        params: {
          date: selectedDate,
          page: currentPage,
          limit: entriesPerPage,
          search: searchTerm,
        },
      });

      if (response.data.success) {
        setStudentsData(response.data.data.students);
        setTotalStudents(response.data.data.pagination.totalStudents);
        setTotalPages(response.data.data.pagination.totalPages);
      }
    } catch (err) {
      console.error("Error fetching absent feedback data:", err);
      let errorMessage = "Failed to fetch absent feedback data";

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

  const handleDateChange = (e) => {
    const inputDate = e.target.value; // Format: YYYY-MM-DD
    setDateInputValue(inputDate);

    // Convert to MM/DD/YYYY format for backend
    const [year, month, day] = inputDate.split("-");
    const formattedDate = `${month}/${day}/${year}`;
    setSelectedDate(formattedDate);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleEntriesPerPageChange = (e) => {
    setEntriesPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  // Open feedback dialog
  const openFeedbackDialog = (student) => {
    setSelectedStudent(student);
    setFeedbackText(student.feedback || "");
    setFeedbackType(student.feedbackType || "absent");
    setIsFeedbackDialogOpen(true);
  };

  // Submit feedback
  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim()) {
      toast.error("Please enter feedback text");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error("Access token required. Please log in again.");
        return;
      }

      const feedbackData = {
        studentId: selectedStudent._id,
        date: selectedDate,
        feedback: feedbackText.trim(),
        feedbackType,
      };

      if (selectedStudent.feedbackId) {
        // Update existing feedback
        await apiClient.put(
          `/absent-feedback/${selectedStudent.feedbackId}`,
          feedbackData
        );
        toast.success("Feedback updated successfully!");
      } else {
        // Create new feedback
        await apiClient.post("/absent-feedback", feedbackData);
        toast.success("Feedback submitted successfully!");
      }

      // Close dialog and refresh data
      setIsFeedbackDialogOpen(false);
      setSelectedStudent(null);
      setFeedbackText("");
      setFeedbackType("absent");
      await fetchAbsentFeedbackData();
    } catch (err) {
      console.error("Error submitting feedback:", err);
      let errorMessage = "Failed to submit feedback. Please try again.";

      if (err.response?.status === 401) {
        errorMessage = "Access token required. Please log in again.";
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete feedback
  const handleDeleteFeedback = async (student) => {
    if (!student.feedbackId) return;

    if (!confirm("Are you sure you want to delete this feedback?")) return;

    try {
      const token = getAuthToken();
      if (!token) {
        toast.error("Access token required. Please log in again.");
        return;
      }

      await apiClient.delete(`/absent-feedback/${student.feedbackId}`);
      toast.success("Feedback deleted successfully!");
      await fetchAbsentFeedbackData();
    } catch (err) {
      console.error("Error deleting feedback:", err);
      let errorMessage = "Failed to delete feedback. Please try again.";

      if (err.response?.status === 401) {
        errorMessage = "Access token required. Please log in again.";
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      toast.error(errorMessage);
    }
  };

  // Calculate pagination info
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = Math.min(startIndex + entriesPerPage, totalStudents);

  const getStatusColor = (status) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-800";
      case "reviewed":
        return "bg-blue-100 text-blue-800";
      case "pending":
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case "resolved":
        return "Resolved";
      case "reviewed":
        return "Reviewed";
      case "pending":
      default:
        return "Pending";
    }
  };

  const getFeedbackTypeColor = (type) => {
    switch (type) {
      case "absent":
        return "bg-red-100 text-red-800";
      case "late":
        return "bg-orange-100 text-orange-800";
      case "no_show":
        return "bg-purple-100 text-purple-800";
      case "other":
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getFeedbackTypeDisplay = (type) => {
    switch (type) {
      case "absent":
        return "Absent";
      case "late":
        return "Late";
      case "no_show":
        return "No Show";
      case "other":
      default:
        return "Other";
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-0 md:ml-64 min-h-screen w-full">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex items-center justify-between px-4 md:px-6 py-4 max-w-7xl mx-auto">
            {/* Mobile Menu Space */}
            <div className="md:hidden w-10" />

            {/* Title */}
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight">
                  Absent Feedback
                </h1>
                <p className="text-sm text-muted-foreground">
                  Submit feedback for absent students
                </p>
              </div>
            </div>

            {/* Greeter User */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium">Greeter</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 hover:bg-blue-600">
                <User className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 md:px-6 py-6 space-y-6">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="date" className="text-sm font-medium">
                  Select Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={dateInputValue}
                  onChange={handleDateChange}
                  className="w-40"
                />
              </div>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-48"
                />
              </div>
              <Badge variant="secondary">{totalStudents} Students</Badge>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Instructions */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Instructions:</strong> Select a date to view students,
              then click on a student to submit or update absent feedback. You
              can provide feedback for students who are absent, late, or didn't
              show up.
            </AlertDescription>
          </Alert>

          {/* Control Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <span className="text-gray-900 text-sm">Show</span>
              <select
                value={entriesPerPage}
                onChange={handleEntriesPerPageChange}
                className="bg-white text-gray-900 border border-gray-300 rounded px-3 py-1 text-sm"
                disabled={isLoading}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="text-gray-900 text-sm">entries</span>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Student Absent Feedback
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    Loading students...
                  </div>
                ) : studentsData.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Excel Order</TableHead>
                        <TableHead className="w-24">Flight</TableHead>
                        <TableHead className="w-32">Arrival Time</TableHead>
                        <TableHead className="w-32">Student Number</TableHead>
                        <TableHead>Student Name</TableHead>
                        <TableHead className="w-32">Feedback Type</TableHead>
                        {/* <TableHead className="w-32">Status</TableHead> */}
                        <TableHead className="w-32">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentsData.map((student) => (
                        <TableRow key={student._id}>
                          <TableCell className="font-medium">
                            {student.excelOrder || student._id.slice(-6)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="font-mono text-xs"
                            >
                              {student.flight}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {student.arrivalTime}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {student.studentNo}
                          </TableCell>
                          <TableCell className="font-medium">
                            {student.studentGivenName}{" "}
                            {student.studentFamilyName}
                          </TableCell>
                          <TableCell>
                            {student.feedbackId ? (
                              <Badge
                                className={getFeedbackTypeColor(
                                  student.feedbackType
                                )}
                              >
                                {getFeedbackTypeDisplay(student.feedbackType)}
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-gray-500"
                              >
                                No Feedback
                              </Badge>
                            )}
                          </TableCell>
                          {/* <TableCell>
                            {student.feedbackId ? (
                              <Badge className={getStatusColor(student.status)}>
                                {getStatusDisplay(student.status)}
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-gray-500"
                              >
                                No Feedback
                              </Badge>
                            )}
                          </TableCell> */}
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openFeedbackDialog(student)}
                                className="h-8 px-2"
                              >
                                {student.feedbackId ? (
                                  <Edit className="h-3 w-3" />
                                ) : (
                                  <MessageSquare className="h-3 w-3" />
                                )}
                              </Button>
                              {student.feedbackId && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteFeedback(student)}
                                  className="h-8 px-2 text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                      <MessageSquare className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">
                      No students found for {selectedDate}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
                      No student schedules found for the selected date. Please
                      check the date or contact support.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Mobile/Tablet Cards View */}
          <div className="lg:hidden space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  Loading students...
                </CardContent>
              </Card>
            ) : studentsData.length > 0 ? (
              studentsData.map((student) => (
                <Card key={student._id}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          {student.flight}
                        </Badge>
                        {student.feedbackId ? (
                          <Badge
                            className={getFeedbackTypeColor(
                              student.feedbackType
                            )}
                          >
                            {getFeedbackTypeDisplay(student.feedbackType)}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-500">
                            No Feedback
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Excel Order:{" "}
                        {student.excelOrder || student._id.slice(-6)}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="font-medium">
                        {student.studentGivenName} {student.studentFamilyName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Student No: {student.studentNo}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Arrival: {student.arrivalTime}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Status:{" "}
                        {student.feedbackId
                          ? getStatusDisplay(student.status)
                          : "No Feedback"}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openFeedbackDialog(student)}
                        className="flex-1"
                      >
                        {student.feedbackId ? (
                          <>
                            <Edit className="h-3 w-3 mr-1" />
                            Edit Feedback
                          </>
                        ) : (
                          <>
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Add Feedback
                          </>
                        )}
                      </Button>
                      {student.feedbackId && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteFeedback(student)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                    <MessageSquare className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">
                    No students found for {selectedDate}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground text-center">
                    No student schedules found for the selected date.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
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
                    currentPage <= 3 ? index + 1 : currentPage - 2 + index;
                  if (pageNumber > totalPages || pageNumber < 1) return null;
                  return (
                    <Button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      disabled={isLoading}
                      className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm ${
                        currentPage === pageNumber
                          ? "bg-blue-500 text-white"
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
                          ? "bg-blue-500 text-white"
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
        </main>

        {/* Footer */}
        <div className="bg-white border-t border-gray-200 px-6 py-4 mt-8">
          <div className="max-w-7xl mx-auto">
            <p className="text-center text-gray-500 text-sm">
              Copyright © 2024. All right reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Feedback Dialog */}
      <Dialog
        open={isFeedbackDialogOpen}
        onOpenChange={setIsFeedbackDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedStudent?.feedbackId
                ? "Edit Feedback"
                : "Submit Feedback"}
            </DialogTitle>
            <DialogDescription>
              Provide feedback for {selectedStudent?.studentGivenName}{" "}
              {selectedStudent?.studentFamilyName}
              (Flight: {selectedStudent?.flight}, Arrival:{" "}
              {selectedStudent?.arrivalTime})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="feedbackType">Feedback Type</Label>
              <Select value={feedbackType} onValueChange={setFeedbackType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select feedback type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                  <SelectItem value="no_show">No Show</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback">Feedback Details</Label>
              <Textarea
                id="feedback"
                placeholder="Enter detailed feedback about the student's absence..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={4}
                maxLength={1000}
              />
              <div className="text-xs text-muted-foreground text-right">
                {feedbackText.length}/1000 characters
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsFeedbackDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitFeedback}
              disabled={isSubmitting || !feedbackText.trim()}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {selectedStudent?.feedbackId
                    ? "Updating..."
                    : "Submitting..."}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {selectedStudent?.feedbackId
                    ? "Update Feedback"
                    : "Submit Feedback"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
