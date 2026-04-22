import React, { useState, useEffect } from "react";
import {
  Search,
  User,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Save,
  X,
  RefreshCw,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "react-toastify";
import { userAPI } from "@/lib/api";
import Sidebar from "../../components/Sidebar";

export default function Admins() {
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Fetch admins on component mount
  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setIsLoading(true);
      const response = await userAPI.getAllAdmins();

      if (response.data.success) {
        setAdmins(response.data.data.admins);
      } else {
        toast.error("Failed to fetch admins");
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
      toast.error("Failed to fetch admins");
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

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setEditingAdmin(null);
    setShowAddForm(false);
  };

  const handleAddAdmin = async (e) => {
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

    if (!formData.password) {
      toast.error("Password is required");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      setIsLoading(true);

      const response = await userAPI.addAdmin({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      if (response.data.success) {
        toast.success("Admin added successfully!");
        resetForm();
        fetchAdmins(); // Refresh the list
      } else {
        toast.error(response.data.message || "Failed to add admin");
      }
    } catch (error) {
      console.error("Error adding admin:", error);
      toast.error(error.response?.data?.message || "Failed to add admin");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAdmin = async (e) => {
    e.preventDefault();

    if (!formData.username.trim()) {
      toast.error("Username is required");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }

    try {
      setIsLoading(true);

      // For now, we'll use the existing updateUser function
      // You might want to create a specific updateAdmin function
      const response = await userAPI.updateUser(editingAdmin._id, {
        username: formData.username,
        email: formData.email,
      });

      if (response.data.success) {
        toast.success("Admin updated successfully!");
        resetForm();
        fetchAdmins(); // Refresh the list
      } else {
        toast.error(response.data.message || "Failed to update admin");
      }
    } catch (error) {
      console.error("Error updating admin:", error);
      toast.error(error.response?.data?.message || "Failed to update admin");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) {
      return;
    }

    try {
      setIsLoading(true);

      const response = await userAPI.deleteUser(adminId);

      if (response.data.success) {
        toast.success("Admin deleted successfully!");
        fetchAdmins(); // Refresh the list
      } else {
        toast.error(response.data.message || "Failed to delete admin");
      }
    } catch (error) {
      console.error("Error deleting admin:", error);
      toast.error(error.response?.data?.message || "Failed to delete admin");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (adminId) => {
    try {
      setIsLoading(true);

      // Find the current admin to get the current status
      const currentAdmin = admins.find((admin) => admin._id === adminId);
      if (!currentAdmin) return;

      const response = await userAPI.updateUser(adminId, {
        isActive: !currentAdmin.isActive,
      });

      if (response.data.success) {
        toast.success("Admin status updated successfully!");
        fetchAdmins(); // Refresh the list
      } else {
        toast.error(response.data.message || "Failed to update admin status");
      }
    } catch (error) {
      console.error("Error updating admin status:", error);
      toast.error(
        error.response?.data?.message || "Failed to update admin status"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      username: admin.username,
      email: admin.email,
      password: "",
      confirmPassword: "",
    });
    setShowAddForm(true);
  };

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase())
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
                placeholder="Search admins..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
            {/* Page Title and Actions */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-500" />
                <h1 className="text-2xl font-semibold text-blue-500">
                  Admin Management
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setShowAddForm(true)}
                  disabled={isLoading}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Admin
                </Button>
                <Button
                  onClick={fetchAdmins}
                  disabled={isLoading}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Add/Edit Admin Form */}
            {showAddForm && (
              <Card className="bg-white border-gray-200 mb-8">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {editingAdmin ? "Edit Admin" : "Add New Admin"}
                    </h3>
                    <Button
                      onClick={resetForm}
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <form
                    onSubmit={editingAdmin ? handleEditAdmin : handleAddAdmin}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Username */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="username"
                          className="text-gray-700 text-sm font-medium"
                        >
                          Username *
                        </Label>
                        <Input
                          id="username"
                          name="username"
                          type="text"
                          value={formData.username}
                          onChange={handleInputChange}
                          className="bg-white text-gray-800 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Enter username"
                          required
                        />
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="email"
                          className="text-gray-700 text-sm font-medium"
                        >
                          Email *
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="bg-white text-gray-800 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Enter email"
                          required
                        />
                      </div>

                      {/* Password */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="password"
                          className="text-gray-700 text-sm font-medium"
                        >
                          {editingAdmin ? "New Password" : "Password *"}
                        </Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="bg-white text-gray-800 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          placeholder={
                            editingAdmin
                              ? "Leave blank to keep current"
                              : "Enter password"
                          }
                          minLength={6}
                          required={!editingAdmin}
                        />
                      </div>

                      {/* Confirm Password */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="confirmPassword"
                          className="text-gray-700 text-sm font-medium"
                        >
                          Confirm Password
                        </Label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="bg-white text-gray-800 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Confirm password"
                          minLength={6}
                          required={!editingAdmin}
                        />
                      </div>
                    </div>

                    {/* Form Buttons */}
                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        type="button"
                        onClick={resetForm}
                        variant="outline"
                        className="px-6 py-2"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 flex items-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            {editingAdmin ? "Updating..." : "Adding..."}
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            {editingAdmin ? "Update Admin" : "Add Admin"}
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Admins List */}
            <Card className="bg-white border-gray-200">
              <CardHeader className="pb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Admin Users ({filteredAdmins.length})
                </h3>
              </CardHeader>
              <CardContent className="p-6">
                {isLoading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="mx-auto h-8 w-8 text-blue-500 animate-spin mb-4" />
                    <p className="text-gray-500">Loading admins...</p>
                  </div>
                ) : filteredAdmins.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No admins found
                    </h3>
                    <p className="text-gray-500">
                      {searchTerm
                        ? "Try adjusting your search terms"
                        : "Get started by adding your first admin user"}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-700">
                            Username
                          </th>
                          <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-700">
                            Email
                          </th>
                          <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-700">
                            Role
                          </th>
                          <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-700">
                            Status
                          </th>
                          <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-700">
                            Created
                          </th>
                          <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-700">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAdmins.map((admin) => (
                          <tr key={admin._id} className="hover:bg-gray-50">
                            <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900">
                              {admin.username}
                            </td>
                            <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900">
                              {admin.email}
                            </td>
                            <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                Admin
                              </span>
                            </td>
                            <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  admin.isActive
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {admin.isActive ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900">
                              {new Date(admin.createdAt).toLocaleDateString()}
                            </td>
                            <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900">
                              <div className="flex items-center gap-2">
                                <Button
                                  onClick={() => startEdit(admin)}
                                  variant="ghost"
                                  size="sm"
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() => handleToggleStatus(admin._id)}
                                  variant="ghost"
                                  size="sm"
                                  className={`${
                                    admin.isActive
                                      ? "text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                      : "text-green-600 hover:text-green-700 hover:bg-green-50"
                                  }`}
                                >
                                  {admin.isActive ? "Deactivate" : "Activate"}
                                </Button>
                                <Button
                                  onClick={() => handleDeleteAdmin(admin._id)}
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
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
