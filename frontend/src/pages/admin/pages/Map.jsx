import Sidebar from "../components/Sidebar";
import { useState, useEffect, useRef } from "react";
import {
  Search,
  User,
  Calendar,
  MapPin,
  Printer,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import axios from "axios";
import { API_BASE_URL } from "@/lib/config";
import { toast } from "react-toastify";

export default function Map() {
  const [selectedDate, setSelectedDate] = useState("");
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);
  const geocodeCache = useRef(new globalThis.Map());
  const lastGeocodeTime = useRef(0);
  const [totalStudentsCount, setTotalStudentsCount] = useState(0);
  const [locationCount, setLocationCount] = useState(0);
  const sanitizeAddress = (s) =>
    (s || "")
      .toString()
      .replace(/\s+/g, " ")
      .replace(/[\r\n]+/g, " ")
      .trim();

  // Get auth token
  const getAuthToken = () => {
    return (
      sessionStorage.getItem("admin_token") || localStorage.getItem("authToken")
    );
  };

  // Configure axios
  const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Add request interceptor
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

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // Default date to today (America/Vancouver) for the date input
  useEffect(() => {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Vancouver",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());
    const get = (type) => parts.find((p) => p.type === type)?.value || "";
    const todayStr = `${get("year")}-${get("month")}-${get("day")}`;
    setSelectedDate(todayStr);
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainer.current) return;

    const initMap = () => {
      if (
        map.current ||
        (mapContainer.current && mapContainer.current._leaflet_id)
      ) {
        return; // Already initialized
      }
      // Initialize the map centered on Canada
      map.current = window.L.map(mapContainer.current).setView(
        [56.1304, -106.3468], // Center of Canada
        4
      );

      // Add OpenStreetMap tiles
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 18,
      }).addTo(map.current);

      // Add Canada boundary (optional)
      addCanadaBoundary();
    };

    // Load Leaflet CSS/JS once
    const ensureLeafletLoaded = () => {
      return new Promise((resolve) => {
        if (window.L) return resolve();

        if (!document.getElementById("leaflet-css")) {
          const link = document.createElement("link");
          link.id = "leaflet-css";
          link.rel = "stylesheet";
          link.href =
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css";
          document.head.appendChild(link);
        }

        const existingScript = document.getElementById("leaflet-js");
        if (existingScript) {
          existingScript.addEventListener("load", () => resolve(), {
            once: true,
          });
        } else {
          const script = document.createElement("script");
          script.id = "leaflet-js";
          script.src =
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
          script.onload = () => resolve();
          document.body.appendChild(script);
        }
      });
    };

    ensureLeafletLoaded().then(initMap);

    // Cleanup on unmount to avoid double-initialization
    return () => {
      try {
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
      } catch {}
    };
  }, []);

  // Add Canada boundary overlay
  const addCanadaBoundary = () => {
    if (map.current && window.L) {
      // Add a simple rectangle representing Canada's approximate boundaries
      const canadaBounds = [
        [41.0, -141.0], // Southwest
        [84.0, -52.0], // Northeast
      ];

      window.L.rectangle(canadaBounds, {
        color: "#3b82f6",
        weight: 2,
        fillColor: "#3b82f6",
        fillOpacity: 0.1,
      }).addTo(map.current);
    }
  };

  // Fetch students data
  const fetchStudents = async (
    dateParam,
    options = { suppressState: false }
  ) => {
    setIsLoading(true);
    try {
      const params = { limit: 1000 };
      if (dateParam) params.date = dateParam;
      const response = await apiClient.get("/students", { params });
      if (response.data.success) {
        const studentsData = response.data.data.students || [];
        toast.dismiss();
        toast.info(
          `Loaded ${studentsData.length} students${
            dateParam ? ` for ${dateParam}` : ""
          }`
        );
        setTotalStudentsCount(studentsData.length);
        if (!options.suppressState) {
          setStudents(studentsData);
          setFilteredStudents(studentsData);
        }
        return studentsData;
      }
      return [];
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to fetch students data");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Geocode address to get coordinates (with cache + throttling)
  const geocodeAddress = async (address, cityFallback) => {
    const key = address.trim().toLowerCase();
    if (geocodeCache.current.has(key)) {
      return geocodeCache.current.get(key);
    }

    // Respect server-side throttling interval to avoid piling up
    const now = Date.now();
    const elapsed = now - lastGeocodeTime.current;
    if (elapsed < 400) {
      await sleep(400 - elapsed);
    }

    try {
      const queries = [
        `${address}, Canada`,
        address,
        cityFallback ? `${cityFallback}, Canada` : null,
      ].filter(Boolean);

      let payload = null;
      for (const q of queries) {
        try {
          const resp = await apiClient.get(`/geocode`, {
            params: { q, country: "ca" },
          });
          if (resp.data?.success && resp.data?.data) {
            payload = resp.data.data;
            break;
          }
        } catch (e) {
          // try next variant
        }
      }

      lastGeocodeTime.current = Date.now();

      if (payload) {
        geocodeCache.current.set(key, payload);
        return payload;
      }
      return null;
    } catch (error) {
      console.error("Geocoding error:", error);
      toast.warn("Geocoding failed. Some markers may be missing.");
      return null;
    }
  };

  // Filter students by date and search term (client-side search only)
  const filterStudents = () => {
    let filtered = students;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (student) =>
          student.studentGivenName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          student.studentNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredStudents(filtered);
    return filtered;
  };

  // Update map markers
  const isUpdatingMarkers = useRef(false);
  const updateMapMarkers = async (studentsToShow) => {
    if (!map.current || !window.L) return;
    if (isUpdatingMarkers.current) return;
    isUpdatingMarkers.current = true;
    try {
      // Clear existing markers
      markers.current.forEach((marker) => {
        map.current.removeLayer(marker);
      });
      markers.current = [];

      if (studentsToShow.length === 0) {
        // Reset map view to Canada
        map.current.setView([56.1304, -106.3468], 4);
        setLocationCount(0);
        return;
      }

      const bounds = [];
      const maxToGeocode = 30; // limit to avoid rate limits and delays
      const slice = studentsToShow.slice(0, maxToGeocode);

      for (const student of slice) {
        const street = sanitizeAddress(student.address);
        const city = sanitizeAddress(student.city);
        const address = [street, city].filter(Boolean).join(", ");
        if (!address) continue;

        const location = await geocodeAddress(address, city);
        if (location) {
          const marker = window.L.marker([location.lat, location.lng]).addTo(
            map.current
          ).bindPopup(`
            <div style="min-width: 200px;">
              <h3 style="margin: 0 0 8px 0; color: #1f2937; font-weight: bold;">
                ${student.studentGivenName} ${student.studentFamilyName || ""}
              </h3>
              <p style="margin: 4px 0; color: #6b7280; font-size: 12px;"><strong>Student No:</strong> ${
                student.studentNo || "N/A"
              }</p>
              <p style="margin: 4px 0; color: #6b7280; font-size: 12px;"><strong>Address:</strong> ${
                location.address || address
              }</p>
              <p style="margin: 4px 0; color: #6b7280; font-size: 12px;"><strong>Flight:</strong> ${
                student.flight || "N/A"
              }</p>
              <p style="margin: 4px 0; color: #6b7280; font-size: 12px;"><strong>Phone:</strong> ${
                student.phone || "N/A"
              }</p>
            </div>
          `);

          markers.current.push(marker);
          bounds.push([location.lat, location.lng]);
        }
      }

      const candidates = slice.length;
      if (candidates === 0) {
        toast.info("No students with address or city to geocode.");
      }

      if (studentsToShow.length > maxToGeocode) {
        toast.info(
          `Showing first ${maxToGeocode} locations to avoid geocoding limits. Refine your search to see specific students.`
        );
      }

      // Fit map to show all markers
      if (bounds.length > 0) {
        map.current.fitBounds(bounds, { padding: [20, 20] });
        setLocationCount(bounds.length);
      } else {
        map.current.setView([56.1304, -106.3468], 4);
        toast.info(
          "Unable to geocode any addresses. Please ensure student address and city are valid."
        );
        setLocationCount(0);
      }
    } finally {
      isUpdatingMarkers.current = false;
    }
  };

  // Handle date change
  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);

    // Clear data when date is cleared
    if (!newDate) {
      setStudents([]);
      setFilteredStudents([]);
      setSelectedStudent(null);
      setTotalStudentsCount(0);
      setLocationCount(0);
      // Clear map markers
      if (map.current && window.L) {
        markers.current.forEach((marker) => {
          map.current.removeLayer(marker);
        });
        markers.current = [];
        map.current.setView([56.1304, -106.3468], 4);
      }
    }
  };

  // Handle search
  const handleSearch = async () => {
    if (!selectedDate) {
      toast.error("Please select a date first");
      return;
    }

    const loaded = await fetchStudents(selectedDate, { suppressState: true });

    // Apply search term on top of server-side date filter
    let filtered = loaded;
    if (searchTerm) {
      filtered = loaded.filter(
        (student) =>
          student.studentGivenName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          student.studentNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setStudents(loaded);
    setFilteredStudents(filtered);
    updateMapMarkers(filtered);
  };

  // Handle search term change
  const handleSearchTermChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle student selection
  const handleStudentSelect = (student) => {
    setSelectedStudent(student);

    // Center map on selected student
    if (map.current) {
      const street = sanitizeAddress(student.address);
      const city = sanitizeAddress(student.city);
      const addr = [street, city].filter(Boolean).join(", ");
      if (!addr) return;
      const key = addr.trim().toLowerCase();
      const cached = geocodeCache.current.get(key);
      const ensureLocation = cached
        ? Promise.resolve(cached)
        : geocodeAddress(addr, city);

      ensureLocation.then((location) => {
        if (location) {
          map.current.setView([location.lat, location.lng], 12);

          // Highlight markers (optional)
          markers.current.forEach((marker) => {
            // no-op; could change icon if needed
          });
        } else {
          toast.error("Could not geocode address for this student");
        }
      });
    }
  };

  // Print map for selected student
  const handlePrintMap = (student) => {
    if (!student) {
      toast.error("Please select a student first");
      return;
    }

    setSelectedStudent(student);

    const street = sanitizeAddress(student.address);
    const city = sanitizeAddress(student.city);
    const addr = [street, city].filter(Boolean).join(", ");
    if (!addr) {
      toast.error("Selected student does not have an address to locate");
      return;
    }

    const key = addr.trim().toLowerCase();
    const cached = geocodeCache.current.get(key);
    const ensureLocation = cached
      ? Promise.resolve(cached)
      : geocodeAddress(addr, city);

    // Create print window
    const printWindow = window.open("", "_blank", "width=900,height=700");

    ensureLocation.then((location) => {
      if (location) {
        createPrintWindow(student, location, printWindow);
      } else {
        toast.error("Could not geocode address for printing");
        try {
          printWindow && printWindow.close();
        } catch {}
      }
    });
  };

  // Create print window content
  const createPrintWindow = (student, location, printWindow) => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Student Location Map - ${student.studentGivenName}</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css" />
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; background: white; padding: 20px; }
          .print-header { text-align: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #3b82f6; }
          .print-header h1 { color: #3b82f6; font-size: 24px; margin-bottom: 5px; }
          .print-header p { color: #6b7280; font-size: 14px; }
          .student-details { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
          .student-details h2 { color: #1f2937; font-size: 18px; margin-bottom: 15px; text-align: center; }
          .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
          .detail-item { display: flex; flex-direction: column; }
          .detail-label { font-weight: bold; color: #374151; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
          .detail-value { color: #1f2937; font-size: 14px; }
          .map-container { border: 2px solid #e2e8f0; border-radius: 8px; overflow: hidden; height: 450px; margin-bottom: 20px; position: relative; }
          #printMap { width: 100%; height: 100%; }
          .print-footer { text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #e2e8f0; color: #6b7280; font-size: 12px; }
          @media print { body { padding: 10px; } .print-header h1 { font-size: 20px; } .student-details { break-inside: avoid; } .map-container { height: 400px; break-inside: avoid; } }
        </style>
      </head>
      <body>
        <div class="print-header">
          <h1>Student Location Map - Canada</h1>
          <p>Generated on ${new Date().toLocaleDateString("en-CA", {
            timeZone: "America/Vancouver",
          })} at ${new Date().toLocaleTimeString("en-CA", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZone: "America/Vancouver",
    })}</p>
        </div>
        
        <div class="student-details">
          <h2>Student Information</h2>
          <div class="details-grid">
            <div class="detail-item">
              <span class="detail-label">Excel Order</span>
              <span class="detail-value">${student.excelOrder ?? "N/A"}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Full Name</span>
              <span class="detail-value">${student.studentGivenName} ${
      student.studentFamilyName || ""
    }</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Address</span>
              <span class="detail-value">${
                student.address || student.city || "N/A"
              }</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Flight</span>
              <span class="detail-value">${student.flight || "N/A"}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Phone</span>
              <span class="detail-value">${student.phone || "N/A"}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Date</span>
              <span class="detail-value">${
                selectedDate
                  ? new Date(selectedDate).toLocaleDateString("en-CA", {
                      timeZone: "America/Vancouver",
                    })
                  : new Date().toLocaleDateString("en-CA", {
                      timeZone: "America/Vancouver",
                    })
              }</span>
            </div>
          </div>
        </div>
        
        <div class="map-container">
          <div id="printMap"></div>
        </div>
        
        <div class="print-footer">
          <p>Student Location Map Report | ${location.address}</p>
          <p>Coordinates: ${location.lat.toFixed(6)}, ${location.lng.toFixed(
      6
    )}</p>
        </div>
        
        <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
        <script>
          function initializeMap() {
            const printMap = L.map('printMap').setView([${location.lat}, ${
      location.lng
    }], 12);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap contributors',
              maxZoom: 18
            }).addTo(printMap);
            L.marker([${location.lat}, ${location.lng}])
              .addTo(printMap)
              .bindPopup('<div style="text-align: center;"><h3><strong>${
                student.studentGivenName
              } ${
      student.studentFamilyName || ""
    }</strong></h3><p><strong>Excel Order:</strong> ${
      student.excelOrder ?? "N/A"
    }</p><p><strong>Address:</strong> ${
      student.address || student.city || "N/A"
    }</p></div>')
              .openPopup();
            setTimeout(() => {
              printMap.invalidateSize();
              setTimeout(() => { window.print(); }, 800);
            }, 400);
          }
          window.onload = initializeMap; // initialize once on load only
          window.addEventListener('afterprint', () => { setTimeout(() => { window.close(); }, 800); });
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  // Load students on component mount
  useEffect(() => {
    // Don't automatically load all students - only load when date is selected
    // fetchStudents();
  }, []);

  // No automatic re-render loop on filteredStudents to avoid recursion

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
                placeholder="Search students by name, number, or address..."
                value={searchTerm}
                onChange={handleSearchTermChange}
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
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">
              Student Locations Map - Canada
            </h1>

            {/* Instructions */}
            {!selectedDate && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <MapPin className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      How to use the Map
                    </h3>
                    <p className="text-sm text-gray-700 mt-1">
                      1. Select a date from the calendar below
                      <br />
                      2. Click "Search Students" to load student locations for
                      that date
                      <br />
                      3. View student locations on the map and in the table
                      below
                      <br />
                      4. Click on a student to center the map on their location
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Search Form */}
            <Card className="bg-white border-gray-200 mb-8 shadow-sm">
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Form Row */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
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

                    {/* Search Button */}
                    <div>
                      <Button
                        onClick={handleSearch}
                        disabled={isLoading || !selectedDate}
                        className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-lg font-medium w-full h-12 disabled:opacity-50"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          "Search Students"
                        )}
                      </Button>
                    </div>

                    {/* Refresh Button */}
                    <div>
                      <Button
                        onClick={async () => {
                          if (!selectedDate) {
                            toast.error("Please select a date first");
                            return;
                          }
                          const data = await fetchStudents(selectedDate);
                          updateMapMarkers(data);
                        }}
                        disabled={isLoading || !selectedDate}
                        className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-medium w-full h-12 disabled:opacity-50"
                      >
                        Refresh Data
                      </Button>
                    </div>

                    {/* Print Map Button */}
                    <div>
                      <Button
                        onClick={() => handlePrintMap(selectedStudent)}
                        disabled={!selectedStudent}
                        className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-lg font-medium w-full h-12 disabled:opacity-50"
                      >
                        <Printer className="mr-2 h-4 w-4" />
                        Print Map
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Students List */}
            {selectedDate && (
              <>
                {filteredStudents.length > 0 ? (
                  <Card className="bg-white border-gray-200 overflow-hidden shadow-sm mb-8">
                    {/* Table Header */}
                    <CardHeader className="p-6 border-b border-gray-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900">
                            {selectedDate
                              ? `Students for ${new Date(
                                  selectedDate
                                ).toLocaleDateString()}`
                              : "Students"}
                          </h2>
                          <p className="text-sm text-gray-500 mt-1">
                            {totalStudentsCount} student
                            {totalStudentsCount !== 1 ? "s" : ""} total •{" "}
                            {locationCount} location
                            {locationCount !== 1 ? "s" : ""} shown
                            {students.length > 30 ? " (max 30)" : ""}
                            {searchTerm && ` • matching "${searchTerm}"`}
                          </p>
                        </div>
                      </div>
                    </CardHeader>

                    {/* Table */}
                    <CardContent className="p-0 overflow-x-auto">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="text-gray-700 font-medium text-left px-4 py-3 border-b border-gray-200">
                                Excel Order
                              </th>
                              <th className="text-gray-700 font-medium text-left px-4 py-3 border-b border-gray-200">
                                Student Number
                              </th>
                              <th className="text-gray-700 font-medium text-left px-4 py-3 border-b border-gray-200">
                                Name
                              </th>
                              <th className="text-gray-700 font-medium text-left px-4 py-3 border-b border-gray-200">
                                Address/City
                              </th>
                              <th className="text-gray-700 font-medium text-left px-4 py-3 border-b border-gray-200">
                                Flight
                              </th>
                              <th className="text-gray-700 font-medium text-left px-4 py-3 border-b border-gray-200">
                                Phone
                              </th>
                              <th className="text-gray-700 font-medium text-left px-4 py-3 border-b border-gray-200">
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredStudents.map((student, index) => (
                              <tr
                                key={student._id}
                                className={`border-gray-200 hover:bg-gray-50 cursor-pointer ${
                                  selectedStudent?._id === student._id
                                    ? "bg-gray-50"
                                    : ""
                                }`}
                                onClick={() => handleStudentSelect(student)}
                              >
                                <td className="text-gray-700 px-4 py-3 border-b border-gray-200">
                                  {student.excelOrder || index + 1}
                                </td>
                                <td className="text-gray-700 px-4 py-3 border-b border-gray-200">
                                  {student.studentNo || "N/A"}
                                </td>
                                <td className="text-gray-700 px-4 py-3 border-b border-gray-200">
                                  {student.studentGivenName}{" "}
                                  {student.studentFamilyName || ""}
                                </td>
                                <td className="text-gray-700 px-4 py-3 border-b border-gray-200">
                                  {student.address || student.city || "N/A"}
                                </td>
                                <td className="text-gray-700 px-4 py-3 border-b border-gray-200">
                                  {student.flight || "N/A"}
                                </td>
                                <td className="text-gray-700 px-4 py-3 border-b border-gray-200">
                                  {student.phone || "N/A"}
                                </td>
                                <td className="px-4 py-3 border-b border-gray-200">
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePrintMap(student);
                                    }}
                                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2"
                                  >
                                    <Printer className="h-4 w-4" />
                                    <span>Print</span>
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-white border-gray-200 overflow-hidden shadow-sm mb-8">
                    <CardContent className="p-12">
                      <div className="text-center">
                        <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-500 mb-2">
                          No Students Found
                        </h3>
                        <p className="text-sm text-gray-400">
                          No students found for{" "}
                          {new Date(selectedDate).toLocaleDateString()}. Try a
                          different date or check if students are assigned for
                          this date.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* Map Container */}
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Student Locations Map - Canada
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedStudent
                        ? `Showing location for ${selectedStudent.studentGivenName}`
                        : selectedDate
                        ? "Click on a student to view their location on the map"
                        : "Select a date and search to view student locations"}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-gray-900" />
                    <span className="text-sm text-gray-600">
                      {locationCount} locations
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div
                  ref={mapContainer}
                  className="w-full h-96"
                  style={{ minHeight: "600px" }}
                >
                  {/* Leaflet map will be rendered here */}
                  {!selectedDate && (
                    <div className="flex items-center justify-center h-full bg-gray-50">
                      <div className="text-center">
                        <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-500 mb-2">
                          No Date Selected
                        </h3>
                        <p className="text-sm text-gray-400">
                          Please select a date and click "Search Students" to
                          view locations
                        </p>
                      </div>
                    </div>
                  )}
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
