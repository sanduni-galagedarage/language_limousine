const PDFDocument = require("pdfkit");
const Student = require("../models/Student");

function normalizeDateQuery(dateStr) {
  if (!dateStr) return null;
  // Accept YYYY-MM-DD or MM/DD/YYYY and normalize to YYYY-MM-DD
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    const [m, d, y] = dateStr.split("/");
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return dateStr;
}

function buildDateFilter(dateStr) {
  const iso = normalizeDateQuery(dateStr);
  if (!iso) return null;
  // Also compute legacy MM/DD/YYYY for backward compatibility
  const [y, m, d] = iso.split("-");
  const mdy = `${m}/${d}/${y}`;
  return { $in: [iso, mdy] };
}

// POST /api/students
const addStudent = async (req, res) => {
  try {
    const required = [
      "date",
      "trip",
      "actualArrivalTime",
      "arrivalTime",
      "flight",
      "dOrI",
      "mOrF",
      "studentNo",
      "studentGivenName",
      "studentFamilyName",
      "hostGivenName",
      "hostFamilyName",
      "phone",
      "address",
      "city",
      "school",
      "client",
    ];

    for (const field of required) {
      if (!req.body[field]) {
        return res
          .status(400)
          .json({ success: false, message: `${field} is required` });
      }
    }

    if (!["D", "I"].includes(req.body.dOrI)) {
      return res
        .status(400)
        .json({ success: false, message: "dOrI must be 'D' or 'I'" });
    }
    if (!["M", "F"].includes(req.body.mOrF)) {
      return res
        .status(400)
        .json({ success: false, message: "mOrF must be 'M' or 'F'" });
    }

    const exists = await Student.findOne({
      isActive: true,
      studentNo: req.body.studentNo,
      date: req.body.date,
    });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Student already exists for this date",
      });
    }

    const createdBy = req.user?._id;
    const student = await Student.create({ ...req.body, createdBy });

    return res.status(201).json({ success: true, data: { student } });
  } catch (err) {
    console.error("addStudent error", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// GET /api/students?date=&page=&limit=&search=
const getAllStudents = async (req, res) => {
  try {
    const pageRaw = req.query.page;
    const limitRaw = req.query.limit;
    const page = parseInt(pageRaw || "1", 10);
    // Support unlimited results when limit=all or 0 or missing
    const unlimited =
      (typeof limitRaw === "string" && limitRaw.toLowerCase() === "all") ||
      parseInt(limitRaw || "0", 10) === 0;
    const limit = unlimited ? 0 : parseInt(limitRaw || "10", 10);
    const search = req.query.search || "";
    const dateFilter = buildDateFilter(req.query.date);

    const query = { isActive: true };
    if (dateFilter) {
      query.date = dateFilter;
    }
    if (search) {
      query.$or = [
        { trip: { $regex: search, $options: "i" } },
        { studentNo: { $regex: search, $options: "i" } },
        { studentGivenName: { $regex: search, $options: "i" } },
        { studentFamilyName: { $regex: search, $options: "i" } },
        { flight: { $regex: search, $options: "i" } },
        { school: { $regex: search, $options: "i" } },
      ];
    }

    const skip = unlimited ? 0 : (page - 1) * (limit || 0);
    const [students, total] = await Promise.all([
      Student.find(query)
        .sort({ excelOrder: 1 })
        .skip(skip)
        .limit(limit || 0),
      Student.countDocuments(query),
    ]);

    return res.json({
      success: true,
      data: {
        students,
        pagination: unlimited
          ? {
              currentPage: 1,
              totalPages: 1,
              totalStudents: total,
              limit: total,
            }
          : {
              currentPage: page,
              totalPages: Math.ceil(total / (limit || 1)),
              totalStudents: total,
              limit,
            },
      },
    });
  } catch (err) {
    console.error("getAllStudents error", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// GET /api/students/:studentId
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student || !student.isActive) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }
    return res.json({ success: true, data: { student } });
  } catch (err) {
    console.error("getStudentById error", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// PUT /api/students/:studentId
const updateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student || !student.isActive) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    if (req.body.dOrI && !["D", "I"].includes(req.body.dOrI)) {
      return res
        .status(400)
        .json({ success: false, message: "dOrI must be 'D' or 'I'" });
    }
    if (req.body.mOrF && !["M", "F"].includes(req.body.mOrF)) {
      return res
        .status(400)
        .json({ success: false, message: "mOrF must be 'M' or 'F'" });
    }

    if (req.body.studentNo && req.body.studentNo !== student.studentNo) {
      const dup = await Student.findOne({
        isActive: true,
        studentNo: req.body.studentNo,
        date: req.body.date || student.date,
        _id: { $ne: student._id },
      });
      if (dup) {
        return res
          .status(400)
          .json({ success: false, message: "Duplicate student for date" });
      }
    }

    Object.assign(student, req.body);
    const saved = await student.save();
    return res.json({ success: true, data: { student: saved } });
  } catch (err) {
    console.error("updateStudent error", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// DELETE /api/students/:studentId (soft delete)
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student || !student.isActive) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }
    student.isActive = false;
    await student.save();
    return res.json({ success: true, message: "Student deleted" });
  } catch (err) {
    console.error("deleteStudent error", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// GET /api/students/school/:schoolUsername - Get students by school username (for school users)
const getStudentsBySchool = async (req, res) => {
  try {
    const { schoolUsername } = req.params;
    const page = parseInt(req.query.page || "1", 10);
    const limit = parseInt(req.query.limit || "10", 10);
    const search = req.query.search || "";
    const dateFilter = buildDateFilter(req.query.date);

    const query = {
      isActive: true,
      school: schoolUsername, // Filter by school username
    };

    if (dateFilter) {
      query.date = dateFilter;
    }

    if (search) {
      query.$or = [
        { trip: { $regex: search, $options: "i" } },
        { studentNo: { $regex: search, $options: "i" } },
        { studentGivenName: { $regex: search, $options: "i" } },
        { studentFamilyName: { $regex: search, $options: "i" } },
        { flight: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const [students, total] = await Promise.all([
      Student.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Student.countDocuments(query),
    ]);

    return res.json({
      success: true,
      data: {
        students,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalStudents: total,
          limit,
        },
      },
    });
  } catch (err) {
    console.error("getStudentsBySchool error", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// GET /api/students/export/pdf?date=YYYY-MM-DD or MM/DD/YYYY
const exportStudentsPdf = async (req, res) => {
  try {
    const dateFilter = buildDateFilter(req.query.date);
    if (!dateFilter) {
      return res
        .status(400)
        .json({ success: false, message: "date query param is required" });
    }

    const students = await Student.find({
      isActive: true,
      date: dateFilter,
    }).sort({ studentFamilyName: 1, studentGivenName: 1 });

    // Build a display date (use the first matched format for title/filename)
    const iso = normalizeDateQuery(req.query.date);
    const [y, m, d] = iso.split("-");
    const human = `${m}/${d}/${y}`;

    const doc = new PDFDocument({ margin: 40 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=students_${iso}.pdf`
    );

    doc.fontSize(18).text(`Students - ${human}`, { align: "center" });
    doc.moveDown();

    doc.fontSize(12);
    const header = [
      "Student No",
      "Given Name",
      "Family Name",
      "Trip",
      "Arrival",
      "Flight",
      "School",
    ];

    doc.text(header.join("  |  "));
    doc.moveDown(0.5);
    doc.moveTo(doc.x, doc.y).lineTo(550, doc.y).stroke();

    students.forEach((s) => {
      const row = [
        s.studentNo,
        s.studentGivenName,
        s.studentFamilyName,
        s.trip,
        s.arrivalTime,
        s.flight,
        s.school,
      ];
      doc.moveDown(0.3);
      doc.text(row.join("  |  "));
    });

    doc.end();
    doc.pipe(res);
  } catch (err) {
    console.error("exportStudentsPdf error", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// DELETE /api/students/by-date?date=YYYY-MM-DD or MM/DD/YYYY
const deleteStudentsByDate = async (req, res) => {
  try {
    const dateFilter = buildDateFilter(req.query.date);
    if (!dateFilter) {
      return res
        .status(400)
        .json({ success: false, message: "date query param is required" });
    }

    // Soft delete: set isActive=false for all matching students
    const result = await Student.updateMany(
      { isActive: true, date: dateFilter },
      { $set: { isActive: false } }
    );

    return res.json({
      success: true,
      message: `Deleted ${
        result.modifiedCount || 0
      } students for the selected date`,
      data: { deleted: result.modifiedCount || 0 },
    });
  } catch (err) {
    console.error("deleteStudentsByDate error", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  addStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  exportStudentsPdf,
  getStudentsBySchool,
  deleteStudentsByDate,
};
