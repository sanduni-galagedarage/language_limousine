import React, { useState, useEffect } from "react";
import { Search, User, Calendar, AlertCircle, CheckCircle } from "lucide-react";
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
import Sidebar from "../../components/Sidebar";
import axios from "axios";
import { API_BASE_URL } from "@/lib/config";
import { toast } from "react-toastify";

export default function Add() {
  const [formData, setFormData] = useState({
    date: "2025-07-24", // Changed from "07/24/2025" to "2025-07-24" for date input compatibility
    trip: "",
    actualArrivalTime: "",
    arrivalTime: "",
    departurePickupTime: "",
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
    specialInstructions: "",
    studyPermit: "",
    school: "",
    staffMemberAssigned: "",
    client: "",
  });

  const [students, setStudents] = useState([]);
  const [schools, setSchools] = useState([]);
  const [entriesPerPage, setEntriesPerPage] = useState("10");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingStudents, setIsFetchingStudents] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);

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

  // Fetch students on component mount and when search/pagination changes
  useEffect(() => {
    fetchStudents();
    fetchSchools();
  }, [currentPage, searchTerm, entriesPerPage]);

  const fetchStudents = async () => {
    setIsFetchingStudents(true);
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
          page: currentPage,
          limit: entriesPerPage,
          search: searchTerm,
        },
      });

      if (response.data.success) {
        setStudents(response.data.data.students);
        setTotalPages(response.data.data.pagination.totalPages);
        setTotalStudents(response.data.data.pagination.totalStudents);
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
      setIsFetchingStudents(false);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = getAuthToken();
      if (!token) {
        setError("Access token required. Please log in again.");
        setTimeout(() => {
          window.location.href = "/admin/login";
        }, 2000);
        return;
      }

      const response = await apiClient.post("/", formData);

      if (response.data.success) {
        const successMessage = "Student added successfully!";
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

        await fetchStudents();
        handleReset();
      } else {
        const errorMessage = response.data.message || "Failed to add student";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err) {
      console.error("Add student error:", err);
      let errorMessage = "An unexpected error occurred. Please try again.";

      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = "Access token required. Please log in again.";
          setTimeout(() => {
            window.location.href = "/admin/login";
          }, 2000);
        } else if (err.response.status === 403) {
          errorMessage = "You don't have permission to perform this action.";
        } else if (err.response.data) {
          errorMessage = err.response.data.message || "Failed to add student";

          // Handle validation errors
          if (
            err.response.data.errors &&
            Array.isArray(err.response.data.errors)
          ) {
            errorMessage = err.response.data.errors
              .map((error) => error.msg)
              .join(", ");
          }
        }
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
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      date: "2025-07-24", // Changed from "07/24/2025" to "2025-07-24" for date input compatibility
      trip: "",
      actualArrivalTime: "",
      arrivalTime: "",
      departurePickupTime: "",
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
      specialInstructions: "",
      studyPermit: "",
      school: "",
      staffMemberAssigned: "",
      client: "",
    });
    setError("");
    setSuccess("");
  };

  const handleDelete = async (studentId) => {
    if (!window.confirm("Are you sure you want to delete this student?")) {
      return;
    }

    try {
      const token = getAuthToken();
      if (!token) {
        setError("Access token required. Please log in again.");
        setTimeout(() => {
          window.location.href = "/admin/login";
        }, 2000);
        return;
      }

      const response = await apiClient.delete(`/${studentId}`);

      if (response.data.success) {
        const successMessage = "Student deleted successfully!";
        setSuccess(successMessage);
        toast.success(successMessage);

        await fetchStudents();
      }
    } catch (err) {
      console.error("Delete error:", err);
      let errorMessage = "Failed to delete student";

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
    }
  };

  const startIndex = (currentPage - 1) * parseInt(entriesPerPage);

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 min-h-screen w-full">
        {/* Header */}
        <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Type to search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white text-gray-900 pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-sm"
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

        {/* Scrollable Main Content */}
        <div className="p-6 overflow-y-auto bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto">
            {/* Error and Success Messages */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <span className="text-red-700">{error}</span>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-green-700">{success}</span>
                </div>
              </div>
            )}

            {/* Add Student Form */}
            <Card className="bg-white border-gray-200 mb-8 shadow-sm">
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* First Row */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Select the Date */}
                    <div className="space-y-2">
                      <Label className="text-gray-900 text-sm font-medium">
                        Select the Date
                      </Label>
                      <div className="relative">
                        <Input
                          name="date"
                          type="date"
                          value={formData.date}
                          onChange={handleInputChange}
                          className="bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-10"
                        />
                        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      </div>
                    </div>

                    {/* Trip */}
                    <div className="space-y-2">
                      <Label className="text-gray-900 text-sm font-medium">
                        Trip
                      </Label>
                      <Input
                        name="trip"
                        type="text"
                        value={formData.trip}
                        onChange={handleInputChange}
                        className="bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Enter trip"
                      />
                    </div>

                    {/* Actual Arrival Time */}
                    <div className="space-y-2">
                      <Label className="text-gray-900 text-sm font-medium">
                        Actual Arrival Time
                      </Label>
                      <Input
                        name="actualArrivalTime"
                        type="time"
                        value={formData.actualArrivalTime}
                        onChange={handleInputChange}
                        className="bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    {/* Arrival Time */}
                    <div className="space-y-2">
                      <Label className="text-gray-900 text-sm font-medium">
                        Arrival Time
                      </Label>
                      <Input
                        name="arrivalTime"
                        type="time"
                        value={formData.arrivalTime}
                        onChange={handleInputChange}
                        className="bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    {/* Departure Pickup Time */}
                    <div className="space-y-2">
                      <Label className="text-gray-900 text-sm font-medium">
                        Departure Pickup Time
                      </Label>
                      <Input
                        name="departurePickupTime"
                        type="time"
                        value={formData.departurePickupTime}
                        onChange={handleInputChange}
                        className="bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Second Row */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Flight */}
                    <div className="space-y-2">
                      <Label className="text-gray-900 text-sm font-medium">
                        Flight
                      </Label>
                      <Input
                        name="flight"
                        type="text"
                        value={formData.flight}
                        onChange={handleInputChange}
                        className="bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Enter flight"
                      />
                    </div>

                    {/* D or I */}
                    <div className="space-y-2">
                      <Label className="text-gray-900 text-sm font-medium">
                        D or I
                      </Label>
                      <Select
                        value={formData.dOrI}
                        onValueChange={(value) =>
                          handleSelectChange("dOrI", value)
                        }
                      >
                        <SelectTrigger className="bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Select D or I" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-300">
                          <SelectItem
                            value="D"
                            className="text-gray-900 hover:bg-gray-100"
                          >
                            D
                          </SelectItem>
                          <SelectItem
                            value="I"
                            className="text-gray-900 hover:bg-gray-100"
                          >
                            I
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* M or F */}
                    <div className="space-y-2">
                      <Label className="text-gray-900 text-sm font-medium">
                        M or F
                      </Label>
                      <Select
                        value={formData.mOrF}
                        onValueChange={(value) =>
                          handleSelectChange("mOrF", value)
                        }
                      >
                        <SelectTrigger className="bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Select M or F" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-300">
                          <SelectItem
                            value="M"
                            className="text-gray-900 hover:bg-gray-100"
                          >
                            M
                          </SelectItem>
                          <SelectItem
                            value="F"
                            className="text-gray-900 hover:bg-gray-100"
                          >
                            F
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Student No */}
                    <div className="space-y-2">
                      <Label className="text-gray-900 text-sm font-medium">
                        Student No
                      </Label>
                      <Input
                        name="studentNo"
                        type="text"
                        value={formData.studentNo}
                        onChange={handleInputChange}
                        className="bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Enter student number"
                      />
                    </div>
                  </div>

                  {/* Third Row */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Student Given Name */}
                    <div className="space-y-2">
                      <Label className="text-gray-900 text-sm font-medium">
                        Student Given Name
                      </Label>
                      <Input
                        name="studentGivenName"
                        type="text"
                        value={formData.studentGivenName}
                        onChange={handleInputChange}
                        className="bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Enter given name"
                      />
                    </div>

                    {/* Student Family Name */}
                    <div className="space-y-2">
                      <Label className="text-gray-900 text-sm font-medium">
                        Student Family Name
                      </Label>
                      <Input
                        name="studentFamilyName"
                        type="text"
                        value={formData.studentFamilyName}
                        onChange={handleInputChange}
                        className="bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Enter family name"
                      />
                    </div>

                    {/* Host Given Name */}
                    <div className="space-y-2">
                      <Label className="text-gray-900 text-sm font-medium">
                        Host Given Name
                      </Label>
                      <Input
                        name="hostGivenName"
                        type="text"
                        value={formData.hostGivenName}
                        onChange={handleInputChange}
                        className="bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Enter host given name"
                      />
                    </div>

                    {/* Host Family Name */}
                    <div className="space-y-2">
                      <Label className="text-gray-900 text-sm font-medium">
                        Host Family Name
                      </Label>
                      <Input
                        name="hostFamilyName"
                        type="text"
                        value={formData.hostFamilyName}
                        onChange={handleInputChange}
                        className="bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Enter host family name"
                      />
                    </div>
                  </div>

                  {/* Fourth Row */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    {/* Phone */}
                    <div className="space-y-2">
                      <Label className="text-gray-900 text-sm font-medium">
                        Phone
                      </Label>
                      <Input
                        name="phone"
                        type="text"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Enter phone"
                      />
                    </div>

                    {/* Address */}
                    <div className="space-y-2">
                      <Label className="text-gray-900 text-sm font-medium">
                        Address
                      </Label>
                      <Input
                        name="address"
                        type="text"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Enter address"
                      />
                    </div>

                    {/* City */}
                    <div className="space-y-2">
                      <Label className="text-gray-900 text-sm font-medium">
                        City
                      </Label>
                      <Input
                        name="city"
                        type="text"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Enter city"
                      />
                    </div>

                    {/* School */}
                    <div className="space-y-2">
                      <Label className="text-gray-900 text-sm font-medium">
                        School
                      </Label>
                      <Select
                        value={formData.school}
                        onValueChange={(value) =>
                          handleSelectChange("school", value)
                        }
                      >
                        <SelectTrigger className="bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Select School" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-300">
                          {schools.map((school) => (
                            <SelectItem
                              key={school.value}
                              value={school.value}
                              className="text-gray-900 hover:bg-gray-100"
                            >
                              {school.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Client */}
                    <div className="space-y-2">
                      <Label className="text-gray-900 text-sm font-medium">
                        Client
                      </Label>
                      <Select
                        value={formData.client}
                        onValueChange={(value) =>
                          handleSelectChange("client", value)
                        }
                      >
                        <SelectTrigger className="bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Select Client (School)" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-300">
                          {schools.map((school) => (
                            <SelectItem
                              key={school.value}
                              value={school.value}
                              className="text-gray-900 hover:bg-gray-100"
                            >
                              {school.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Fifth Row - New Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Special Instructions */}
                    <div className="space-y-2">
                      <Label className="text-gray-900 text-sm font-medium">
                        Special Instructions
                      </Label>
                      <Input
                        name="specialInstructions"
                        type="text"
                        value={formData.specialInstructions}
                        onChange={handleInputChange}
                        className="bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Enter special instructions"
                      />
                    </div>

                    {/* Study Permit */}
                    <div className="space-y-2">
                      <Label className="text-gray-900 text-sm font-medium">
                        Study Permit
                      </Label>
                      <Select
                        value={formData.studyPermit}
                        onValueChange={(value) =>
                          handleSelectChange("studyPermit", value)
                        }
                      >
                        <SelectTrigger className="bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Select Study Permit" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-300">
                          <SelectItem
                            value="Y"
                            className="text-gray-900 hover:bg-gray-100"
                          >
                            Yes
                          </SelectItem>
                          <SelectItem
                            value="N"
                            className="text-gray-900 hover:bg-gray-100"
                          >
                            No
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Staff Member Assigned */}
                    <div className="space-y-2">
                      <Label className="text-gray-900 text-sm font-medium">
                        Staff Member Assigned
                      </Label>
                      <Input
                        name="staffMemberAssigned"
                        type="text"
                        value={formData.staffMemberAssigned}
                        onChange={handleInputChange}
                        className="bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Enter staff member"
                      />
                    </div>
                  </div>

                  {/* Form Buttons */}
                  <div className="flex justify-center space-x-4 pt-4">
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isLoading}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-medium disabled:opacity-50"
                    >
                      {isLoading ? "Adding..." : "Submit"}
                    </Button>
                    <Button
                      type="button"
                      onClick={handleReset}
                      disabled={isLoading}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-medium disabled:opacity-50"
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Students Table */}
            <Card className="bg-white border-gray-200 overflow-hidden shadow-sm">
              {/* Table Controls */}
              <CardHeader className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-900 text-sm">Show</span>
                    <Select
                      value={entriesPerPage}
                      onValueChange={setEntriesPerPage}
                    >
                      <SelectTrigger className="w-20 bg-white text-gray-900 border-gray-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-300">
                        <SelectItem
                          value="10"
                          className="text-gray-900 hover:bg-gray-100"
                        >
                          10
                        </SelectItem>
                        <SelectItem
                          value="25"
                          className="text-gray-900 hover:bg-gray-100"
                        >
                          25
                        </SelectItem>
                        <SelectItem
                          value="50"
                          className="text-gray-900 hover:bg-gray-100"
                        >
                          50
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-gray-900 text-sm">entries</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Label className="text-gray-900 text-sm">Search:</Label>
                    <Input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-white text-gray-900 border-gray-300 text-sm w-48"
                      placeholder="Search students..."
                    />
                  </div>
                </div>
              </CardHeader>

              {/* Table */}
              <CardContent className="p-0 overflow-x-auto">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-gray-900 font-medium text-left px-3 py-2 border-b border-gray-200 text-xs">
                          Action
                        </th>
                        <th className="text-gray-900 font-medium text-left px-3 py-2 border-b border-gray-200 text-xs">
                          Date
                        </th>
                        <th className="text-gray-900 font-medium text-left px-3 py-2 border-b border-gray-200 text-xs">
                          Trip
                        </th>
                        <th className="text-gray-900 font-medium text-left px-3 py-2 border-b border-gray-200 text-xs">
                          Actual arrival time
                        </th>
                        <th className="text-gray-900 font-medium text-left px-3 py-2 border-b border-gray-200 text-xs">
                          Arrival Time
                        </th>
                        <th className="text-gray-900 font-medium text-left px-3 py-2 border-b border-gray-200 text-xs">
                          Flight
                        </th>
                        <th className="text-gray-900 font-medium text-left px-3 py-2 border-b border-gray-200 text-xs">
                          D or I
                        </th>
                        <th className="text-gray-900 font-medium text-left px-3 py-2 border-b border-gray-200 text-xs">
                          M or F
                        </th>
                        <th className="text-gray-900 font-medium text-left px-3 py-2 border-b border-gray-200 text-xs">
                          Student Number
                        </th>
                        <th className="text-gray-900 font-medium text-left px-3 py-2 border-b border-gray-200 text-xs">
                          Student Given Name
                        </th>
                        <th className="text-gray-900 font-medium text-left px-3 py-2 border-b border-gray-200 text-xs">
                          Student Family Name
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.length === 0 ? (
                        <tr className="border-gray-200">
                          <td
                            colSpan={11}
                            className="text-gray-900 text-center py-8 px-4 border-b border-gray-200"
                          >
                            {isFetchingStudents
                              ? "Loading students..."
                              : "No students found."}
                          </td>
                        </tr>
                      ) : (
                        students.map((student) => (
                          <tr
                            key={student._id}
                            className="border-gray-200 hover:bg-gray-50"
                          >
                            <td className="px-3 py-2 border-b border-gray-200">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(student._id)}
                                className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1"
                              >
                                Delete
                              </Button>
                            </td>
                            <td className="text-gray-900 px-3 py-2 border-b border-gray-200 text-xs">
                              {student.date}
                            </td>
                            <td className="text-gray-900 px-3 py-2 border-b border-gray-200 text-xs">
                              {student.trip}
                            </td>
                            <td className="text-gray-900 px-3 py-2 border-b border-gray-200 text-xs">
                              {student.actualArrivalTime}
                            </td>
                            <td className="text-gray-900 px-3 py-2 border-b border-gray-200 text-xs">
                              {student.arrivalTime}
                            </td>
                            <td className="text-gray-900 px-3 py-2 border-b border-gray-200 text-xs">
                              {student.flight}
                            </td>
                            <td className="text-gray-900 px-3 py-2 border-b border-gray-200 text-xs">
                              {student.dOrI}
                            </td>
                            <td className="text-gray-900 px-3 py-2 border-b border-gray-200 text-xs">
                              {student.mOrF}
                            </td>
                            <td className="text-gray-900 px-3 py-2 border-b border-gray-200 text-xs">
                              {student.studentNo}
                            </td>
                            <td className="text-gray-900 px-3 py-2 border-b border-gray-200 text-xs">
                              {student.studentGivenName}
                            </td>
                            <td className="text-gray-900 px-3 py-2 border-b border-gray-200 text-xs">
                              {student.studentFamilyName}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Pagination */}
            <div className="mt-4 flex justify-between items-center text-gray-900 text-sm">
              <span>
                Showing {startIndex + 1} to{" "}
                {Math.min(startIndex + parseInt(entriesPerPage), totalStudents)}{" "}
                of {totalStudents} entries
              </span>
              <div className="flex space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="bg-white text-gray-900 border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                >
                  Prev
                </Button>
                {Array.from(
                  { length: Math.min(5, totalPages) },
                  (_, i) => i + 1
                ).map((page) => (
                  <Button
                    key={page}
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={
                      page === currentPage
                        ? "bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
                        : "bg-white text-gray-900 border-gray-300 hover:bg-gray-50"
                    }
                  >
                    {page}
                  </Button>
                ))}
                {totalPages > 5 && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white text-gray-900 border-gray-300 hover:bg-gray-50"
                    >
                      ...
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      className="bg-white text-gray-900 border-gray-300 hover:bg-gray-50"
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="bg-white text-gray-900 border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-gray-200 px-6 py-4">
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
