const Student = require("../models/Student");

/**
 * Generate a unique student number based on date and sequence
 * Format: YYYYMMDD-XXX (e.g., 20250724-001)
 */
const generateStudentNumber = async (date) => {
  try {
    // Normalize incoming date to components
    let year, month, day;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
      const parts = date.split("/");
      month = parts[0].padStart(2, "0");
      day = parts[1].padStart(2, "0");
      year = parts[2];
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const parts = date.split("-");
      year = parts[0];
      month = parts[1].padStart(2, "0");
      day = parts[2].padStart(2, "0");
    } else {
      throw new Error("Invalid date format. Expected MM/DD/YYYY or YYYY-MM-DD");
    }

    const datePrefix = `${year}${month}${day}`;

    // Find the highest sequence number for this date
    const existingStudents = await Student.find({
      studentNo: { $regex: `^${datePrefix}-` },
      isActive: true,
    })
      .sort({ studentNo: -1 })
      .limit(1);

    let sequence = 1;
    if (existingStudents.length > 0) {
      const lastStudentNo = existingStudents[0].studentNo;
      const lastSequence = parseInt(lastStudentNo.split("-")[1]);
      sequence = lastSequence + 1;
    }

    // Format sequence with leading zeros
    const sequenceStr = sequence.toString().padStart(3, "0");
    return `${datePrefix}-${sequenceStr}`;
  } catch (error) {
    console.error("Error generating student number:", error);
    throw error;
  }
};

/**
 * Generate student number from Excel data if not provided
 */
const generateStudentNumberFromExcel = async (excelData, date) => {
  if (excelData.studentNo && excelData.studentNo.trim()) {
    return excelData.studentNo.trim();
  }

  return await generateStudentNumber(date);
};

module.exports = {
  generateStudentNumber,
  generateStudentNumberFromExcel,
};
