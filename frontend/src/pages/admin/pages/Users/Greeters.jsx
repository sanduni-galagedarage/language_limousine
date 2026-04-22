import React, { useState, useEffect } from "react";
import {
  Search,
  User,
  Trash2,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react";

import Sidebar from "../../components/Sidebar";
import axios from "axios";
import { API_BASE_URL } from "@/lib/config";
import { toast } from "react-toastify";

export default function Greeters() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    gender: "",
    greeterID: "",
    role: "Greeter",
  });

  const [greeters, setGreeters] = useState([]);
  const [entriesPerPage, setEntriesPerPage] = useState("10");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingGreeters, setIsFetchingGreeters] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // Get auth token from sessionStorage (matching your sidebar logout function)
  const getAuthToken = () => {
    return (
      sessionStorage.getItem("admin_token") || localStorage.getItem("authToken")
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

  // Fetch greeters on component mount and when search/pagination changes
  useEffect(() => {
    fetchGreeters();
  }, [currentPage, searchTerm, entriesPerPage]);

  const fetchGreeters = async () => {
    setIsFetchingGreeters(true);
    try {
      const token = getAuthToken();
      if (!token) {
        setError("Access token required. Please log in again.");
        window.location.href = "/admin/login";
        return;
      }

      const response = await apiClient.get("/users/role/Greeter", {
        params: {
          page: currentPage,
          limit: entriesPerPage,
          search: searchTerm,
        },
      });

      if (response.data.success) {
        setGreeters(response.data.data.users);
        setTotalPages(response.data.data.pagination.totalPages);
        setTotalUsers(response.data.data.pagination.totalUsers);
      }
    } catch (err) {
      console.error("Error fetching greeters:", err);
      let errorMessage = "Failed to fetch greeters";

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
      setIsFetchingGreeters(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear errors when user starts typing
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

  const validateForm = () => {
    // Reset previous errors
    setError("");

    if (!formData.username.trim()) {
      setError("Username is required");
      return false;
    }
    if (formData.username.trim().length < 3) {
      setError("Username must be at least 3 characters long");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!formData.email.includes("@") || !formData.email.includes(".")) {
      setError("Please enter a valid email address");
      return false;
    }
    if (!formData.password.trim()) {
      setError("Password is required");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    if (!formData.gender) {
      setError("Gender is required");
      return false;
    }
    if (!formData.greeterID.trim()) {
      setError("Greeter ID is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setError("Access token required. Please log in again.");
      toast.error("Access token required. Please log in again.");
      // Redirect to login page
      window.location.href = "/admin/login";
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await apiClient.post("/users", formData);

      const data = response.data;

      if (data.success) {
        const successMessage =
          data.message || "Greeter registered successfully!";
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

        // Refresh the greeters list
        await fetchGreeters();
        handleReset();
      } else {
        const errorMessage = data.message || "Registration failed";
        setError(errorMessage);
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (err) {
      console.error("Registration error:", err);

      let errorMessage = "An unexpected error occurred. Please try again.";

      // Handle axios error responses
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = "Access token required. Please log in again.";
          // Redirect to login on unauthorized
          setTimeout(() => {
            window.location.href = "/admin/login";
          }, 2000);
        } else if (err.response.status === 403) {
          errorMessage = "You don't have permission to perform this action.";
        } else if (err.response.data) {
          errorMessage = err.response.data.message || "Registration failed";

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
      username: "",
      email: "",
      password: "",
      gender: "",
      greeterID: "",
      role: "Greeter",
    });
    setError("");
    setSuccess("");
  };

  const handleDelete = async (greeterId) => {
    if (!window.confirm("Are you sure you want to delete this greeter?")) {
      return;
    }

    try {
      const token = getAuthToken();
      if (!token) {
        setError("Access token required. Please log in again.");
        window.location.href = "/admin/login";
        return;
      }

      const response = await apiClient.delete(`/users/${greeterId}`);

      if (response.data.success) {
        const successMessage = "Greeter deleted successfully!";
        setSuccess(successMessage);
        toast.success(successMessage);

        // Refresh the greeters list
        await fetchGreeters();
      }
    } catch (err) {
      console.error("Delete error:", err);
      let errorMessage = "Failed to delete greeter";

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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleEntriesPerPageChange = (e) => {
    setEntriesPerPage(e.target.value);
    setCurrentPage(1); // Reset to first page when changing entries per page
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

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
              <input
                type="text"
                placeholder="Type to search..."
                value={searchTerm}
                onChange={handleSearchChange}
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
              Add Greeter User
            </h1>

            {/* Error/Success Messages */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <span className="text-red-700">{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-green-700">{success}</span>
              </div>
            )}

            {/* Add Greeter Form */}
            <div className="bg-white border border-gray-200 rounded-lg mb-8">
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Username */}
                    <div className="space-y-2">
                      <label
                        htmlFor="username"
                        className="text-gray-700 text-sm font-medium block"
                      >
                        Username *
                      </label>
                      <input
                        id="username"
                        name="username"
                        type="text"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="w-full bg-white text-gray-800 border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        placeholder="Enter username"
                        disabled={isLoading}
                        required
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="text-gray-700 text-sm font-medium block"
                      >
                        Email *
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full bg-white text-gray-800 border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        placeholder="Enter email"
                        disabled={isLoading}
                        required
                      />
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                      <label
                        htmlFor="password"
                        className="text-gray-700 text-sm font-medium block"
                      >
                        Password *
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={handleInputChange}
                          className="w-full bg-white text-gray-800 border border-gray-300 rounded-md px-3 py-2 pr-10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          placeholder="Enter password"
                          disabled={isLoading}
                          minLength={6}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Gender */}
                    <div className="space-y-2">
                      <label className="text-gray-700 text-sm font-medium block">
                        Gender *
                      </label>
                      <select
                        value={formData.gender}
                        onChange={(e) =>
                          handleSelectChange("gender", e.target.value)
                        }
                        className="w-full bg-white text-gray-800 border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        disabled={isLoading}
                        required
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Greeter ID */}
                    <div className="space-y-2">
                      <label
                        htmlFor="greeterID"
                        className="text-gray-700 text-sm font-medium block"
                      >
                        Greeter ID *
                      </label>
                      <input
                        id="greeterID"
                        name="greeterID"
                        type="text"
                        value={formData.greeterID}
                        onChange={handleInputChange}
                        className="w-full bg-white text-gray-800 border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        placeholder="Enter greeter ID"
                        disabled={isLoading}
                        required
                      />
                    </div>

                    {/* Role */}
                    <div className="space-y-2">
                      <label
                        htmlFor="role"
                        className="text-gray-700 text-sm font-medium block"
                      >
                        Role
                      </label>
                      <input
                        id="role"
                        name="role"
                        type="text"
                        value={formData.role}
                        className="w-full bg-gray-100 text-gray-800 border border-gray-300 rounded-md px-3 py-2"
                        readOnly
                      />
                    </div>
                  </div>

                  {/* Form Buttons */}
                  <div className="flex justify-center space-x-4 pt-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[120px]"
                    >
                      {isLoading ? "Submitting..." : "Submit"}
                    </button>
                    <button
                      type="button"
                      onClick={handleReset}
                      disabled={isLoading}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[120px]"
                    >
                      Reset
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Greeters Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Table Controls */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-700 text-sm">Show</span>
                    <select
                      value={entriesPerPage}
                      onChange={handleEntriesPerPageChange}
                      className="border border-gray-300 rounded px-3 py-1 text-sm"
                      disabled={isFetchingGreeters}
                    >
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                    </select>
                    <span className="text-gray-700 text-sm">entries</span>
                    <span className="text-gray-500 text-sm ml-4">
                      (Total: {totalUsers} greeters)
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <label className="text-gray-700 text-sm">Search:</label>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={handleSearchChange}
                      className="bg-white text-gray-800 border border-gray-300 rounded px-3 py-1 text-sm w-48"
                      placeholder="Search greeters..."
                      disabled={isFetchingGreeters}
                    />
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left text-gray-700 font-medium px-6 py-3 border-b border-gray-200">
                        #
                      </th>
                      <th className="text-left text-gray-700 font-medium px-6 py-3 border-b border-gray-200">
                        Username
                      </th>
                      <th className="text-left text-gray-700 font-medium px-6 py-3 border-b border-gray-200">
                        Email
                      </th>
                      <th className="text-left text-gray-700 font-medium px-6 py-3 border-b border-gray-200">
                        Gender
                      </th>
                      <th className="text-left text-gray-700 font-medium px-6 py-3 border-b border-gray-200">
                        Greeter ID
                      </th>
                      <th className="text-left text-gray-700 font-medium px-6 py-3 border-b border-gray-200">
                        Status
                      </th>
                      <th className="text-left text-gray-700 font-medium px-6 py-3 border-b border-gray-200">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isFetchingGreeters ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="text-center text-gray-500 py-8 px-6"
                        >
                          Loading greeters...
                        </td>
                      </tr>
                    ) : greeters.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="text-center text-gray-500 py-8 px-6"
                        >
                          No greeters found
                        </td>
                      </tr>
                    ) : (
                      greeters.map((greeter, index) => (
                        <tr
                          key={greeter._id}
                          className="border-b border-gray-200 hover:bg-gray-50"
                        >
                          <td className="text-gray-800 px-6 py-4">
                            {(currentPage - 1) * parseInt(entriesPerPage) +
                              index +
                              1}
                          </td>
                          <td className="text-gray-800 px-6 py-4">
                            {greeter.username}
                          </td>
                          <td className="text-gray-800 px-6 py-4">
                            {greeter.email}
                          </td>
                          <td className="text-gray-800 px-6 py-4">
                            {greeter.gender}
                          </td>
                          <td className="text-gray-800 px-6 py-4">
                            {greeter.greeterID}
                          </td>
                          <td className="text-gray-800 px-6 py-4">
                            <span
                              className={`inline-flex px-2 py-1 text-xs rounded-full ${
                                greeter.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {greeter.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleDelete(greeter._id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm inline-flex items-center transition-colors disabled:opacity-50"
                              disabled={isFetchingGreeters}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing page {currentPage} of {totalPages}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || isFetchingGreeters}
                        className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={
                          currentPage === totalPages || isFetchingGreeters
                        }
                        className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
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
