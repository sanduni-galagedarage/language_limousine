import { useState } from "react";
import {
  Search,
  User,
  Calendar,
  Download as DownloadIcon,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import Sidebar from "../../components/Sidebar";
import axios from "axios";
import { API_BASE_URL } from "@/lib/config";
import { toast } from "react-toastify";

export default function Download() {
  const [selectedDate, setSelectedDate] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
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

  const handleDownload = async () => {
    if (!selectedDate) {
      toast.error("Please select a date first");
      return;
    }

    setIsDownloading(true);
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

      // Create a temporary link element to trigger download
      const link = document.createElement("a");
      link.href = `${apiClient.defaults.baseURL}/export/pdf?date=${selectedDate}`;
      link.download = `students_${selectedDate.replace(/-/g, "_")}.pdf`;

      // Add authorization header to the URL (not ideal but works for GET requests)
      // For production, consider using a different approach
      const response = await apiClient.get(`/export/pdf?date=${selectedDate}`, {
        responseType: "blob",
      });

      // Create blob URL and trigger download
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      link.href = url;
      link.click();

      // Clean up
      window.URL.revokeObjectURL(url);

      toast.success("PDF downloaded successfully!");
    } catch (err) {
      console.error("Download error:", err);
      let errorMessage = "Failed to download PDF";

      if (err.response?.status === 401) {
        errorMessage = "Access token required. Please log in again.";
        setTimeout(() => {
          window.location.href = "/admin/login";
        }, 2000);
      } else if (err.response?.status === 400) {
        errorMessage = "No students found for the selected date";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsDownloading(false);
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
              Download Student Data
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

            {/* Download Form */}
            <Card className="bg-white border-gray-200 mb-8 shadow-sm">
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Form Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
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

                    {/* Download Button */}
                    <div>
                      <Button
                        onClick={handleDownload}
                        disabled={isDownloading || !selectedDate}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-medium w-full h-12 flex items-center justify-center space-x-2 disabled:opacity-50"
                      >
                        {isDownloading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Downloading...</span>
                          </>
                        ) : (
                          <>
                            <DownloadIcon className="h-4 w-4" />
                            <span>Download PDF</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Download Instructions Card */}
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <DownloadIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Download Student Data as PDF
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Select a date to download the student data for that specific
                    day as a PDF file.
                  </p>
                  <div className="text-sm text-gray-400 space-y-1">
                    <p>Download format: PDF (.pdf)</p>
                    <p>
                      File includes: Student numbers, names, trip details,
                      arrival times, flights, and schools
                    </p>
                    <p>Students are sorted alphabetically by family name</p>
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
