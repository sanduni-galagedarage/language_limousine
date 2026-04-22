import { useState, useEffect } from "react";
import { Search, User, Calendar, Filter, Loader } from "lucide-react";
import Sidebar from "../components/Siebar";
import { studentAPI } from "@/lib/api";
import { toast } from "react-toastify";

export default function StudentDetails() {
  const [selectedDate, setSelectedDate] = useState(""); // Will be set to current date

  const [searchTerm, setSearchTerm] = useState("");
  const [studentsData, setStudentsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [schoolUsername, setSchoolUsername] = useState("");

  // Get school username from session storage
  useEffect(() => {
    const userData = sessionStorage.getItem("user_data");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.role === "School") {
          setSchoolUsername(user.username);
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  // Set current date by default
  useEffect(() => {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Vancouver",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());
    const get = (type) => parts.find((p) => p.type === type)?.value || "";
    setSelectedDate(`${get("year")}-${get("month")}-${get("day")}`);
  }, []);

  // Fetch students when filters change (only when a date is selected)
  useEffect(() => {
    if (!schoolUsername) return;
    if (!selectedDate || selectedDate.trim() === "") {
      setStudentsData([]);
      return;
    }
    fetchStudents();
  }, [schoolUsername, selectedDate, searchTerm]);

  const fetchStudents = async () => {
    if (!schoolUsername) return;
    if (!selectedDate || selectedDate.trim() === "") return;

    setIsLoading(true);
    try {
      const params = {
        page: 1,
        limit: 100000,
        search: searchTerm,
        date: selectedDate,
      };

      const response = await studentAPI.getStudentsBySchool(
        schoolUsername,
        params
      );

      if (response.data.success) {
        setStudentsData(response.data.data.students);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to fetch students");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilter = () => {
    if (!selectedDate || selectedDate.trim() === "") return;
    fetchStudents();
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="flex min-h-screen bg-white light">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-0 md:ml-64 min-h-screen w-full bg-white light">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-gray-200">
          <div className="flex items-center justify-between px-4 md:px-6 py-4 max-w-7xl mx-auto">
            {/* Mobile Menu Space */}
            <div className="md:hidden w-10" />

            {/* Title */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 border border-blue-100">
                <Search className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-gray-900">
                  Student Details
                </h1>
                <p className="text-sm text-gray-500">
                  View all students or filter by specific date
                </p>
              </div>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">
                  {schoolUsername || "School User"}
                </p>
                <p className="text-xs text-gray-500">School Administrator</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer">
                <User className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 md:px-6 py-6 max-w-7xl">
          {/* Filter Card */}
          <div className="bg-white shadow-lg border border-gray-200 rounded-xl mb-6">
            <div className="pb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl border-b border-gray-100 p-6">
              <h2 className="flex items-center gap-3 text-gray-900 text-lg font-semibold">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                  <Filter className="h-4 w-4 text-blue-600" />
                </div>
                Filter Students
              </h2>
            </div>

            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Select the Date
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {selectedDate && selectedDate.trim() !== "" && (
                      <button
                        onClick={() => {
                          setSelectedDate("");
                        }}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                        title="Clear date filter"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Search Students
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearch}
                    placeholder="Search by name, number, trip, or flight..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={handleFilter}
                  disabled={
                    isLoading || !selectedDate || selectedDate.trim() === ""
                  }
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium px-8 py-2 h-10 rounded-md transition-colors"
                >
                  {isLoading ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    "Filter"
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Results Table Card */}
          <div className="bg-white shadow-lg border border-gray-200 rounded-xl">
            <div className="pb-4 p-6 border-b border-gray-100">
              <h2 className="text-lg text-gray-900 font-semibold">
                Student Results
              </h2>
              <p className="text-sm text-gray-500">
                {selectedDate && selectedDate.trim() !== ""
                  ? `Students for ${selectedDate}`
                  : "Loading students for today..."}
              </p>
            </div>

            <div className="p-0">
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left p-3 text-xs font-medium text-gray-700 border-r border-gray-200 min-w-[60px]">
                        Trip #
                      </th>
                      <th className="text-left p-3 text-xs font-medium text-gray-700 border-r border-gray-200 min-w-[120px]">
                        Actual Arrival Time / Departure Pick Up Time
                      </th>
                      <th className="text-left p-3 text-xs font-medium text-gray-700 border-r border-gray-200 min-w-[100px]">
                        Arr Time / Dep PU
                      </th>
                      <th className="text-left p-3 text-xs font-medium text-gray-700 border-r border-gray-200 min-w-[80px]">
                        Flight #
                      </th>
                      <th className="text-left p-3 text-xs font-medium text-gray-700 border-r border-gray-200 min-w-[40px]">
                        I or M
                      </th>
                      <th className="text-left p-3 text-xs font-medium text-gray-700 border-r border-gray-200 min-w-[40px]">
                        F
                      </th>
                      <th className="text-left p-3 text-xs font-medium text-gray-700 border-r border-gray-200 min-w-[100px]">
                        Student Number
                      </th>
                      <th className="text-left p-3 text-xs font-medium text-gray-700 border-r border-gray-200 min-w-[120px]">
                        Student Given Name
                      </th>
                      <th className="text-left p-3 text-xs font-medium text-gray-700 border-r border-gray-200 min-w-[120px]">
                        Student Family Name
                      </th>
                      <th className="text-left p-3 text-xs font-medium text-gray-700 border-r border-gray-200 min-w-[120px]">
                        Host Given Name
                      </th>
                      <th className="text-left p-3 text-xs font-medium text-gray-700 border-r border-gray-200 min-w-[120px]">
                        Host Family Name
                      </th>
                      <th className="text-left p-3 text-xs font-medium text-gray-700 border-r border-gray-200 min-w-[120px]">
                        Phone H=Home C=Cell B=Business
                      </th>
                      <th className="text-left p-3 text-xs font-medium text-gray-700 border-r border-gray-200 min-w-[150px]">
                        Address
                      </th>
                      <th className="text-left p-3 text-xs font-medium text-gray-700 border-r border-gray-200 min-w-[80px]">
                        City
                      </th>
                      <th className="text-left p-3 text-xs font-medium text-gray-700 border-r border-gray-200 min-w-[120px]">
                        Special Instructions
                      </th>
                      <th className="text-left p-3 text-xs font-medium text-gray-700 border-r border-gray-200 min-w-[80px]">
                        Study Permit Y or N
                      </th>
                      <th className="text-left p-3 text-xs font-medium text-gray-700 border-r border-gray-200 min-w-[100px]">
                        School
                      </th>
                      <th className="text-left p-3 text-xs font-medium text-gray-700 min-w-[120px]">
                        Staff Member Assigned
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan="18" className="p-8 text-center">
                          <div className="flex flex-col items-center gap-3 text-gray-500">
                            <Loader className="h-12 w-12 text-gray-300 animate-spin" />
                            <p className="text-lg font-medium">
                              Loading students...
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : !selectedDate || selectedDate.trim() === "" ? (
                      <tr>
                        <td colSpan="18" className="p-8 text-center">
                          <div className="flex flex-col items-center gap-3 text-gray-500">
                            <Search className="h-12 w-12 text-gray-300" />
                            <p className="text-lg font-medium">
                              Loading students for today...
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : studentsData.length === 0 ? (
                      <tr>
                        <td colSpan="18" className="p-8 text-center">
                          <div className="flex flex-col items-center gap-3 text-gray-500">
                            <Search className="h-12 w-12 text-gray-300" />
                            <p className="text-lg font-medium">
                              No students found.
                            </p>
                            <p className="text-sm">
                              Try selecting a different date or check if
                              students are registered for this date.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      studentsData.map((student, index) => (
                        <tr
                          key={student._id}
                          className="border-gray-200 hover:bg-gray-50"
                        >
                          <td className="p-3 border-r border-gray-200 text-xs text-gray-800">
                            {student.trip || "N/A"}
                          </td>
                          <td className="p-3 border-r border-gray-200 text-xs text-gray-800">
                            {student.actualArrivalTime || "N/A"}
                          </td>
                          <td className="p-3 border-r border-gray-200 text-xs text-gray-800">
                            {student.arrivalTime || "N/A"}
                          </td>
                          <td className="p-3 border-r border-gray-200 text-xs text-gray-800">
                            {student.flight || "N/A"}
                          </td>
                          <td className="p-3 border-r border-gray-200 text-xs text-gray-800">
                            {student.dOrI || "N/A"}
                          </td>
                          <td className="p-3 border-r border-gray-200 text-xs text-gray-800">
                            {student.mOrF || "N/A"}
                          </td>
                          <td className="p-3 border-r border-gray-200 text-xs text-gray-800">
                            {student.studentNo || "N/A"}
                          </td>
                          <td className="p-3 border-r border-gray-200 text-xs text-gray-800">
                            {student.studentGivenName || "N/A"}
                          </td>
                          <td className="p-3 border-r border-gray-200 text-xs text-gray-800">
                            {student.studentFamilyName || "N/A"}
                          </td>
                          <td className="p-3 border-r border-gray-200 text-xs text-gray-800">
                            {student.hostGivenName || "N/A"}
                          </td>
                          <td className="p-3 border-r border-gray-200 text-xs text-gray-800">
                            {student.hostFamilyName || "N/A"}
                          </td>
                          <td className="p-3 border-r border-gray-200 text-xs text-gray-800">
                            <div className="max-w-[120px] truncate">
                              {student.phone && student.phone !== "N/A" ? (
                                (() => {
                                  const numbersOnly = student.phone.replace(/[^0-9]/g, '');
                                  return numbersOnly ? (
                                    <a
                                      href={`tel:${numbersOnly}`}
                                      className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors"
                                      title={`Call ${numbersOnly}`}
                                    >
                                      {student.phone}
                                    </a>
                                  ) : (
                                    student.phone
                                  );
                                })()
                              ) : (
                                "N/A"
                              )}
                            </div>
                          </td>
                          <td className="p-3 border-r border-gray-200 text-xs text-gray-800">
                            <div className="max-w-[150px] truncate">
                              {student.address || "N/A"}
                            </div>
                          </td>
                          <td className="p-3 border-r border-gray-200 text-xs text-gray-800">
                            {student.city || "N/A"}
                          </td>
                          <td className="p-3 border-r border-gray-200 text-xs text-gray-800">
                            <div className="max-w-[120px] truncate">
                              {student.specialInstructions || "-"}
                            </div>
                          </td>
                          <td className="p-3 border-r border-gray-200 text-xs text-gray-800">
                            {student.studyPermit || "N/A"}
                          </td>
                          <td className="p-3 border-r border-gray-200 text-xs text-gray-800">
                            {student.school || "N/A"}
                          </td>
                          <td className="p-3 text-xs text-gray-800">
                            {student.staffMemberAssigned || "N/A"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination removed: showing all students */}
            </div>
          </div>
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
