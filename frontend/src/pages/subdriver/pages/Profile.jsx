import Sidebar from "../components/Sidebar";
import { useState, useEffect } from "react";
import { User, Eye, EyeOff, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { assignmentAPI } from "@/lib/api";

export default function SubDriverProfile() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    subdriverID: "",
    vehicleNumber: "",
    password: "••••••••••••",
    status: "Active",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [originalData, setOriginalData] = useState(null);

  // Fetch subdriver profile on component mount
  useEffect(() => {
    fetchSubdriverProfile();
  }, []);

  const fetchSubdriverProfile = async () => {
    setIsLoading(true);
    try {
      const response = await assignmentAPI.getSubdriverProfile();
      if (response.data.success) {
        const subdriverData = response.data.data.subdriver;
        setFormData({
          username: subdriverData.username || "",
          email: subdriverData.email || "",
          subdriverID: subdriverData.subdriverID || "",
          vehicleNumber: subdriverData.vehicleNumber || "",
          password: "••••••••••••",
          status: subdriverData.status || "Active",
        });
        setOriginalData(subdriverData);
      }
    } catch (error) {
      console.error("Error fetching subdriver profile:", error);
      alert("Failed to fetch profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    try {
      const updateData = {
        username: formData.username,
        email: formData.email,
        subdriverID: formData.subdriverID,
        vehicleNumber: formData.vehicleNumber,
        status: formData.status,
      };

      // Only include password if it's been changed
      if (formData.password !== "••••••••••••") {
        updateData.password = formData.password;
      }

      const response = await assignmentAPI.updateSubdriverProfile(updateData);

      if (response.data.success) {
        alert("Profile updated successfully!");
        // Refresh the profile data
        await fetchSubdriverProfile();
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update profile";
      alert(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReset = () => {
    if (originalData) {
      setFormData({
        username: originalData.username || "",
        email: originalData.email || "",
        subdriverID: originalData.subdriverID || "",
        vehicleNumber: originalData.vehicleNumber || "",
        password: "••••••••••••",
        status: originalData.status || "Active",
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex min-h-screen bg-white overflow-x-hidden">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 overflow-x-hidden ml-0 md:ml-64 min-h-screen w-full">
        {/* Header */}
        <div className="bg-white px-4 md:px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
              Edit Profile
            </h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4 md:p-8 lg:p-12 bg-white">
          <div className="max-w-6xl mx-auto">
            {/* Profile Form Card */}
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="p-6 md:p-8 lg:p-10">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    <span className="ml-2 text-gray-600">
                      Loading profile...
                    </span>
                  </div>
                ) : (
                  <form className="space-y-6 md:space-y-8">
                    {/* Row 1: Username and Email */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                      <div className="space-y-2">
                        <label className="text-gray-700 text-sm md:text-base font-medium">
                          Username
                        </label>
                        <Input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 md:py-4 text-sm md:text-base font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-gray-700 text-sm md:text-base font-medium">
                          Email
                        </label>
                        <Input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 md:py-4 text-sm md:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Row 2: Driver ID and Password */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                      <div className="space-y-2">
                        <label className="text-gray-700 text-sm md:text-base font-medium">
                          Subdriver ID
                        </label>
                        <Input
                          type="text"
                          name="subdriverID"
                          value={formData.subdriverID}
                          onChange={handleInputChange}
                          className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 md:py-4 text-sm md:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-gray-700 text-sm md:text-base font-medium">
                          Password
                        </label>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 md:py-4 pr-12 text-sm md:text-base font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Row 3: Vehicle No and Status */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                      <div className="space-y-2">
                        <label className="text-gray-700 text-sm md:text-base font-medium">
                          Vehicle No
                        </label>
                        <Input
                          type="text"
                          name="vehicleNumber"
                          value={formData.vehicleNumber}
                          onChange={handleInputChange}
                          className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 md:py-4 text-sm md:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-gray-700 text-sm md:text-base font-medium">
                          Status
                        </label>
                        <div className="relative">
                          <select
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 md:py-4 text-sm md:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none appearance-none cursor-pointer"
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="Pending">Pending</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                            <svg
                              className="w-4 h-4 text-gray-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 9l-7 7-7-7"
                              ></path>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-6 md:pt-8">
                      <Button
                        type="button"
                        onClick={handleUpdateProfile}
                        disabled={isUpdating || isLoading}
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 md:py-4 rounded-lg text-sm md:text-base transition-colors duration-200 focus:ring-2 focus:ring-blue-400 focus:outline-none disabled:opacity-50"
                      >
                        {isUpdating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          "Update Profile"
                        )}
                      </Button>
                      <Button
                        type="button"
                        onClick={handleReset}
                        disabled={isUpdating || isLoading}
                        className="w-full sm:w-auto bg-gray-600 hover:bg-gray-700 text-white font-semibold px-8 py-3 md:py-4 rounded-lg text-sm md:text-base transition-colors duration-200 focus:ring-2 focus:ring-gray-400 focus:outline-none disabled:opacity-50"
                      >
                        Reset
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
