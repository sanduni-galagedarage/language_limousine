const XLSX = require("xlsx");
const Student = require("../models/Student");
const path = require("path");
const fs = require("fs");
const {
  generateStudentNumberFromExcel,
} = require("../utils/studentNumberGenerator");

/**
 * Parse Excel file and extract student data
 */
const parseExcelFile = (buffer) => {
  try {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON with header row
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (jsonData.length < 2) {
      throw new Error(
        "Excel file must contain at least a header row and one data row"
      );
    }

    const headers = jsonData[0];
    const dataRows = jsonData.slice(1);

    console.log("Found headers in Excel file:", headers);
    console.log("Number of data rows:", dataRows.length);

    // Clean up headers - remove null/undefined values and trim whitespace
    const cleanHeaders = headers.map((header) => {
      if (header === null || header === undefined) return "";
      return String(header).trim();
    });

    console.log("Clean headers:", cleanHeaders);

    // Check if we have valid headers
    const validHeaders = cleanHeaders.filter(
      (header) => header && header.length > 0
    );
    console.log("Valid headers count:", validHeaders.length);

    if (validHeaders.length === 0) {
      throw new Error(
        "No valid headers found in Excel file. Please ensure the first row contains column headers."
      );
    }

    // Map Excel columns to our schema fields
    const columnMapping = {
      // Your exact Excel headers - D/I and M or F are separate columns
      "Trip #": "trip",
      "Actual Arrival Time / Departure Pick Up Time": "actualArrivalTime",
      "Arr Time / Dep PU": "arrivalTime",
      "Flight #": "flight",
      "D/I": "dOrI",                        // Separate column for Domestic/International
      "M or F": "mOrF",                     // Separate column for Male/Female
      "Student Number": "studentNo",
      "Student Given Name": "studentGivenName",
      "Student Family Name": "studentFamilyName",
      "Host Given Name": "hostGivenName",
      "Host Family Name": "hostFamilyName",
      "Phone H=Home C=Cell B=Business": "phone",
      "Address": "address",
      "City": "city",
      "Special Instructions": "specialInstructions",
      "Study Permit Y or N": "studyPermit",
      "School": "school",
      "Staff Member Assigned": "staffMemberAssigned",
      "Client": "client",
      
      // Alternative/shortened headers for compatibility
      "Trip": "trip",
      "Arr Time": "arrivalTime",
      "Actual Arrival Time": "actualArrivalTime",
      "I/ D": "dOrI",
      "I/D": "dOrI",
      "I or M / F": "mOrF",                 // Legacy combined field
      "Student Numb": "studentNo",
      "Student Giver": "studentGivenName",
      "Student Fam Name": "studentFamilyName",
      "Student Fam": "studentFamilyName",
      "Host Give Name": "hostGivenName",
      "Host Fami Name": "hostFamilyName",
      "Phone": "phone",
      "Study Permit Y/N": "studyPermit",
      "Staff Member As": "staffMemberAssigned",
    };

    const students = [];
    let excelOrderCounter = 1; // Start from 1 for sequential numbering

    // Helper: convert Excel numeric time (fraction of a day) to HH:MM
    const toTimeString = (input) => {
      if (input === null || input === undefined) return "";
      if (typeof input === "string") {
        const s = input.trim();
        if (s.length === 0) return "";
        // If it already looks like a time (has ":"), accept as-is
        if (s.includes(":")) return s;
        // Try parse numeric string
        const num = parseFloat(s);
        if (!isNaN(num)) input = num;
        else return s;
      }
      if (typeof input === "number" && isFinite(input)) {
        // Excel time is a fraction of a 24-hour day
        let totalMinutes = Math.round(input * 24 * 60);
        totalMinutes = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
        return `${pad(hours)}:${pad(minutes)}`;
      }
      return String(input).trim();
    };

    dataRows.forEach((row, index) => {
      if (row.length === 0 || row.every((cell) => !cell)) {
        return; // Skip empty rows
      }

      const studentData = {
        date: "", // Will be set from form data
        trip: "",
        actualArrivalTime: "",
        arrivalTime: "",
        departurePickupTime: "",
        flight: "",
        dOrI: "I", // Default to International
        mOrF: "",
        studentNo: "",
        studentGivenName: "",
        studentFamilyName: "",
        hostGivenName: "",
        hostFamilyName: "",
        phone: "",
        address: "",
        city: "",
        specialInstructions: "",
        studyPermit: "",
        school: "",
        staffMemberAssigned: "",
        client: "",
      };

      // Map Excel data to student fields
      cleanHeaders.forEach((header, colIndex) => {
        const mappedField = columnMapping[header];
        if (
          mappedField &&
          row[colIndex] !== undefined &&
          row[colIndex] !== null
        ) {
          const rawValue = row[colIndex];
          const value =
            typeof rawValue === "number" ? rawValue : String(rawValue).trim();

          // Handle special cases
          if (mappedField === "mOrF") {
            // Handle M or F column (separate column for gender)
            const v = String(value).toUpperCase().trim();
            if (v === "F" || v.includes("F")) {
              studentData.mOrF = "F";
            } else if (v === "M" || v.includes("M")) {
              studentData.mOrF = "M";
            }
          } else if (mappedField === "dOrI") {
            // Normalize Domestic/International codes
            const v = String(value).toUpperCase();
            if (v === "D" || v === "I") {
              studentData.dOrI = v;
            } else if (v.includes("D")) {
              studentData.dOrI = "D";
            } else if (v.includes("I")) {
              studentData.dOrI = "I";
            }
          } else if (mappedField === "actualArrivalTime") {
            // Handle combined arrival/departure time
            const timeParts = String(value).split("/");
            if (timeParts.length >= 2) {
              studentData.actualArrivalTime = toTimeString(timeParts[0]);
              studentData.departurePickupTime = toTimeString(timeParts[1]);
            } else {
              studentData.actualArrivalTime = toTimeString(value);
            }
          } else if (mappedField === "arrivalTime") {
            // Handle combined arrival/departure time
            const timeParts = String(value).split("/");
            if (timeParts.length >= 2) {
              studentData.arrivalTime = toTimeString(timeParts[0]);
              studentData.departurePickupTime = toTimeString(timeParts[1]);
            } else {
              studentData.arrivalTime = toTimeString(value);
            }
          } else {
            studentData[mappedField] =
              typeof value === "number" ? String(value) : value;
          }
        }
      });

      // Only add if we have essential data
      if (studentData.studentGivenName || studentData.studentFamilyName) {
        students.push({
          ...studentData,
          excelOrder: excelOrderCounter, // Assign sequential number
          rowNumber: index + 2, // +2 because we start from row 2 (after header)
        });
        excelOrderCounter++; // Increment counter for next student
      }
    });

    return students;
  } catch (error) {
    console.error("Error parsing Excel file:", error);
    throw new Error(`Failed to parse Excel file: ${error.message}`);
  }
};

