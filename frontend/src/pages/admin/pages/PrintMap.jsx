import Sidebar from "../components/Sidebar";
import { useState, useEffect } from "react";
import {
  Search,
  User,
  Calendar,
  Printer,
  Download,
  FileText,
  Users,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  Car,
  Loader,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { assignmentAPI, userAPI } from "@/lib/api";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function PrintMap() {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedDriver, setSelectedDriver] = useState("");
  const [selectedSubDriver, setSelectedSubDriver] = useState("");
  const [drivers, setDrivers] = useState([]);
  const [subDrivers, setSubDrivers] = useState([]);
  const [driverData, setDriverData] = useState(null);
  const [subDriverData, setSubDriverData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Fetch drivers and subdrivers on component mount
  useEffect(() => {
    fetchDriversAndSubdrivers();
  }, []);

  const fetchDriversAndSubdrivers = async () => {
    try {
      setIsLoading(true);
      const [driversResponse, subDriversResponse] = await Promise.all([
        userAPI.getUsersByRole("Driver"),
        userAPI.getUsersByRole("Subdriver"),
      ]);

      if (driversResponse.data.success) {
        setDrivers(driversResponse.data.data.users);
      }
      if (subDriversResponse.data.success) {
        setSubDrivers(subDriversResponse.data.data.users);
      }
    } catch (error) {
      console.error("Error fetching drivers and subdrivers:", error);
      toast.error("Failed to fetch drivers and subdrivers");
    } finally {
      setIsLoading(false);
    }
  };

  // Default date to today (America/Vancouver)
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

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleDriverChange = (e) => {
    setSelectedDriver(e.target.value);
  };

  const handleSubDriverChange = (e) => {
    setSelectedSubDriver(e.target.value);
  };

  const fetchDriverData = async () => {
    if (!selectedDate || !selectedDriver) {
      toast.error("Please select both date and driver");
      return;
    }

    try {
      setIsLoadingData(true);
      const driver = drivers.find((d) => d._id === selectedDriver);
      if (!driver) return;

      // Fetch completed tasks for the selected driver and date using admin endpoint
      const response = await assignmentAPI.getAssignments({
        date: selectedDate,
        driverId: selectedDriver,
        limit: "all",
      });

      if (response.data.success) {
        const allTasks = response.data.data.assignments || [];
        const deliveryCompleted = allTasks.filter(
          (t) => t.deliveryStatus === "Completed"
        );

        console.log("📊 Setting driver data (delivery completed only):", {
          driver,
          tasks: deliveryCompleted,
          date: selectedDate,
        });
        setDriverData({
          driver,
          tasks: deliveryCompleted,
          date: selectedDate,
        });
        console.log("✅ Driver data set successfully");
      }
    } catch (error) {
      console.error("Error fetching driver data:", error);
      toast.error("Failed to fetch driver data");
    } finally {
      setIsLoadingData(false);
    }
  };

  const fetchSubDriverData = async () => {
    if (!selectedDate || !selectedSubDriver) {
      toast.error("Please select both date and sub-driver");
      return;
    }

    try {
      setIsLoadingData(true);
      const subDriver = subDrivers.find((sd) => sd._id === selectedSubDriver);
      if (!subDriver) return;

      // Fetch completed tasks for the selected sub-driver and date using admin endpoint
      const response = await assignmentAPI.getAssignments({
        date: selectedDate,
        subdriverId: selectedSubDriver,
        limit: "all",
      });

      if (response.data.success) {
        const allTasks = response.data.data.assignments || [];
        const deliveryCompleted = allTasks.filter(
          (t) => t.deliveryStatus === "Completed"
        );

        console.log("📊 Setting subdriver data (delivery completed only):", {
          subDriver,
          tasks: deliveryCompleted,
          date: selectedDate,
        });
        setSubDriverData({
          subDriver,
          tasks: deliveryCompleted,
          date: selectedDate,
        });
        console.log("✅ Subdriver data set successfully");
      }
    } catch (error) {
      console.error("Error fetching sub-driver data:", error);
      toast.error("Failed to fetch sub-driver data");
    } finally {
      setIsLoadingData(false);
    }
  };

  const generateDriverReport = () => {
    console.log("🚀 generateDriverReport called");
    console.log("📊 driverData:", driverData);

    if (!driverData) {
      console.error("❌ No driver data available");
      toast.error("No driver data available for PDF generation");
      return;
    }

    try {
      const doc = new jsPDF();
      const { driver, tasks, date } = driverData;

      console.log("📋 Generating PDF for:", {
        driver,
        tasks: tasks?.length,
        date,
      });

      // Header
      doc.setFontSize(20);
      doc.text("Driver Completed Tasks Report", 105, 20, { align: "center" });

      doc.setFontSize(12);
      doc.text(`Date: ${date}`, 20, 35);
      doc.text(`Driver: ${driver.username}`, 20, 45);
      doc.text(`Driver ID: ${driver.driverID || "N/A"}`, 20, 55);
      doc.text(`Vehicle: ${driver.vehicleNumber || "N/A"}`, 20, 65);
      doc.text(
        `Generated at: ${new Date().toLocaleString("en-CA", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
          timeZone: "America/Vancouver",
        })}`,
        20,
        75
      );

      // Tasks table (all tasks: pickup and delivery)
      if (tasks && tasks.length > 0) {
        const tableData = tasks.map((task, index) => [
          index + 1,
          task.studentId?.studentGivenName && task.studentId?.studentFamilyName
            ? `${task.studentId.studentGivenName} ${task.studentId.studentFamilyName}`
            : "N/A",
          task.studentId?.excelOrder || index + 1,
          task.studentId?.school || "N/A",
          task.pickupStatus || "N/A",
          task.pickupTime
            ? new Date(task.pickupTime).toLocaleTimeString("en-CA", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
                timeZone: "America/Vancouver",
              })
            : "N/A",
          task.deliveryTime
            ? new Date(task.deliveryTime).toLocaleTimeString("en-CA", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
                timeZone: "America/Vancouver",
              })
            : "N/A",
          task.deliveryStatus || "N/A",
        ]);

        autoTable(doc, {
          startY: 80,
          head: [
            [
              "#",
              "Student Name",
              "Excel Order",
              "School",
              "Pickup Status",
              "Pickup Time",
              "Delivery Time",
              "Delivery Status",
            ],
          ],
          body: tableData,
          theme: "grid",
          headStyles: { fillColor: [59, 130, 246] },
        });
      } else {
        doc.text("No completed tasks found for this date", 20, 80);
      }

      doc.save(`driver-report-${driver.username}-${date}.pdf`);
      console.log("✅ PDF generated and saved successfully");
      toast.success("PDF report generated successfully!");
    } catch (error) {
      console.error("❌ Error generating PDF:", error);
      toast.error("Failed to generate PDF report");
    }
  };

  const generateSubDriverReport = () => {
    console.log("🚀 generateSubDriverReport called");
    console.log("📊 subDriverData:", subDriverData);

    if (!subDriverData) {
      console.error("❌ No subdriver data available");
      toast.error("No subdriver data available for PDF generation");
      return;
    }

    try {
      const doc = new jsPDF();
      const { subDriver, tasks, date } = subDriverData;

      console.log("📋 Generating PDF for:", {
        subDriver,
        tasks: tasks?.length,
        date,
      });

      // Header
      doc.setFontSize(20);
      doc.text("Sub-Driver Completed Tasks Report", 105, 20, {
        align: "center",
      });

      doc.setFontSize(12);
      doc.text(`Date: ${date}`, 20, 35);
      doc.text(`Sub-Driver: ${subDriver.username}`, 20, 45);
      doc.text(`Sub-Driver ID: ${subDriver.subdriverID || "N/A"}`, 20, 55);

      // Tasks table (all tasks: pickup and delivery)
      if (tasks && tasks.length > 0) {
        const tableData = tasks.map((task, index) => [
          index + 1,
          task.studentId?.studentGivenName && task.studentId?.studentFamilyName
            ? `${task.studentId.studentGivenName} ${task.studentId.studentFamilyName}`
            : "N/A",
          task.studentId?.studentNo || "N/A",
          task.studentId?.school || "N/A",
          task.pickupStatus || "N/A",
          task.pickupTime
            ? new Date(task.pickupTime).toLocaleTimeString("en-CA", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
                timeZone: "America/Vancouver",
              })
            : "N/A",
          task.deliveryTime
            ? new Date(task.deliveryTime).toLocaleTimeString("en-CA", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
                timeZone: "America/Vancouver",
              })
            : "N/A",
          task.deliveryStatus || "N/A",
        ]);

        autoTable(doc, {
          startY: 80,
          head: [
            [
              "#",
              "Student Name",
              "Student No",
              "School",
              "Pickup Status",
              "Pickup Time",
              "Delivery Time",
              "Delivery Status",
            ],
          ],
          body: tableData,
          theme: "grid",
          headStyles: { fillColor: [59, 130, 246] },
        });
      } else {
        doc.text("No completed tasks found for this date", 20, 80);
      }

      doc.save(`subdriver-report-${subDriver.username}-${date}.pdf`);
      console.log("✅ PDF generated and saved successfully");
      toast.success("PDF report generated successfully!");
    } catch (error) {
      console.error("❌ Error generating PDF:", error);
      toast.error("Failed to generate PDF report");
    }
  };

  const handlePrint = (type) => {
    if (type === "driver") {
      generateDriverReport();
    } else if (type === "subdriver") {
      generateSubDriverReport();
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
                className="w-full bg-gray-50 text-gray-900 pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black placeholder-gray-400 text-sm"
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
        <div className="p-6 overflow-x-hidden bg-white">
          <div className="max-w-7xl mx-auto">
            {/* Page Title */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">
                Print Student Data
              </h1>
            </div>

            {/* Driver Selection Form */}
            <Card className="bg-white border-gray-200 mb-8 shadow-sm">
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* First Row - Driver Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
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
                          placeholder="mm/dd/yyyy"
                        />
                        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
                      </div>
                    </div>

                    {/* Driver Selection */}
                    <div className="space-y-2">
                      <Label className="text-gray-700 text-sm font-medium">
                        Select Driver
                      </Label>
                      <select
                        value={selectedDriver}
                        onChange={handleDriverChange}
                        className="bg-white text-gray-900 border border-gray-300 focus:border-blue-500 focus:ring-blue-500 w-full h-12 text-sm rounded-lg px-3"
                        disabled={isLoading}
                      >
                        <option value="">Select Driver</option>
                        {drivers.map((driver) => (
                          <option key={driver._id} value={driver._id}>
                            {driver.username}{" "}
                            {driver.driverID ? `(${driver.driverID})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Fetch Data Button */}
                    <div>
                      <Button
                        onClick={fetchDriverData}
                        disabled={
                          !selectedDate || !selectedDriver || isLoadingData
                        }
                        className="bg-black hover:bg-black disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-medium w-full h-12 flex items-center justify-center space-x-2"
                      >
                        {isLoadingData ? (
                          <Loader className="h-4 w-4 animate-spin" />
                        ) : (
                          <FileText className="h-4 w-4" />
                        )}
                        <span>
                          {isLoadingData ? "Loading..." : "Fetch Data"}
                        </span>
                      </Button>
                    </div>

                    {/* Print Button */}
                    <div>
                      <Button
                        onClick={() => handlePrint("driver")}
                        disabled={!driverData}
                        className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-8 py-3 rounded-lg font-medium w-full h-12 flex items-center justify-center space-x-2"
                      >
                        <Printer className="h-4 w-4" />
                        <span>Print Report</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sub-Driver Selection Form */}
            <Card className="bg-white border-gray-200 mb-8 shadow-sm">
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Second Row - Sub-Driver Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
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
                          placeholder="mm/dd/yyyy"
                        />
                        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
                      </div>
                    </div>

                    {/* Sub-Driver Selection */}
                    <div className="space-y-2">
                      <Label className="text-gray-700 text-sm font-medium">
                        Select Sub Driver
                      </Label>
                      <select
                        value={selectedSubDriver}
                        onChange={handleSubDriverChange}
                        className="bg-white text-gray-900 border border-gray-300 focus:border-blue-500 focus:ring-blue-500 w-full h-12 text-sm rounded-lg px-3"
                        disabled={isLoading}
                      >
                        <option value="">Select Sub-Driver</option>
                        {subDrivers.map((subDriver) => (
                          <option key={subDriver._id} value={subDriver._id}>
                            {subDriver.username}{" "}
                            {subDriver.subdriverID
                              ? `(${subDriver.subdriverID})`
                              : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Fetch Data Button */}
                    <div>
                      <Button
                        onClick={fetchSubDriverData}
                        disabled={
                          !selectedDate || !selectedSubDriver || isLoadingData
                        }
                        className="bg-black hover:bg-black disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-medium w-full h-12 flex items-center justify-center space-x-2"
                      >
                        {isLoadingData ? (
                          <Loader className="h-4 w-4 animate-spin" />
                        ) : (
                          <FileText className="h-4 w-4" />
                        )}
                        <span>
                          {isLoadingData ? "Loading..." : "Fetch Data"}
                        </span>
                      </Button>
                    </div>

                    {/* Print Button */}
                    <div>
                      <Button
                        onClick={() => handlePrint("subdriver")}
                        disabled={!subDriverData}
                        className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-8 py-3 rounded-lg font-medium w-full h-12 flex items-center justify-center space-x-2"
                      >
                        <Printer className="h-4 w-4" />
                        <span>Print Report</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Driver Data Preview */}
            {driverData && (
              <Card className="bg-white border-gray-200 mb-8 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Users className="h-5 w-5 text-gray-900" />
                      Driver Data Preview
                    </h3>
                    <div className="flex gap-2">
                      <Button
                        onClick={generateDriverReport}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                          Driver:
                        </span>
                        <span className="text-sm text-gray-900">
                          {driverData.driver.username}
                        </span>
                      </div>
                      {/* <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                          Vehicle:
                        </span>
                        <span className="text-sm text-gray-900">
                          {driverData.driver.vehicleNumber || "N/A"}
                        </span>
                      </div> */}
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                          Date:
                        </span>
                        <span className="text-sm text-gray-900">
                          {driverData.date}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium text-gray-700">
                          Total Tasks:
                        </span>
                        <span className="text-sm text-gray-900">
                          {driverData.tasks?.length || 0}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium text-gray-700">
                          Status:
                        </span>
                        <span className="text-sm text-gray-900">
                          {driverData.driver.status || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tasks Table */}
                  {driverData.tasks && driverData.tasks.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-200">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-700">
                              Excel Order
                            </th>
                            <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-700">
                              Student Name
                            </th>
                            <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-700">
                              Student No
                            </th>
                            <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-700">
                              School
                            </th>
                            <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-700">
                              Pickup
                            </th>
                            <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-700">
                              Pickup Time
                            </th>
                            <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-700">
                              Delivery Time
                            </th>
                            <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-700">
                              Delivery
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {driverData.tasks.map((task, index) => (
                            <tr key={task._id} className="hover:bg-gray-50">
                              <td className="border border-gray-200 px-3 py-2 text-xs text-gray-900">
                                {task.studentId?.excelOrder || index + 1}
                              </td>
                              <td className="border border-gray-200 px-3 py-2 text-xs text-gray-900">
                                {task.studentId?.studentGivenName}{" "}
                                {task.studentId?.studentFamilyName}
                              </td>
                              <td className="border border-gray-200 px-3 py-2 text-xs text-gray-900">
                                {task.studentId?.studentNo}
                              </td>
                              <td className="border border-gray-200 px-3 py-2 text-xs text-gray-900">
                                {task.studentId?.school}
                              </td>
                              <td className="border border-gray-200 px-3 py-2 text-xs text-gray-900">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${
                                    task.pickupStatus === "Completed"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {task.pickupStatus}
                                </span>
                              </td>
                              <td className="border border-gray-200 px-3 py-2 text-xs text-gray-900">
                                {task.pickupTime
                                  ? new Date(
                                      task.pickupTime
                                    ).toLocaleTimeString("en-CA", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      second: "2-digit",
                                      hour12: true,
                                      timeZone: "America/Vancouver",
                                    })
                                  : "N/A"}
                              </td>
                              <td className="border border-gray-200 px-3 py-2 text-xs text-gray-900">
                                {task.deliveryTime
                                  ? new Date(
                                      task.deliveryTime
                                    ).toLocaleTimeString("en-CA", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      second: "2-digit",
                                      hour12: true,
                                      timeZone: "America/Vancouver",
                                    })
                                  : "N/A"}
                              </td>
                              <td className="border border-gray-200 px-3 py-2 text-xs text-gray-900">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${
                                    task.deliveryStatus === "Completed"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {task.deliveryStatus}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      No completed tasks found for this date
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Sub-Driver Data Preview */}
            {subDriverData && (
              <Card className="bg-white border-gray-200 mb-8 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Users className="h-5 w-5 text-green-500" />
                      Sub-Driver Data Preview
                    </h3>
                    <div className="flex gap-2">
                      <Button
                        onClick={generateSubDriverReport}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                          Sub-Driver:
                        </span>
                        <span className="text-sm text-gray-900">
                          {subDriverData.subDriver.username}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                          Date:
                        </span>
                        <span className="text-sm text-gray-900">
                          {subDriverData.date}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium text-gray-700">
                          Total Tasks:
                        </span>
                        <span className="text-sm text-gray-900">
                          {subDriverData.tasks?.length || 0}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium text-gray-700">
                          Status:
                        </span>
                        <span className="text-sm text-gray-900">
                          {subDriverData.subDriver.status || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tasks Table */}
                  {subDriverData.tasks && subDriverData.tasks.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-200">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-700">
                              Excel Order
                            </th>
                            <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-700">
                              Student Name
                            </th>
                            <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-700">
                              Student No
                            </th>
                            <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-700">
                              School
                            </th>
                            <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-700">
                              Pickup
                            </th>
                            <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-700">
                              Pickup Time
                            </th>
                            <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-700">
                              Delivery Time
                            </th>
                            <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-700">
                              Delivery
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {subDriverData.tasks.map((task, index) => (
                            <tr key={task._id} className="hover:bg-gray-50">
                              <td className="border border-gray-200 px-3 py-2 text-xs text-gray-900">
                                {task.studentId?.excelOrder || index + 1}
                              </td>
                              <td className="border border-gray-200 px-3 py-2 text-xs text-gray-900">
                                {task.studentId?.studentGivenName}{" "}
                                {task.studentId?.studentFamilyName}
                              </td>
                              <td className="border border-gray-200 px-3 py-2 text-xs text-gray-900">
                                {task.studentId?.studentNo}
                              </td>
                              <td className="border border-gray-200 px-3 py-2 text-xs text-gray-900">
                                {task.studentId?.school}
                              </td>
                              <td className="border border-gray-200 px-3 py-2 text-xs text-gray-900">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${
                                    task.pickupStatus === "Completed"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {task.pickupStatus}
                                </span>
                              </td>
                              <td className="border border-gray-200 px-3 py-2 text-xs text-gray-900">
                                {task.pickupTime
                                  ? new Date(
                                      task.pickupTime
                                    ).toLocaleTimeString("en-CA", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      second: "2-digit",
                                      hour12: true,
                                      timeZone: "America/Vancouver",
                                    })
                                  : "N/A"}
                              </td>
                              <td className="border border-gray-200 px-3 py-2 text-xs text-gray-900">
                                {task.deliveryTime
                                  ? new Date(
                                      task.deliveryTime
                                    ).toLocaleTimeString("en-CA", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      second: "2-digit",
                                      hour12: true,
                                      timeZone: "America/Vancouver",
                                    })
                                  : "N/A"}
                              </td>
                              <td className="border border-gray-200 px-3 py-2 text-xs text-gray-900">
                                <span
                                  className={`px-2 py-2 text-xs ${
                                    task.deliveryStatus === "Completed"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {task.deliveryStatus}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      No completed tasks found for this date
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Empty State Card */}
            {!driverData && !subDriverData && (
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="text-center py-8">
                    <Printer className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Ready to Generate Reports
                    </h3>
                    <p className="text-gray-500">
                      Select a date and driver/sub-driver from the forms above,
                      then click "Fetch Data" to load the information and
                      generate reports.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
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
