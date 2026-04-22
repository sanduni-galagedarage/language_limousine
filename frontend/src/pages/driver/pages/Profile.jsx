import Sidebar from "../components/Sidebar";
import { useState, useEffect } from "react";
import { User, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { assignmentAPI } from "@/lib/api";
import { toast } from "react-toastify";

export default function DriverProfile() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    gender: "Male",
    password: "••••••••••••",
    driverID: "",
    status: "Off Duty",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [originalData, setOriginalData] = useState(null);

  // Fetch driver profile on component mount
  useEffect(() => {
    fetchDriverProfile();
  }, []);

  const fetchDriverProfile = async () => {
    setIsLoading(true);
    try {
      const response = await assignmentAPI.getDriverProfile();

      if (response.data.success) {
        const driver = response.data.data.driver;
        const profileData = {
          username: driver.username || "",
          email: driver.email || "",
          gender: driver.gender || "Male",
          password: "••••••••••••",
          driverID: driver.driverID || "",
          status: driver.status || "Off Duty",
        };

        setFormData(profileData);
        setOriginalData(profileData);
      }
    } catch (error) {
      console.error("Error fetching driver profile:", error);
      toast.error("Failed to fetch profile data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    try {
      const response = await assignmentAPI.updateDriverProfile(formData);

      if (response.data.success) {
        toast.success("Profile updated successfully!");
        setOriginalData(formData);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update profile";
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReset = () => {
    if (originalData) {
      setFormData(originalData);
      toast.info("Profile reset to original values");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-white overflow-x-hidden">
        <Sidebar />
        <div className="flex-1 overflow-x-hidden ml-0 md:ml-64 min-h-screen w-full flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white overflow-x-hidden">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 overflow-x-hidden ml-0 md:ml-64 min-h-screen w-full">
        {/* Header */}
        <div className="bg-white px-4 md:px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto gap-4">
            {/* Mobile Menu Space */}
            <div className="md:hidden w-10"></div>

            {/* Title */}
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
              Edit Profile
            </h1>

            {/* Driver User */}
            <div className="flex items-center space-x-3">
              <span className="text-gray-900 font-medium text-sm md:text-base">
                Driver User
              </span>
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4 md:p-6 overflow-x-hidden bg-white">
          <div className="max-w-5xl mx-auto">
            {/* Profile Form */}
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  {/* Username */}
                  <div className="space-y-2">
                    <label className="block text-gray-700 text-sm font-medium">
                      Username
                    </label>
                    <Input
                      type="text"
                      value={formData.username}
                      onChange={(e) =>
                        handleInputChange("username", e.target.value)
                      }
                      className="w-full bg-white text-gray-900 px-4 py-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="block text-gray-700 text-sm font-medium">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="w-full bg-white text-gray-900 px-4 py-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Gender */}
                  <div className="space-y-2">
                    <label className="block text-gray-700 text-sm font-medium">
                      Gender
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) =>
                        handleInputChange("gender", e.target.value)
                      }
                      className="w-full bg-white text-gray-900 px-4 py-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <label className="block text-gray-700 text-sm font-medium">
                      Password
                    </label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      placeholder="Enter new password to change"
                      className="w-full bg-white text-gray-900 px-4 py-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Driver ID */}
                  <div className="space-y-2">
                    <label className="block text-gray-700 text-sm font-medium">
                      Driver ID
                    </label>
                    <Input
                      type="text"
                      value={formData.driverID}
                      onChange={(e) =>
                        handleInputChange("driverID", e.target.value)
                      }
                      className="w-full bg-white text-gray-900 px-4 py-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Status - Full width on mobile, positioned appropriately on desktop */}
                  <div className="space-y-2 md:col-start-2">
                    <label className="block text-gray-700 text-sm font-medium">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        handleInputChange("status", e.target.value)
                      }
                      className="w-full bg-white text-gray-900 px-4 py-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Off Duty">Off Duty</option>
                      <option value="On Duty">On Duty</option>
                      <option value="Available">Available</option>
                      <option value="Busy">Busy</option>
                    </select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 pt-6 border-t border-gray-200">
                  <Button
                    onClick={handleUpdateProfile}
                    disabled={isUpdating}
                    className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded font-medium transition-colors disabled:opacity-50"
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
                    onClick={handleReset}
                    disabled={isUpdating}
                    className="w-full sm:w-auto bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded font-medium transition-colors disabled:opacity-50"
                  >
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-gray-200 px-6 py-4 mt-8">
          <div className="max-w-7xl mx-auto">
            <p className="text-center text-gray-500 text-sm">
              Copyright © 2024. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
