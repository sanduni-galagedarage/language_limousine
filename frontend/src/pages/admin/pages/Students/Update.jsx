import React, { useState } from "react";
import { Search, User, Calendar, Edit, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Sidebar from "../../components/Sidebar";
import axios from "axios";
import { API_BASE_URL } from "@/lib/config";
import { toast } from "react-toastify";

export default function Update() {
  const [selectedDate, setSelectedDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState("10");
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [schools, setSchools] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
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

  const [updateForm, setUpdateForm] = useState({
    date: "",
    trip: "",
    actualArrivalTime: "",
    arrivalTime: "",
    flight: "",
    dOrI: "",
    mOrF: "",
    studentNo: "",
    studentGivenName: "",
    studentFamilyName: "",
    hostGivenName: "",
    hostFamilyName: "",
    phone: "",
    address: "",
    city: "",
    school: "",
    client: "",
  });

  const handleDateFilter = async () => {
    if (!selectedDate) {
      toast.error("Please select a date first");
      return;
    }

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

      const response = await apiClient.get("/", {
        params: {
          date: selectedDate,
          limit: 100, // Get all students for the date
        },
      });

      if (response.data.success) {
        setFilteredStudents(response.data.data.students);
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

  const fetchSchools = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.error("No auth token available");
        return;
      }

      const response = await axios.get(
        `${API_BASE_URL}/users/schools/dropdown`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setSchools(response.data.data.schools);
      }
    } catch (err) {
      console.error("Error fetching schools:", err);
    }
  };

  const handleUpdateClick = (student) => {
    setSelectedStudent(student);
    setUpdateForm({
      date: student.date,
      trip: student.trip,
      actualArrivalTime: student.actualArrivalTime,
      arrivalTime: student.arrivalTime,
      flight: student.flight,
      dOrI: student.dOrI,
      mOrF: student.mOrF,
      studentNo: student.studentNo,
      studentGivenName: student.studentGivenName,
      studentFamilyName: student.studentFamilyName,
      hostGivenName: student.hostGivenName,
      hostFamilyName: student.hostFamilyName,
      phone: student.phone,
      address: student.address,
      city: student.city,
      school: student.school,
      client: student.client,
    });
    setIsDialogOpen(true);
    fetchSchools(); // Fetch schools when dialog opens
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const token = getAuthToken();
      if (!token) {
        setError("Access token required. Please log in again.");
        setTimeout(() => {
          window.location.href = "/admin/login";
        }, 2000);
        return;
      }

      const response = await apiClient.put(
        `/${selectedStudent._id}`,
        updateForm
      );

      if (response.data.success) {
        toast.success("Student updated successfully!");
        setIsDialogOpen(false);
        // Refresh the student list
        await handleDateFilter();
      }
    } catch (err) {
      console.error("Update error:", err);
      let errorMessage = "Failed to update student";

      if (err.response?.status === 401) {
        errorMessage = "Access token required. Please log in again.";
        setTimeout(() => {
          window.location.href = "/admin/login";
        }, 2000);
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setUpdateForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Filter students based on search term
  const displayedStudents = filteredStudents.filter(
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

  return (
    <div className="flex min-h-screen bg-white overflow-x-hidden">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 overflow-x-hidden md:ml-64 min-h-screen w-full">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Type to search..."
                className="w-full bg-gray-50 text-gray-800 pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-sm"
              />
            </div>

            {/* Admin User */}
            <div className="flex items-center space-x-3 ml-6">
              <span className="text-gray-800 font-medium">Admin User</span>
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            {/* Page Title */}
            <h1 className="text-2xl font-semibold text-blue-500 mb-6">
              Update Student Information
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

            {/* Date Filter Section */}
            <Card className="bg-white border-gray-200 mb-8">
              <CardContent className="p-6">
                <div className="flex items-end space-x-4">
                  <div className="space-y-2 flex-1 max-w-md">
                    <Label
                      htmlFor="date"
                      className="text-gray-700 text-sm font-medium"
                    >
                      Select Date
                    </Label>
                    <div className="relative">
                      <Input
                        id="date"
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="bg-white text-gray-800 border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-10"
                      />
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
                    </div>
                  </div>
                  <Button
                    onClick={handleDateFilter}
                    disabled={isLoading || !selectedDate}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50"
                  >
                    {isLoading ? "Loading..." : "Filter Students"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Students Table */}
            {filteredStudents.length > 0 && (
              <Card className="bg-white border-gray-200 overflow-hidden">
                {/* Table Controls */}
                <CardHeader className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-700 text-sm">Show</span>
                      <Select
                        value={entriesPerPage}
                        onValueChange={setEntriesPerPage}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                      </Select>
                      <span className="text-gray-700 text-sm">entries</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Label className="text-gray-700 text-sm">Search:</Label>
                      <Input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-white text-gray-800 border-gray-300 text-sm w-48"
                        placeholder="Search students..."
                      />
                    </div>
                  </div>
                </CardHeader>

                {/* Table */}
                <CardContent className="p-0 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 hover:bg-gray-50">
                        <TableHead className="text-gray-700 font-medium">
                          Excel Order
                        </TableHead>
                        <TableHead className="text-gray-700 font-medium">
                          Student No
                        </TableHead>
                        <TableHead className="text-gray-700 font-medium">
                          Name
                        </TableHead>
                        <TableHead className="text-gray-700 font-medium">
                          Trip
                        </TableHead>
                        <TableHead className="text-gray-700 font-medium">
                          Arrival Time
                        </TableHead>
                        <TableHead className="text-gray-700 font-medium">
                          Flight
                        </TableHead>
                        <TableHead className="text-gray-700 font-medium">
                          School
                        </TableHead>
                        <TableHead className="text-gray-700 font-medium">
                          Action
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {displayedStudents.map((student, index) => (
                        <TableRow
                          key={student._id}
                          className="border-gray-200 hover:bg-gray-50"
                        >
                          <TableCell className="text-gray-800">
                            {student.excelOrder || index + 1}
                          </TableCell>
                          <TableCell className="text-gray-800">
                            {student.studentNo}
                          </TableCell>
                          <TableCell className="text-gray-800">
                            {student.studentGivenName}{" "}
                            {student.studentFamilyName}
                          </TableCell>
                          <TableCell className="text-gray-800">
                            {student.trip}
                          </TableCell>
                          <TableCell className="text-gray-800">
                            {student.arrivalTime}
                          </TableCell>
                          <TableCell className="text-gray-800">
                            {student.flight}
                          </TableCell>
                          <TableCell className="text-gray-800">
                            {student.school}
                          </TableCell>
                          <TableCell>
                            <Dialog
                              open={
                                isDialogOpen &&
                                selectedStudent?._id === student._id
                              }
                              onOpenChange={(open) => {
                                if (!open) setIsDialogOpen(false);
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
                                  onClick={() => handleUpdateClick(student)}
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Update
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[600px] bg-white">
                                <DialogHeader>
                                  <DialogTitle className="text-blue-500 text-xl">
                                    Update Student Details
                                  </DialogTitle>
                                </DialogHeader>
                                <form
                                  onSubmit={handleUpdateSubmit}
                                  className="space-y-4"
                                >
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Date */}
                                    <div className="space-y-2">
                                      <Label
                                        htmlFor="update-date"
                                        className="text-gray-700 text-sm font-medium"
                                      >
                                        Date
                                      </Label>
                                      <Input
                                        id="update-date"
                                        name="date"
                                        type="date"
                                        value={updateForm.date}
                                        onChange={handleInputChange}
                                        className="bg-white text-gray-800 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                      />
                                    </div>

                                    {/* Trip */}
                                    <div className="space-y-2">
                                      <Label
                                        htmlFor="update-trip"
                                        className="text-gray-700 text-sm font-medium"
                                      >
                                        Trip
                                      </Label>
                                      <Input
                                        id="update-trip"
                                        name="trip"
                                        type="text"
                                        value={updateForm.trip}
                                        onChange={handleInputChange}
                                        className="bg-white text-gray-800 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                      />
                                    </div>

                                    {/* Arrival Time */}
                                    <div className="space-y-2">
                                      <Label
                                        htmlFor="update-arrival-time"
                                        className="text-gray-700 text-sm font-medium"
                                      >
                                        Arrival Time
                                      </Label>
                                      <Input
                                        id="update-arrival-time"
                                        name="arrivalTime"
                                        type="time"
                                        value={updateForm.arrivalTime}
                                        onChange={handleInputChange}
                                        className="bg-white text-gray-800 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                      />
                                    </div>

                                    {/* Flight */}
                                    <div className="space-y-2">
                                      <Label
                                        htmlFor="update-flight"
                                        className="text-gray-700 text-sm font-medium"
                                      >
                                        Flight
                                      </Label>
                                      <Input
                                        id="update-flight"
                                        name="flight"
                                        type="text"
                                        value={updateForm.flight}
                                        onChange={handleInputChange}
                                        className="bg-white text-gray-800 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                      />
                                    </div>

                                    {/* D or I */}
                                    <div className="space-y-2">
                                      <Label className="text-gray-700 text-sm font-medium">
                                        D or I
                                      </Label>
                                      <Select
                                        value={updateForm.dOrI}
                                        onValueChange={(value) =>
                                          handleSelectChange("dOrI", value)
                                        }
                                      >
                                        <SelectTrigger className="bg-white text-gray-800 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                                          <SelectValue placeholder="Select D or I" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border-gray-300">
                                          <SelectItem
                                            value="D"
                                            className="text-gray-800 hover:bg-gray-100"
                                          >
                                            D
                                          </SelectItem>
                                          <SelectItem
                                            value="I"
                                            className="text-gray-800 hover:bg-gray-100"
                                          >
                                            I
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    {/* M or F */}
                                    <div className="space-y-2">
                                      <Label className="text-gray-700 text-sm font-medium">
                                        M or F
                                      </Label>
                                      <Select
                                        value={updateForm.mOrF}
                                        onValueChange={(value) =>
                                          handleSelectChange("mOrF", value)
                                        }
                                      >
                                        <SelectTrigger className="bg-white text-gray-800 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                                          <SelectValue placeholder="Select M or F" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border-gray-300">
                                          <SelectItem
                                            value="M"
                                            className="text-gray-800 hover:bg-gray-100"
                                          >
                                            M
                                          </SelectItem>
                                          <SelectItem
                                            value="F"
                                            className="text-gray-800 hover:bg-gray-100"
                                          >
                                            F
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    {/* School */}
                                    <div className="space-y-2">
                                      <Label
                                        htmlFor="update-school"
                                        className="text-gray-700 text-sm font-medium"
                                      >
                                        School
                                      </Label>
                                      <Select
                                        value={updateForm.school}
                                        onValueChange={(value) =>
                                          setUpdateForm((prev) => ({
                                            ...prev,
                                            school: value,
                                          }))
                                        }
                                      >
                                        <SelectTrigger className="bg-white text-gray-800 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                                          <SelectValue placeholder="Select School" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border-gray-300">
                                          {schools.map((school) => (
                                            <SelectItem
                                              key={school.value}
                                              value={school.value}
                                              className="text-gray-800 hover:bg-gray-100"
                                            >
                                              {school.label}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>

                                  {/* Dialog Buttons */}
                                  <div className="flex justify-end space-x-3 pt-4">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      onClick={() => setIsDialogOpen(false)}
                                      className="px-6 py-2"
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      type="submit"
                                      disabled={isUpdating}
                                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 disabled:opacity-50"
                                    >
                                      {isUpdating
                                        ? "Updating..."
                                        : "Update Student"}
                                    </Button>
                                  </div>
                                </form>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {displayedStudents.length === 0 &&
                    filteredStudents.length > 0 && (
                      <div className="p-8 text-center text-gray-500">
                        No students found matching your search criteria.
                      </div>
                    )}
                </CardContent>
              </Card>
            )}

            {/* No Results Message */}
            {selectedDate && filteredStudents.length === 0 && !isLoading && (
              <Card className="bg-white border-gray-200">
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">
                    No students found for the selected date: {selectedDate}
                  </p>
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
