import Sidebar from "../components/Sidebar";
import { useState, useEffect } from "react";
import {
  User,
  Info,
  Timer,
  Search,
  Calendar,
  Loader2,
  AlertCircle,
  CheckCircle,
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
import axios from "axios";
import { API_BASE_URL } from "@/lib/config";
import { toast } from "react-toastify";

export default function UpdatingWaitingTime() {
  const CANADA_TZ = "America/Vancouver";
  const [waitingTimes, setWaitingTimes] = useState({});
  const [pickupTimes, setPickupTimes] = useState({});
  const [waitingStartedTimes, setWaitingStartedTimes] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [dateInputValue, setDateInputValue] = useState("");
  const [studentsData, setStudentsData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState("");

  const getAuthToken = () => {
    return (
      sessionStorage.getItem("admin_token") ||
      localStorage.getItem("admin_token") ||
      localStorage.getItem("authToken")
    );
  };

  const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
  });

  apiClient.interceptors.request.use(
    (config) => {
      const token = getAuthToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    },
    (error) => Promise.reject(error)
  );

  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        setError("Access token required. Please log in again.");
        setTimeout(() => {
          window.location.href = "/admin/login";
        }, 2000);
      }
      return Promise.reject(error);
    }
  );

  // Helpers for Canada timezone
  const getCanadaDateParts = () => {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: CANADA_TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).formatToParts(new Date());
    const get = (type) => parts.find((p) => p.type === type)?.value || "";
    return {
      year: get("year"),
      month: get("month"),
      day: get("day"),
      hour: get("hour"),
      minute: get("minute"),
      second: get("second"),
    };
  };

  const formatCanadaDateForBackend = () => {
    const { year, month, day } = getCanadaDateParts();
    return `${month}/${day}/${year}`; // MM/DD/YYYY
  };

  const formatCanadaDateForInput = () => {
    const { year, month, day } = getCanadaDateParts();
    return `${year}-${month}-${day}`; // YYYY-MM-DD
  };

  useEffect(() => {
    const backendDate = formatCanadaDateForBackend();
    setSelectedDate(backendDate);
    const htmlDateValue = formatCanadaDateForInput();
    setDateInputValue(htmlDateValue);
  }, []);

  useEffect(() => {
    if (selectedDate) fetchWaitingTimeData();
  }, [selectedDate, currentPage, searchTerm]);

  const fetchWaitingTimeData = async () => {
    setIsLoading(true);
    setError("");
    try {
      const token = getAuthToken();
      if (!token) {
        setError("Access token required. Please log in again.");
        setTimeout(() => {
          window.location.href = "/admin/login";
        }, 2000);
        return;
      }

      const response = await apiClient.get("/waiting-time", {
        params: {
          date: selectedDate,
          page: currentPage,
          limit: 10,
          search: searchTerm,
        },
      });

      if (response.data.success) {
        setStudentsData(response.data.data.waitingTimes);
        setTotalStudents(response.data.data.pagination.totalWaitingTimes);
        setTotalPages(response.data.data.pagination.totalPages);

        const initialWaiting = {};
        const initialPickup = {};
        const initialWaitingStarted = {};
        response.data.data.waitingTimes.forEach((student) => {
          initialWaiting[student._id] = student.waitingTime || 0;
          initialPickup[student._id] = student.pickupTime || null;
          initialWaitingStarted[student._id] = student.waitingStartedAt || null;
        });
        setWaitingTimes(initialWaiting);
        setPickupTimes(initialPickup);
        setWaitingStartedTimes(initialWaitingStarted);
      }
    } catch (err) {
      console.error("Error fetching waiting time data:", err);
      let errorMessage = "Failed to fetch waiting time data";
      if (err.response?.data?.message) errorMessage = err.response.data.message;
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const timeNow = () =>
    new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: CANADA_TZ,
    });

  const diffMinutes = (arrival) => {
    if (!arrival) return 0;
    const parse = (t) => {
      const parts = t.split(":").map((p) => parseInt(p, 10));
      const [h = 0, m = 0, s = 0] = parts;
      return h * 3600 + m * 60 + s;
    };
    const nowS = parse(timeNow());
    const arrS = parse(arrival);
    const diff = Math.max(0, Math.round((nowS - arrS) / 60));
    return Math.min(120, diff);
  };

  const handleSetWaitingTime = async (student) => {
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error("Access token required. Please log in again.");
        return;
      }
      const minutes = diffMinutes(student.arrivalTime);
      const currentTime = timeNow();

      // Update local state immediately for better UX
      setWaitingTimes((prev) => ({ ...prev, [student._id]: minutes }));
      setWaitingStartedTimes((prev) => ({
        ...prev,
        [student._id]: currentTime,
      }));

      const resp = await apiClient.post("/waiting-time", {
        studentId: student._id,
        date: selectedDate,
        waitingTime: minutes,
        waitingStartedAt: currentTime, // Send the current time to backend
        status: student.status || "waiting",
      });

      const saved = resp?.data?.data?.waitingTime;
      // Update with backend response to ensure consistency
      if (saved?.waitingStartedAt) {
        setWaitingStartedTimes((prev) => ({
          ...prev,
          [student._id]: saved.waitingStartedAt,
        }));
      }

      const isUpdate = waitingStartedTimes[student._id];
      toast.success(isUpdate ? "Waiting time updated" : "Waiting time set");
      // No need to reload entire data - just update the specific student
    } catch (err) {
      console.error("Error setting waiting time:", err);
      toast.error("Failed to set waiting time");
      // Revert local state on error
      setWaitingTimes((prev) => ({ ...prev, [student._id]: 0 }));
      setWaitingStartedTimes((prev) => {
        const newState = { ...prev };
        delete newState[student._id];
        return newState;
      });
    }
  };

  const handlePickupTimeUpdate = async (studentId) => {
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error("Access token required. Please log in again.");
        return;
      }

      const currentTime = timeNow();

      // Update local state immediately for better UX
      setPickupTimes((prev) => ({ ...prev, [studentId]: currentTime }));

      const resp = await apiClient.post("/waiting-time", {
        studentId,
        date: selectedDate,
        waitingTime: waitingTimes[studentId] || 0,
        pickupTime: currentTime,
        status: "picked_up",
      });

      const saved = resp?.data?.data?.waitingTime;
      if (saved?.pickupTime) {
        setPickupTimes((prev) => ({ ...prev, [studentId]: saved.pickupTime }));
      }

      toast.success("Pickup time updated successfully!");
      // No need to reload entire data - just update the specific student
    } catch (err) {
      console.error("Error updating pickup time:", err);
      let errorMessage = "Failed to update pickup time. Please try again.";
      if (err.response?.data?.message) errorMessage = err.response.data.message;
      toast.error(errorMessage);
      // Revert local state on error
      setPickupTimes((prev) => ({ ...prev, [studentId]: null }));
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleDateChange = (e) => {
    const inputDate = e.target.value;
    setDateInputValue(inputDate);
    const [year, month, day] = inputDate.split("-");
    const formattedDate = `${month}/${day}/${year}`;
    setSelectedDate(formattedDate);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const startIndex = (currentPage - 1) * 10;
  const endIndex = Math.min(startIndex + 10, totalStudents);

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-gray-200 text-gray-800";
      case "picked_up":
        return "bg-gray-300 text-gray-900";
      case "waiting":
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "picked_up":
        return "Picked Up";
      case "waiting":
      default:
        return "Waiting";
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex-1 ml-0 md:ml-64 min-h-screen w-full">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex items-center justify-between px-4 md:px-6 py-4 max-w-7xl mx-auto">
            <div className="md:hidden w-10" />
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Timer className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight">
                  Update Waiting Time
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage student waiting times
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium">Admin</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black hover:bg-gray-800">
                <User className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 md:px-6 py-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="date" className="text-sm font-medium">
                  Select Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={dateInputValue}
                  onChange={handleDateChange}
                  className="w-full sm:w-40"
                />
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full sm:w-48"
                />
              </div>
              <Badge variant="secondary" className="w-fit">
                {totalStudents} Students
              </Badge>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="bg-gray-50 border-gray-300">
              <AlertCircle className="h-4 w-4 text-gray-700" />
              <AlertDescription className="text-gray-700">{error}</AlertDescription>
            </Alert>
          )}

          <Alert className="bg-gray-50 border-gray-300">
            <Info className="h-4 w-4 text-gray-700" />
            <AlertDescription className="text-gray-700">
              Click "Set Waiting" to capture waiting minutes (computed from
              arrival time). Click "Update Waiting Time" to recalculate and update the time. Click "Mark Picked Up" to record pickup time.
            </AlertDescription>
          </Alert>

          <div className="hidden lg:block">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Timer className="h-5 w-5" /> Student Waiting Times
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Loading
                    students...
                  </div>
                ) : studentsData.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Excel Order</TableHead>
                        <TableHead className="w-24">Status</TableHead>
                        <TableHead className="w-24">Flight</TableHead>
                        <TableHead className="w-32">Arrival Time</TableHead>
                        <TableHead className="w-32">Student Number</TableHead>
                        <TableHead>Student Name</TableHead>
                        <TableHead className="w-60">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentsData.map((student) => (
                        <TableRow key={student._id}>
                          <TableCell className="font-medium">
                            {student.excelOrder || student._id.slice(-6)}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(student.status)}>
                              {getStatusDisplay(student.status)}
                            </Badge>
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
                            <div className="flex items-center gap-3">
                              {/* Waiting Time button */}
                              <Button
                                size="sm"
                                className="h-6 px-2 text-xs bg-black hover:bg-gray-800 text-white"
                                onClick={() => handleSetWaitingTime(student)}
                              >
                                {waitingStartedTimes[student._id]
                                  ? "Update Waiting Time"
                                  : "Set Waiting"}
                              </Button>
                              {waitingStartedTimes[student._id] && (
                                <Badge
                                  variant="outline"
                                  className="font-mono text-xs border-gray-300"
                                >
                                  {waitingStartedTimes[student._id]}
                                </Badge>
                              )}

                              {/* Pickup button */}
                              {pickupTimes[student._id] ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-6 px-2 text-xs border-gray-300"
                                    disabled
                                  >
                                    Picked Up
                                  </Button>
                                  <Badge
                                    variant="outline"
                                    className="font-mono text-xs border-gray-300"
                                  >
                                    {pickupTimes[student._id]}
                                  </Badge>
                                </>
                              ) : (
                                <Button
                                  size="sm"
                                  className="h-6 px-2 text-xs bg-black hover:bg-gray-800 text-white"
                                  onClick={() =>
                                    handlePickupTimeUpdate(student._id)
                                  }
                                >
                                  Mark Picked Up
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
                      <Timer className="h-10 w-10 text-muted-foreground" />
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

          {/* Mobile/Tablet Cards */}
          <div className="lg:hidden space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Loading
                  students...
                </CardContent>
              </Card>
            ) : studentsData.length > 0 ? (
              studentsData.map((student) => (
                <Card key={student._id}>
                  <CardContent className="p-4 space-y-4">
                    {/* Header with flight and status */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          {student.flight}
                        </Badge>
                        <Badge className={getStatusColor(student.status)}>
                          {getStatusDisplay(student.status)}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Excel Order:{" "}
                        {student.excelOrder || student._id.slice(-6)}
                      </span>
                    </div>

                    {/* Student Information */}
                    <div className="space-y-2">
                      <div className="font-medium text-base">
                        {student.studentGivenName} {student.studentFamilyName}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div>Student No: {student.studentNo}</div>
                        <div>Arrival: {student.arrivalTime}</div>
                      </div>
                    </div>

                    {/* Waiting Time Section */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Waiting Time
                      </Label>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <Button
                          size="sm"
                          className="w-full sm:w-auto h-8 px-3 text-xs bg-black hover:bg-gray-800 text-white"
                          onClick={() => handleSetWaitingTime(student)}
                        >
                          {waitingStartedTimes[student._id]
                            ? "Update Waiting Time"
                            : "Set Waiting"}
                        </Button>
                        {waitingStartedTimes[student._id] && (
                          <Badge
                            variant="outline"
                            className="font-mono text-xs w-fit border-gray-300"
                          >
                            {waitingStartedTimes[student._id]}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Actions Section */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Actions</Label>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        {pickupTimes[student._id] ? (
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                            <Badge
                              variant="outline"
                              className="bg-gray-100 text-gray-700 border-gray-300 w-fit"
                            >
                              {pickupTimes[student._id]}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full sm:w-auto h-8 px-3 text-xs border-gray-300"
                              disabled
                            >
                              Picked Up
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            className="w-full sm:w-auto h-8 px-3 text-xs bg-black hover:bg-gray-800 text-white"
                            onClick={() => handlePickupTimeUpdate(student._id)}
                          >
                            Mark Picked Up
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                    <Timer className="h-10 w-10 text-muted-foreground" />
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
                          ? "bg-black text-white hover:bg-gray-800"
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
                          ? "bg-black text-white hover:bg-gray-800"
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
    </div>
  );
}
