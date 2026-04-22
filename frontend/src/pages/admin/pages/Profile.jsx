import React, { useState, useEffect } from "react";
import { Search, User, Save, RefreshCw, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";
import Sidebar from "../components/Sidebar";

export default function Profile() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    currentPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  // Fetch admin profile data on component mount
  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      setIsLoading(true);
      // Get admin data from sessionStorage or localStorage
      const adminData = JSON.parse(sessionStorage.getItem("user") || "{}");

      if (adminData.username && adminData.email) {
        setFormData((prev) => ({
          ...prev,
          username: adminData.username || "",
          email: adminData.email || "",
        }));
      }
    } catch (error) {
      console.error("Error fetching admin profile:", error);
      toast.error("Failed to fetch admin profile");
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.username.trim()) {
      toast.error("Username is required");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password && formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      setIsUpdating(true);

      // Here you would typically make an API call to update the profile
      // For now, we'll simulate the update
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update sessionStorage
      const currentUser = JSON.parse(sessionStorage.getItem("user") || "{}");
      const updatedUser = {
        ...currentUser,
        username: formData.username,
        email: formData.email,
      };
      sessionStorage.setItem("user", JSON.stringify(updatedUser));

      toast.success("Profile updated successfully!");

      // Clear password fields
      setFormData((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
        currentPassword: "",
      }));
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReset = () => {
    fetchAdminProfile();
    setFormData((prev) => ({
      ...prev,
      password: "",
      confirmPassword: "",
      currentPassword: "",
    }));
    toast.info("Profile data reset");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 min-h-screen w-full">
        {/* Header */}
        <div className="bg-white border-b px-4 md:px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="md:hidden w-12"></div>

            {/* Search Bar */}
            <div className="relative flex-1 max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Type to search..."
                className="w-full bg-gray-50 pl-12 pr-4 py-3 rounded-xl border-gray-200 focus:border-black focus:ring-black"
              />
            </div>

            {/* Admin User */}
            <div className="flex items-center space-x-3 ml-6">
              <span className="hidden sm:block text-gray-900 font-medium">Admin User</span>
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            {/* Page Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Profile Settings</h1>
                <p className="text-gray-600 mt-1">Manage your account information and security</p>
              </div>
              <Button
                onClick={handleReset}
                disabled={isLoading}
                variant="outline"
                className="flex items-center gap-2 w-full sm:w-auto"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                Reset Changes
              </Button>
            </div>

            {/* Profile Form */}
            <Card className="shadow-lg border-0">
              <CardHeader className="border-b bg-gray-50">
                <CardTitle className="text-xl text-gray-900">Personal Information</CardTitle>
                <CardDescription>
                  Update your profile information and change your password securely
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Basic Information */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                      <Badge variant="outline" className="text-xs">Required</Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Username */}
                      <div className="space-y-2">
                        <Label htmlFor="username" className="text-gray-900 font-medium">
                          Username *
                        </Label>
                        <Input
                          id="username"
                          name="username"
                          type="text"
                          value={formData.username}
                          onChange={handleInputChange}
                          className="bg-white border-gray-300 focus:border-black focus:ring-black"
                          placeholder="Enter your username"
                          required
                        />
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-900 font-medium">
                          Email Address *
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="bg-white border-gray-300 focus:border-black focus:ring-black"
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password Change Section */}
                  <div className="border-t pt-8">
                    <div className="flex items-center gap-2 mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
                      <Badge variant="secondary" className="text-xs">Optional</Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-6">
                        {/* Current Password */}
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword" className="text-gray-900 font-medium">
                            Current Password
                          </Label>
                          <div className="relative">
                            <Input
                              id="currentPassword"
                              name="currentPassword"
                              type={showCurrentPassword ? "text" : "password"}
                              value={formData.currentPassword}
                              onChange={handleInputChange}
                              className="bg-white border-gray-300 focus:border-black focus:ring-black pr-10"
                              placeholder="Enter current password"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            >
                              {showCurrentPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-500" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-500" />
                              )}
                            </Button>
                          </div>
                        </div>

                        {/* New Password */}
                        <div className="space-y-2">
                          <Label htmlFor="password" className="text-gray-900 font-medium">
                            New Password
                          </Label>
                          <div className="relative">
                            <Input
                              id="password"
                              name="password"
                              type={showPassword ? "text" : "password"}
                              value={formData.password}
                              onChange={handleInputChange}
                              className="bg-white border-gray-300 focus:border-black focus:ring-black pr-10"
                              placeholder="Enter new password"
                              minLength={6}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-500" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-500" />
                              )}
                            </Button>
                          </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword" className="text-gray-900 font-medium">
                            Confirm New Password
                          </Label>
                          <div className="relative">
                            <Input
                              id="confirmPassword"
                              name="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              value={formData.confirmPassword}
                              onChange={handleInputChange}
                              className="bg-white border-gray-300 focus:border-black focus:ring-black pr-10"
                              placeholder="Confirm new password"
                              minLength={6}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-500" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-500" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Password Requirements */}
                      <div className="space-y-4">
                        <Label className="text-gray-900 font-medium">Password Requirements</Label>
                        <Card className="bg-gray-50 border-gray-200">
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className={`flex items-center gap-3 ${
                                formData.password.length >= 6 ? "text-green-600" : "text-gray-500"
                              }`}>
                                <div className={`w-2 h-2 rounded-full ${
                                  formData.password.length >= 6 ? "bg-green-500" : "bg-gray-300"
                                }`}></div>
                                <span className="text-sm">At least 6 characters</span>
                              </div>
                              <div className={`flex items-center gap-3 ${
                                formData.password === formData.confirmPassword && formData.password
                                  ? "text-green-600" : "text-gray-500"
                              }`}>
                                <div className={`w-2 h-2 rounded-full ${
                                  formData.password === formData.confirmPassword && formData.password
                                    ? "bg-green-500" : "bg-gray-300"
                                }`}></div>
                                <span className="text-sm">Passwords match</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>

                  {/* Form Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                    <Button
                      type="submit"
                      disabled={isLoading || isUpdating}
                      className="bg-black hover:bg-gray-800 text-white px-8 py-3 font-medium flex items-center justify-center gap-2 flex-1 sm:flex-none"
                    >
                      {isUpdating ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Updating Profile...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Update Profile
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleReset}
                      disabled={isLoading || isUpdating}
                      className="px-8 py-3 font-medium flex-1 sm:flex-none"
                    >
                      Cancel Changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white border-t px-4 md:px-6 py-4 mt-8">
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