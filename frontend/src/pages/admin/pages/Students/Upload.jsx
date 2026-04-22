import React, { useState, useEffect } from "react";
import {
  User,
  Upload as UploadIcon,
  FileSpreadsheet,
  Search,
  Download,
  AlertCircle,
  CheckCircle,
  X,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import Sidebar from "../../components/Sidebar";
import axios from "axios";
import { API_BASE_URL } from "@/lib/config";
import { toast } from "react-toastify";

export default function Upload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [date, setDate] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [studentsForDate, setStudentsForDate] = useState([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  // Get auth token from sessionStorage or localStorage
  const getAuthToken = () => {
    const adminToken = sessionStorage.getItem("admin_token");
    const authToken = localStorage.getItem("authToken");
    const adminTokenLocal = localStorage.getItem("admin_token");

    console.log("Available tokens:", {
      sessionStorage_admin_token: adminToken ? "present" : "missing",
      localStorage_authToken: authToken ? "present" : "missing",
      localStorage_admin_token: adminTokenLocal ? "present" : "missing",
    });

    const token = adminToken || authToken || adminTokenLocal;

    if (token) {
      console.log("Using token:", token.substring(0, 20) + "...");
    } else {
      console.log("No token found!");
    }

    return token;
  };

  // Configure axios client
  const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Default date to today (America/Vancouver) in YYYY-MM-DD and preload students list
  useEffect(() => {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Vancouver",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());
    const get = (type) => parts.find((p) => p.type === type)?.value || "";
    const todayStr = `${get("year")}-${get("month")}-${get("day")}`;
    setDate(todayStr);
    fetchStudentsForDate(todayStr);
  }, []);

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

  const fetchStudentsForDate = async (selected) => {
    if (!selected) {
      setStudentsForDate([]);
      return;
    }
    setIsLoadingStudents(true);
    try {
      const response = await apiClient.get("/students", {
        params: { date: selected, limit: "all" },
      });
      if (response.data.success) {
        setStudentsForDate(response.data.data.students || []);
      }
    } catch (err) {
      console.error("Fetch students by date error:", err);
      toast.error("Failed to load students for selected date");
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "application/octet-stream",
      ];

      const isValidType =
        allowedTypes.includes(file.type) ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".xls");

      if (!isValidType) {
        setError("Please select a valid Excel file (.xlsx or .xls)");
        setSelectedFile(null);
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError("File size too large. Maximum size is 10MB.");
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file first");
      return;
    }

    if (!date) {
      setError("Please select a date");
      return;
    }

    setIsUploading(true);
    setError("");
    setSuccess("");
    setUploadResult(null);

    try {
      const token = getAuthToken();
      if (!token) {
        setError("Access token required. Please log in again.");
        setTimeout(() => {
          window.location.href = "/admin/login";
        }, 2000);
        return;
      }

      const formData = new FormData();
      formData.append("excelFile", selectedFile);
      formData.append("date", date);

      console.log("Upload request details:", {
        file: selectedFile.name,
        fileSize: selectedFile.size,
        date,
        token: token ? "present" : "missing",
      });

      const response = await axios.post(
        `${API_BASE_URL}/excel-upload/students`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const result = response.data.data;
        setUploadResult(result);
        setSuccess(response.data.message);

        toast.success(response.data.message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        });

        // Reset form
        setSelectedFile(null);
        const fileInput = document.getElementById("file-upload");
        if (fileInput) fileInput.value = "";
      } else {
        setError(response.data.message || "Upload failed");
        toast.error(response.data.message || "Upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);

      let errorMessage = "An unexpected error occurred. Please try again.";

      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = "Access token required. Please log in again.";
          setTimeout(() => {
            window.location.href = "/admin/login";
          }, 2000);
        } else if (err.response.data) {
          errorMessage = err.response.data.message || "Upload failed";
          console.error("Server error message:", err.response.data.message);
        }
      } else if (err.request) {
        errorMessage =
          "Network error. Please check your connection and try again.";
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setError("Access token required. Please log in again.");
        return;
      }

      // Show loading state
      toast.info("Preparing Excel template for download...");

      // Call the download-template endpoint to get the actual Excel file
      const response = await fetch(`${API_BASE_URL}/excel-upload/download-template`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the blob data
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Student_Upload_Template.xlsx";
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Excel template downloaded successfully! Use this template with the exact headers provided.");
      
    } catch (err) {
      console.error("Download template error:", err);
      
      // Fallback to the old CSV method if Excel download fails
      try {
        const response = await apiClient.get("/excel-upload/template");
        if (response.data.success) {
          const template = response.data.data;

          // Create CSV content with your exact headers
          const headers = [
            "Trip #",
            "Actual Arrival Time / Departure Pick Up Time", 
            "Arr Time / Dep PU",
            "Flight #",
            "D/I",
            "M or F", 
            "Student Number",
            "Student Given Name",
            "Student Family Name",
            "Host Given Name",
            "Host Family Name",
            "Phone H=Home C=Cell B=Business",
            "Address",
            "City",
            "Special Instructions",
            "Study Permit Y or N",
            "School",
            "Staff Member Assigned",
            "Client"
          ];
          
          // Sample data row
          const sampleRow = [
            "1",
            "5:10 PM / 8:00 AM",
            "5:10 PM / 8:00 AM", 
            "TK 075",
            "I",
            "M",
            "733382",
            "Osama",
            "Alansar",
            "Rose",
            "Pugosa",
            "C=6044909182",
            "Clinton Street",
            "Burnaby",
            "",
            "N",
            "EC",
            "Staff Member 1",
            "EC"
          ];

          const csvContent = `${headers.join(",")}\n${sampleRow.join(",")}`;

          // Create and download CSV file
          const blob = new Blob([csvContent], { type: "text/csv" });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "student_upload_template.csv";
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);

          toast.success("CSV template downloaded as fallback. Please convert to Excel format before uploading.");
        }
      } catch (fallbackErr) {
        console.error("Fallback download error:", fallbackErr);
        setError("Failed to download template. Please try again.");
        toast.error("Failed to download template. Please try again.");
      }
    }
  };

  const clearResults = () => {
    setUploadResult(null);
    setError("");
    setSuccess("");
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
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 overflow-x-hidden bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {/* Page Title */}
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold text-blue-500">
                Upload Student Data
              </h1>
              <Button
                onClick={downloadTemplate}
                className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 shadow-md hover:shadow-lg transition-all"
              >
                <Download className="h-5 w-5" />
                <span>Download Excel Template</span>
              </Button>
            </div>

            {/* Error and Success Messages */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-red-700">{error}</span>
                  </div>
                  <Button
                    onClick={() => setError("")}
                    className="text-red-500 hover:text-red-700"
                    variant="ghost"
                    size="sm"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-300 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-green-700">{success}</span>
                  </div>
                  <Button
                    onClick={() => setSuccess("")}
                    className="text-green-500 hover:text-green-700"
                    variant="ghost"
                    size="sm"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Upload Form */}
            <Card className="bg-white border-gray-200 mb-8 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Upload Excel File
                    </h2>
                    <p className="text-sm text-gray-600">
                      Select an Excel file containing student data using the exact template format.
                    </p>
                  </div>
                  <Button
                    onClick={downloadTemplate}
                    variant="outline"
                    className="border-green-600 text-green-700 hover:bg-green-100 px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Get Template</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Info Section */}
                  <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-blue-800">
                          Excel Template Required
                        </h3>
                        <p className="text-sm text-blue-700 mt-1">
                          Download the Excel template above and use the exact column headers provided. 
                          Your Excel file must have all 19 columns in the correct order: Trip #, Actual Arrival Time / Departure Pick Up Time, Arr Time / Dep PU, Flight #, D/I, M or F, Student Number, Student Given Name, Student Family Name, Host Given Name, Host Family Name, Phone H=Home C=Cell B=Business, Address, City, Special Instructions, Study Permit Y or N, School, Staff Member Assigned, Client.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Form Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Date Selection */}
                    <div className="space-y-2">
                      <Label className="text-gray-700 text-sm font-medium">
                        Date *
                      </Label>
                      <div className="relative">
                        <Input
                          type="date"
                          value={date}
                          onChange={(e) => {
                            const v = e.target.value;
                            setDate(v);
                            // Auto-load students when date changes
                            fetchStudentsForDate(v);
                          }}
                          className="w-full bg-white text-gray-900 px-3 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm pr-10"
                        />
                        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      </div>
                    </div>

                    {/* File Selection */}
                    <div className="space-y-2">
                      <Label className="text-gray-700 text-sm font-medium">
                        Excel File *
                      </Label>
                      <div className="relative">
                        <input
                          type="file"
                          accept=".xlsx,.xls"
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          id="file-upload"
                        />
                        <div className="w-full bg-white text-gray-900 px-4 py-3 rounded-lg border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 text-sm h-12 flex items-center justify-between cursor-pointer">
                          <span
                            className={
                              selectedFile ? "text-gray-900" : "text-gray-400"
                            }
                          >
                            {selectedFile
                              ? selectedFile.name
                              : "No file selected"}
                          </span>
                          <div className="flex items-center space-x-2">
                            <FileSpreadsheet className="h-4 w-4 text-gray-400" />
                            <span className="bg-gray-200 px-3 py-1 rounded text-xs text-gray-600">
                              Browse...
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Upload Button */}
                  <div className="flex justify-center">
                    <Button
                      onClick={handleUpload}
                      disabled={isUploading || !selectedFile || !date}
                      className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-lg font-medium disabled:opacity-50 flex items-center space-x-2"
                    >
                      <UploadIcon className="h-4 w-4" />
                      <span>
                        {isUploading ? "Uploading..." : "Upload Students"}
                      </span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upload Results */}
            {uploadResult && (
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Upload Results
                    </h2>
                    <Button
                      onClick={clearResults}
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-800">
                        {uploadResult.totalProcessed}
                      </div>
                      <div className="text-sm text-gray-600">
                        Total Processed
                      </div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-800">
                        {uploadResult.created}
                      </div>
                      <div className="text-sm text-gray-600">
                        Successfully Created
                      </div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {uploadResult.errorsCount ?? uploadResult.errors}
                      </div>
                      <div className="text-sm text-gray-600">Errors</div>
                    </div>
                  </div>

                  {/* Created Students */}
                  {uploadResult.createdStudents &&
                    uploadResult.createdStudents.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-md font-semibold text-gray-900 mb-3">
                          Created Students
                        </h3>
                        <div className="bg-green-50 border border-green-300 rounded-lg p-4 max-h-60 overflow-y-auto">
                          {uploadResult.createdStudents.map(
                            (student, index) => (
                              <div
                                key={index}
                                className="text-sm text-green-700 mb-1"
                              >
                                Row {student.row}: {student.studentGivenName}{" "}
                                {student.studentFamilyName} ({student.studentNo}
                                )
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* Errors */}
                  {uploadResult.errors && uploadResult.errors.length > 0 && (
                    <div>
                      <h3 className="text-md font-semibold text-gray-900 mb-3">
                        Errors
                      </h3>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                        {uploadResult.errors.map((error, index) => (
                          <div
                            key={index}
                            className="text-sm text-red-700 mb-1"
                          >
                            Row {error.row}: {error.message}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Students for Selected Date */}
            <Card className="bg-white border-gray-200 shadow-sm mt-8">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Students for Selected Date
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {studentsForDate.length} student
                      {studentsForDate.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => fetchStudentsForDate(date)}
                      disabled={!date || isLoadingStudents}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800"
                      variant="secondary"
                    >
                      {isLoadingStudents ? "Loading..." : "Refresh"}
                    </Button>
                    <Button
                      onClick={async () => {
                        if (!date) {
                          toast.error("Please select a date first");
                          return;
                        }
                        if (studentsForDate.length === 0) {
                          toast.info(
                            "No students to delete for the selected date"
                          );
                          return;
                        }
                        const confirmed = window.confirm(
                          `Are you sure you want to delete all ${
                            studentsForDate.length
                          } students for ${new Date(
                            date
                          ).toLocaleDateString()}? This cannot be undone.`
                        );
                        if (!confirmed) return;
                        try {
                          const resp = await apiClient.delete(
                            "/students/by-date",
                            {
                              params: { date },
                            }
                          );
                          if (resp.data.success) {
                            toast.success(
                              resp.data.message || "Deleted students for date"
                            );
                            // Refresh list after delete
                            fetchStudentsForDate(date);
                          }
                        } catch (err) {
                          console.error("Delete by date error:", err);
                          toast.error(
                            err.response?.data?.message ||
                              "Failed to delete students for date"
                          );
                        }
                      }}
                      disabled={
                        !date ||
                        isLoadingStudents ||
                        studentsForDate.length === 0
                      }
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      Delete All for Date
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
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
                          Flight
                        </th>
                        <th className="text-gray-700 font-medium text-left px-4 py-3 border-b border-gray-200">
                          School
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoadingStudents ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="text-center py-6 text-gray-600"
                          >
                            Loading students...
                          </td>
                        </tr>
                      ) : studentsForDate.length > 0 ? (
                        studentsForDate.map((s, idx) => (
                          <tr key={s._id || idx} className="hover:bg-gray-50">
                            <td className="text-gray-700 px-4 py-3 border-b border-gray-200">
                              {s.excelOrder ?? idx + 1}
                            </td>
                            <td className="text-gray-700 px-4 py-3 border-b border-gray-200">
                              {s.studentNo}
                            </td>
                            <td className="text-gray-700 px-4 py-3 border-b border-gray-200">
                              {s.studentGivenName} {s.studentFamilyName}
                            </td>
                            <td className="text-gray-700 px-4 py-3 border-b border-gray-200">
                              {s.flight}
                            </td>
                            <td className="text-gray-700 px-4 py-3 border-b border-gray-200">
                              {s.school}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={5}
                            className="text-center py-6 text-gray-500"
                          >
                            No students for selected date
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Upload Instructions Card */}
            <Card className="bg-white border-gray-200 shadow-sm mt-8">
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <FileSpreadsheet className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Excel Template Instructions
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Download the Excel template above and fill in your student data with the exact column headers provided.
                  </p>
                  <div className="text-sm text-gray-600 space-y-2">
                    <p><strong>Required:</strong> Use the exact 19 column headers from the template</p>
                    <p><strong>File formats:</strong> .xlsx, .xls (Excel format required)</p>
                    <p><strong>Maximum file size:</strong> 10MB</p>
                    <p><strong>D/I column:</strong> Use "D" for Domestic or "I" for International</p>
                    <p><strong>M or F column:</strong> Use "M" for Male or "F" for Female</p>
                    <p><strong>Student Number:</strong> Can be left empty for auto-generation</p>
                    <p><strong>Phone format:</strong> Use H=1234567890, C=1234567890, or B=1234567890</p>
                  </div>
                </div>
              </CardContent>
            </Card>
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