/**
 * Upload Excel file and process student data
 */
const uploadExcelFile = async (req, res) => {
  try {
    console.log("Excel upload request received");
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);
    console.log("Request headers:", req.headers);

    if (!req.file) {
      console.log("No file uploaded");
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const { date } = req.body;
    console.log("Form data - date:", date);

    if (!date) {
      console.log("Missing required fields - date:", !!date);
      return res.status(400).json({
        success: false,
        message: "Date is required",
      });
    }

    // Normalize incoming date to YYYY-MM-DD (accepts MM/DD/YYYY)
    const normalizedDate = /^\d{2}\/\d{2}\/\d{4}$/.test(date)
      ? (() => {
          const [m, d, y] = date.split("/");
          return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
        })()
      : date;

    // Read the uploaded file buffer
    const buffer = req.file.buffer;

    // Parse Excel file
    const studentsData = parseExcelFile(buffer);

    if (studentsData.length === 0) {
      // Get headers from the parsed file for error reporting
      let foundHeaders = [];
      try {
        const workbook = XLSX.read(buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const rawHeaders = jsonData[0] || [];
        foundHeaders = rawHeaders.map((header) => {
          if (header === null || header === undefined) return "";
          return String(header).trim();
        });
      } catch (error) {
        console.error("Error reading headers for error report:", error);
      }

      return res.status(400).json({
        success: false,
        message: "No valid student data found in Excel file",
        details:
          "Please ensure your Excel file has the correct headers and at least one data row with Student Given Name or Student Family Name",
        foundHeaders: foundHeaders,
        expectedHeaders: [
          "Trip #",
          "Actual Arrival Time / Departure Pick Up Time",
          "Arr Time / Dep PU",
          "Flight #",
          "D/I",
          "M or F",
          "Student Number",
          "Student Given Name",
          "Student Family Name",
          "Host Given Name",
          "Host Family Name",
          "Phone H=Home C=Cell B=Business",
          "Address",
          "City",
          "Special Instructions",
          "Study Permit Y or N",
          "School",
          "Staff Member Assigned",
          "Client",
        ],
      });
    }

    const createdStudents = [];
    const updatedStudents = [];
    const errors = [];
    const createdBy = req.user._id;

    // Process each student
    for (const studentData of studentsData) {
      try {
        // Set common fields
        studentData.date = normalizedDate;
        // Keep per-row school and client from Excel (allow mixed values)
        if (!studentData.school) {
          errors.push({
            row: studentData.rowNumber,
            message: "Missing School value in Excel row.",
          });
          continue;
        }
        if (!studentData.client) {
          errors.push({
            row: studentData.rowNumber,
            message: "Missing Client value in Excel row.",
          });
          continue;
        }
        studentData.createdBy = createdBy;

        // Generate student number if not provided
        if (!studentData.studentNo) {
          studentData.studentNo = await generateStudentNumberFromExcel(
            studentData,
            studentData.date
          );
        }

        // Normalize studyPermit to valid enum or remove if invalid/empty
        if (typeof studentData.studyPermit === "string") {
          const sp = studentData.studyPermit.trim().toUpperCase();
          if (sp === "Y" || sp === "N") {
            studentData.studyPermit = sp;
          } else {
            delete studentData.studyPermit;
          }
        }

        // Set default values for required fields
        // Normalize dOrI: accept common variants like 't' (treated as 'I')
        if (studentData.dOrI) {
          const dio = String(studentData.dOrI).toUpperCase();
          if (dio !== "D" && dio !== "I") {
            // Heuristics: sometimes 't' appears for International; coerce to I
            if (dio === "T") studentData.dOrI = "I";
            else studentData.dOrI = "I"; // default to International
          } else {
            studentData.dOrI = dio;
          }
        } else {
          studentData.dOrI = "I";
        }
        if (!studentData.mOrF) studentData.mOrF = "M";
        if (!studentData.actualArrivalTime)
          studentData.actualArrivalTime = "00:00";
        if (!studentData.arrivalTime) studentData.arrivalTime = "00:00";
        if (!studentData.trip) studentData.trip = "1";

        // Check for duplicate student number (only when present)
        const existingStudent = studentData.studentNo
          ? await Student.findOne({
              studentNo: studentData.studentNo,
              date: studentData.date,
              isActive: true,
            })
          : null;

        if (existingStudent) {
          // Update existing record but PRESERVE previous dOrI (do not overwrite)
          const updates = { ...studentData };
          delete updates.dOrI;
          delete updates.studentNo; // never change student number on update
          delete updates.createdBy; // don't change audit fields
          // Keep date fixed
          delete updates.date;

          const updated = await Student.findByIdAndUpdate(
            existingStudent._id,
            { $set: updates },
            { new: true, runValidators: true }
          );

          updatedStudents.push({
            _id: updated._id,
            studentNo: updated.studentNo,
            studentGivenName: updated.studentGivenName,
            studentFamilyName: updated.studentFamilyName,
            row: studentData.rowNumber,
          });
        } else {
          // Create student
          const student = await Student.create(studentData);
          createdStudents.push({
            _id: student._id,
            studentNo: student.studentNo,
            studentGivenName: student.studentGivenName,
            studentFamilyName: student.studentFamilyName,
            row: studentData.rowNumber,
          });
        }
      } catch (error) {
        console.error(
          `Error processing student at row ${studentData.rowNumber}:`,
          error
        );
        errors.push({
          row: studentData.rowNumber,
          message: error.message || "Failed to create student",
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        totalProcessed: studentsData.length,
        created: createdStudents.length,
        updated: updatedStudents.length,
        errorsCount: errors.length,
        createdStudents,
        updatedStudents,
        errors,
      },
      message: `Successfully processed ${studentsData.length} students. Created: ${createdStudents.length}, Updated: ${updatedStudents.length}, Errors: ${errors.length}`,
    });
  } catch (error) {
    console.error("Excel upload error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

/**
 * Create Excel template file if it doesn't exist
 */
const createExcelTemplate = () => {
  const templatesDir = path.join(__dirname, '../templates');
  const templatePath = path.join(templatesDir, 'User_Upload_Template.xlsx');
  
  // Check if template already exists
  if (fs.existsSync(templatePath)) {
    return templatePath;
  }

  // Create templates directory if it doesn't exist
  if (!fs.existsSync(templatesDir)) {
    fs.mkdirSync(templatesDir, { recursive: true });
  }

  // Define headers exactly as users must provide them (D/I and M or F are separate columns)
  const headers = [
    'Trip #',
    'Actual Arrival Time / Departure Pick Up Time',
    'Arr Time / Dep PU',
    'Flight #',
    'D/I',                                  // Separate column for Domestic/International
    'M or F',                               // Separate column for Male/Female
    'Student Number',
    'Student Given Name',
    'Student Family Name',
    'Host Given Name',
    'Host Family Name',
    'Phone H=Home C=Cell B=Business',
    'Address',
    'City',
    'Special Instructions',
    'Study Permit Y or N',
    'School',
    'Staff Member Assigned',
    'Client'
  ];

  // Sample data rows
  const sampleData = [
    [
      '1',                                    // Trip #
      '5:10 PM / 8:00 AM',                  // Actual Arrival Time / Departure Pick Up Time
      '5:10 PM / 8:00 AM',                  // Arr Time / Dep PU
      'TK 075',                             // Flight #
      'I',                                  // D/I (Domestic/International)
      'M',                                  // M or F (Male/Female)
      '733382',                             // Student Number
      'Osama',                              // Student Given Name
      'Alansar',                            // Student Family Name
      'Rose',                               // Host Given Name
      'Pugosa',                             // Host Family Name
      'C=6044909182',                       // Phone H=Home C=Cell B=Business
      'Clinton Street',                     // Address
      'Burnaby',                            // City
      '',                                   // Special Instructions
      'N',                                  // Study Permit Y or N
      'EC',                                 // School
      'Staff Member 1',                     // Staff Member Assigned
      'EC'                                  // Client
    ],
    [
      '2',
      '4:15 AM / 8:15 AM',
      '4:15 AM / 8:15 AM',
      'AM 695',
      'I',                                  // International
      'F',                                  // Female
      '704047',
      'Judith',
      'Marcondes Armando',
      'Maria',
      'Santos',
      'H=6041234567',
      'Main Street',
      'Vancouver',
      'Departs @ 8:15 AM',
      'Y',
      'ILSC',
      'Staff Member 2',
      'ILSC'
    ],
    [
      '3',
      '2:00 AM / 6:00 AM',
      '2:00 AM / 6:00 AM',
      'AS 6047',
      'I',
      'F',
      'VE158887',
      'Mariana',
      'Palmieri Panazzolo',
      'Angelica',
      'Lim',
      'C=7782510236',
      'Fleming Street',
      'Vancouver',
      'Departs @ 6:00 AM',
      'Y',
      'VEC',
      'Jaskirat 1st Job',
      'VEC'
    ]
  ];

  try {
    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheetData = [headers, ...sampleData];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Set column widths
    const columnWidths = [
      { wch: 8 },   // Trip #
      { wch: 25 },  // Actual Arrival Time / Departure Pick Up Time
      { wch: 20 },  // Arr Time / Dep PU
      { wch: 12 },  // Flight #
      { wch: 6 },   // D/I
      { wch: 8 },   // M or F
      { wch: 15 },  // Student Number
      { wch: 18 },  // Student Given Name
      { wch: 20 },  // Student Family Name
      { wch: 15 },  // Host Given Name
      { wch: 18 },  // Host Family Name
      { wch: 25 },  // Phone H=Home C=Cell B=Business
      { wch: 20 },  // Address
      { wch: 15 },  // City
      { wch: 25 },  // Special Instructions
      { wch: 18 },  // Study Permit Y or N
      { wch: 12 },  // School
      { wch: 20 },  // Staff Member Assigned
      { wch: 12 }   // Client
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Student Upload Template');

    // Write the Excel file
    XLSX.writeFile(workbook, templatePath);
    
    console.log('Excel template created at:', templatePath);
    return templatePath;
  } catch (error) {
    console.error('Error creating Excel template:', error);
    throw error;
  }
};

/**
 * Get upload template structure
 */
const getUploadTemplate = (req, res) => {
  try {
    // Ensure template file exists
    createExcelTemplate();
    
    const template = {
      headers: [
        "Trip",
        "Arr Time", 
        "Flight #",
        "D/I",
        "M or F",
        "Student Numb",
        "Student Given Name",
        "Student Family Name",
        "Host Given Name",
        "Host Family Name",
        "Phone",
        "Address",
        "City",
        "Special Instructions",
        "Study Permit Y/N",
        "School",
        "Client",
      ],
      sampleData: [
        {
          "Trip": "1",
          "Arr Time": "5:10 PM",
          "Flight #": "TK 075",
          "D/I": "I",
          "M or F": "M",
          "Student Numb": "733382",
          "Student Given Name": "Osama",
          "Student Family Name": "Alansar",
          "Host Given Name": "Rose",
          "Host Family Name": "Pugosa",
          "Phone": "C=6044909182",
          "Address": "Clinton Street",
          "City": "Burnaby",
          "Special Instructions": "",
          "Study Permit Y/N": "N",
          "School": "EC",
          "Client": "EC",
        },
      ],
      downloadUrl: "/api/excel-upload/download-template",
      instructions: {
        required: [
          "Trip", "Arr Time", "Flight #", "D/I", "M or F",
          "Student Given Name", "Student Family Name",
          "Host Given Name", "Host Family Name", 
          "Phone", "Address", "City", "School", "Client"
        ],
        optional: [
          "Student Numb (auto-generated if empty)",
          "Special Instructions",
          "Study Permit Y/N"
        ],
        formats: {
          "Trip": "1, 2, 3",
          "Arr Time": "5:10 PM, 14:30, 2:00 AM",
          "D/I": "D (Domestic) or I (International)",
          "M or F": "M (Male) or F (Female)",
          "Phone": "C=6044909182, H=7781234567, B=6049876543",
          "Study Permit Y/N": "Y (Yes) or N (No)"
        }
      }
    };

    return res.status(200).json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error("Get template error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  uploadExcelFile,
  getUploadTemplate,
  createExcelTemplate,
};
