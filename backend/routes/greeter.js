const express = require("express");
const router = express.Router();
const { authenticateToken, requireGreeter } = require("../middleware/auth");
const {
  getUnassignedStudents,
  getDriversAndSubdrivers,
  assignStudents,
  getAssignments,
  cancelAssignment,
} = require("../controllers/studentAssignmentController");

// Greeter routes (require greeter authentication)
router.use(authenticateToken, requireGreeter);

// Debug middleware to log all greeter requests
router.use((req, res, next) => {
  console.log("🔍 Greeter Route accessed:", req.method, req.path);
  console.log("🔍 Greeter Route params:", req.params);
  console.log("🔍 Greeter Route query:", req.query);
  next();
});

// Get unassigned students for greeter
router.get("/unassigned-students", getUnassignedStudents);

// Get available drivers and subdrivers for greeter
router.get("/drivers", getDriversAndSubdrivers);

// Assign students to driver/subdriver (greeter can do this)
router.post("/assignments", assignStudents);

// Get assignments (greeter can view all assignments)
router.get("/assignments", getAssignments);

// Cancel assignment (greeter can cancel assignments)
router.delete("/assignments/:assignmentId", cancelAssignment);

module.exports = router;
