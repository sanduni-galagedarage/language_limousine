import { useState } from "react";
import {
  UserPlus,
  User,
  Calendar,
  Plane,
  MapPin,
  GraduationCap,
  Phone,
  Home,
  Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Sidebar from "../components/Siebar";

export default function AddStudentsPage() {
  const [formData, setFormData] = useState({
    selectDate: "",
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
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sample student data
  const studentsData = [
    {
      id: 1,
      actions: "Delete",
      date: "2025-10-27",
      trip: "84",
      arrivalTime: "13:30:00",
      actualArrivalTime: "13:30:00",
      flight: "AC 301",
      dOrI: "D",
      mOrF: "M",
      confirmNumber: "765175",
      studentGivenName: "Carlisle",
      studentFamilyName: "All-Stars",
      hostGivenName: "Carlisle All-Stars",
      hostFamilyName: "Pender",
      phone: "",
      address:
        "Disappeared blistering/hatching Passing not to parameters As cblessing of hope Strong, disappeared in / Names language/timor/ public flusher/ schools/ safe-students-play on-line 392",
      city: "",
      school: "",
    },
    {
      id: 2,
      actions: "Delete",
      date: "2025-10-27",
      trip: "84",
      arrivalTime: "13:30:00",
      actualArrivalTime: "13:30:00",
      flight: "AC 301",
      dOrI: "D",
      mOrF: "F",
      confirmNumber: "361801",
      studentGivenName: "LIMA",
      studentFamilyName: "MARGARIDADE",
      hostGivenName: "LIMA ALVES",
      hostFamilyName: "Beu",
      phone: "ONG",
      address:
        "Disappeared blistering/hatching Passing not to parameters As cblessing of hope Strong, disappeared in / Names language/timor/ public flusher/ schools/ safe-students-play on-line 392",
      city: "",
      school: "",
    },
    // Add more sample data...
  ];

  const totalPages = Math.ceil(studentsData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = studentsData.slice(startIndex, endIndex);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    console.log("Form submitted:", formData);
    // Add submit logic here
    alert("Student data submitted successfully!");
  };

  const handleReset = () => {
    setFormData({
      selectDate: "",
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
    });
  };

  const handleDelete = (id) => {
    console.log("Delete student:", id);
    // Add delete logic here
  };

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-0 md:ml-64 min-h-screen w-full bg-white">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-gray-200">
          <div className="flex items-center justify-between px-4 md:px-6 py-4 max-w-7xl mx-auto">
            {/* Mobile Menu Space */}
            <div className="md:hidden w-10" />

            {/* Title */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 border border-blue-100">
                <UserPlus className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-gray-900">
                  Add Students
                </h1>
                <p className="text-sm text-gray-500">
                  Manage student information and arrival details
                </p>
              </div>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">Admin</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 transition-colors">
                <User className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 md:px-6 py-6 max-w-7xl">
          {/* Form Card */}
          <Card className="bg-white shadow-lg border border-gray-200 rounded-xl mb-6">
            <CardHeader className="pb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl border-b border-gray-100">
              <CardTitle className="flex items-center gap-3 text-gray-900">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                  <UserPlus className="h-4 w-4 text-blue-600" />
                </div>
                Student Information Form
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Row 1 */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Select the date
                  </Label>
                  <Input
                    type="date"
                    value={formData.selectDate}
                    onChange={(e) =>
                      handleInputChange("selectDate", e.target.value)
                    }
                    className="border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Trip
                  </Label>
                  <Input
                    value={formData.trip}
                    onChange={(e) => handleInputChange("trip", e.target.value)}
                    placeholder="Enter trip"
                    className="border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Actual Arrival Time
                  </Label>
                  <Input
                    type="time"
                    value={formData.actualArrivalTime}
                    onChange={(e) =>
                      handleInputChange("actualArrivalTime", e.target.value)
                    }
                    className="border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Arrival Time
                  </Label>
                  <Input
                    type="time"
                    value={formData.arrivalTime}
                    onChange={(e) =>
                      handleInputChange("arrivalTime", e.target.value)
                    }
                    className="border-gray-300"
                  />
                </div>

                {/* Row 2 */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Plane className="h-4 w-4" />
                    Flight
                  </Label>
                  <Input
                    value={formData.flight}
                    onChange={(e) =>
                      handleInputChange("flight", e.target.value)
                    }
                    placeholder="Enter flight"
                    className="border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    D or I
                  </Label>
                  <Select
                    value={formData.dOrI}
                    onValueChange={(value) => handleInputChange("dOrI", value)}
                  >
                    <SelectTrigger className="border-gray-300">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="D">D</SelectItem>
                      <SelectItem value="I">I</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    M or F
                  </Label>
                  <Select
                    value={formData.mOrF}
                    onValueChange={(value) => handleInputChange("mOrF", value)}
                  >
                    <SelectTrigger className="border-gray-300">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">M</SelectItem>
                      <SelectItem value="F">F</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Student No
                  </Label>
                  <Input
                    value={formData.studentNo}
                    onChange={(e) =>
                      handleInputChange("studentNo", e.target.value)
                    }
                    placeholder="Enter student number"
                    className="border-gray-300"
                  />
                </div>

                {/* Row 3 */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Student Given Name
                  </Label>
                  <Input
                    value={formData.studentGivenName}
                    onChange={(e) =>
                      handleInputChange("studentGivenName", e.target.value)
                    }
                    placeholder="Enter given name"
                    className="border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Student Family Name
                  </Label>
                  <Input
                    value={formData.studentFamilyName}
                    onChange={(e) =>
                      handleInputChange("studentFamilyName", e.target.value)
                    }
                    placeholder="Enter family name"
                    className="border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Host Given Name
                  </Label>
                  <Input
                    value={formData.hostGivenName}
                    onChange={(e) =>
                      handleInputChange("hostGivenName", e.target.value)
                    }
                    placeholder="Enter host given name"
                    className="border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Host Family Name
                  </Label>
                  <Input
                    value={formData.hostFamilyName}
                    onChange={(e) =>
                      handleInputChange("hostFamilyName", e.target.value)
                    }
                    placeholder="Enter host family name"
                    className="border-gray-300"
                  />
                </div>

                {/* Row 4 */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone
                  </Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="Enter phone number"
                    className="border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Address
                  </Label>
                  <Input
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    placeholder="Enter address"
                    className="border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    City
                  </Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="Enter city"
                    className="border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    School
                  </Label>
                  <Input
                    value={formData.school}
                    onChange={(e) =>
                      handleInputChange("school", e.target.value)
                    }
                    placeholder="Enter school"
                    className="border-gray-300"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                <Button
                  onClick={handleSubmit}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
                  size="lg"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Submit
                </Button>

                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="flex-1 bg-gray-50 hover:bg-gray-100 border-gray-300 text-gray-700 font-medium py-3"
                  size="lg"
                >
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Data Table Card */}
          <Card className="bg-white shadow-lg border border-gray-200 rounded-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-gray-900">
                Students List
              </CardTitle>
              <p className="text-sm text-gray-500">
                Showing {startIndex + 1} to{" "}
                {Math.min(endIndex, studentsData.length)} of{" "}
                {studentsData.length} entries
              </p>
            </CardHeader>

            <CardContent className="p-0">
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left p-3 text-xs font-medium text-gray-700 border-r border-gray-200">
                        Actions
                      </th>
                      <th className="text-left p-3 text-xs font-medium text-gray-700 border-r border-gray-200">
                        Excel Order
                      </th>
                      <th className="text-left p-3 text-xs font-medium text-gray-700 border-r border-gray-200">
                        Date
                      </th>
                      <th className="text-left p-3 text-xs font-medium text-gray-700 border-r border-gray-200">
                        Trip
                      </th>
                      <th className="text-left p-3 text-xs font-medium text-gray-700 border-r border-gray-200">
                        Arrival Time
                      </th>
                      <th className="text-left p-3 text-xs font-medium text-gray-700 border-r border-gray-200">
                        Actual Arrival Time
                      </th>
                      <th className="text-left p-3 text-xs font-medium text-gray-700 border-r border-gray-200">
                        Flight
                      </th>
                      <th className="text-left p-3 text-xs font-medium text-gray-700 border-r border-gray-200">
                        D or I
                      </th>
                      <th className="text-left p-3 text-xs font-medium text-gray-700 border-r border-gray-200">
                        M or F
                      </th>
                      <th className="text-left p-3 text-xs font-medium text-gray-700 border-r border-gray-200">
                        Confirm Number
                      </th>
                      <th className="text-left p-3 text-xs font-medium text-gray-700 border-r border-gray-200">
                        Student Given Name
                      </th>
                      <th className="text-left p-3 text-xs font-medium text-gray-700 border-r border-gray-200">
                        Student Family Name
                      </th>
                      <th className="text-left p-3 text-xs font-medium text-gray-700 border-r border-gray-200">
                        Host Given Name
                      </th>
                      <th className="text-left p-3 text-xs font-medium text-gray-700">
                        Host Family Name
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.map((student) => (
                      <tr
                        key={student.id}
                        className="hover:bg-gray-50 border-b border-gray-200"
                      >
                        <td className="p-3 border-r border-gray-200">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(student.id)}
                            className="bg-red-500 hover:bg-red-600 text-xs px-3 py-1"
                          >
                            Delete
                          </Button>
                        </td>
                        <td className="p-3 text-xs border-r border-gray-200">
                          {student.excelOrder || "N/A"}
                        </td>
                        <td className="p-3 text-xs border-r border-gray-200">
                          {student.date}
                        </td>
                        <td className="p-3 text-xs border-r border-gray-200">
                          {student.trip}
                        </td>
                        <td className="p-3 text-xs border-r border-gray-200">
                          {student.arrivalTime}
                        </td>
                        <td className="p-3 text-xs border-r border-gray-200">
                          {student.actualArrivalTime}
                        </td>
                        <td className="p-3 text-xs border-r border-gray-200">
                          {student.flight}
                        </td>
                        <td className="p-3 text-xs border-r border-gray-200">
                          {student.dOrI}
                        </td>
                        <td className="p-3 text-xs border-r border-gray-200">
                          {student.mOrF}
                        </td>
                        <td className="p-3 text-xs border-r border-gray-200">
                          {student.confirmNumber}
                        </td>
                        <td className="p-3 text-xs border-r border-gray-200">
                          {student.studentGivenName}
                        </td>
                        <td className="p-3 text-xs border-r border-gray-200">
                          {student.studentFamilyName}
                        </td>
                        <td className="p-3 text-xs border-r border-gray-200">
                          {student.hostGivenName}
                        </td>
                        <td className="p-3 text-xs">
                          {student.hostFamilyName}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Showing {startIndex + 1} to{" "}
                  {Math.min(endIndex, studentsData.length)} of{" "}
                  {studentsData.length} entries
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  <div className="flex gap-1">
                    {[...Array(totalPages)].map((_, i) => (
                      <Button
                        key={i + 1}
                        variant={currentPage === i + 1 ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(i + 1)}
                        className="w-8 h-8"
                      >
                        {i + 1}
                      </Button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white mt-auto">
          <div className="container mx-auto px-4 md:px-6 py-4">
            <p className="text-center text-sm text-gray-500">
              Copyright © 2024. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
