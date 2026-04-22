const express = require("express");
const router = express.Router();
const { authenticateToken, requireAdmin } = require("../middleware/auth");
const {
  assignStudents,
  getAssignments,
  getUnassignedStudents,
  getDriversAndSubdrivers,
  updateAssignment,
  cancelAssignment,
} = require("../controllers/studentAssignmentController");

// Admin routes (require admin authentication)
router.use(authenticateToken, requireAdmin);

// Assign students to driver/subdriver
router.post("/", assignStudents);

// Get all assignments with filters
router.get("/", getAssignments);

// Get unassigned students
router.get("/unassigned-students", getUnassignedStudents);

// Get all drivers and subdrivers
router.get("/drivers", getDriversAndSubdrivers);

// Update assignment status
router.put("/:assignmentId", updateAssignment);

// Cancel assignment (soft delete)
router.delete("/:assignmentId", cancelAssignment);

module.exports = router;
