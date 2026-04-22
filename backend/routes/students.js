const express = require("express");
const router = express.Router();
const { authenticateToken, requireAdmin } = require("../middleware/auth");
const {
  addStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  exportStudentsPdf,
  deleteStudentsByDate,
} = require("../controllers/studentController");

// All routes require admin authentication
router.use(authenticateToken, requireAdmin);

// Create
router.post("/", addStudent);

// Read (list with pagination/search) + date filter via query
router.get("/", getAllStudents);

// Export PDF by date
router.get("/export/pdf", exportStudentsPdf);

// Bulk delete by date (soft delete)
router.delete("/by-date", deleteStudentsByDate);

// Read (single)
router.get("/:studentId", getStudentById);

// Update
router.put("/:studentId", updateStudent);

// Delete (soft)
router.delete("/:studentId", deleteStudent);

module.exports = router;
