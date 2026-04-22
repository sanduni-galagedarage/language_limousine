const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const {
  getSchoolStudentsStatus,
  getSchoolStatusStats,
} = require("../controllers/schoolController");

// School authentication middleware
const requireSchool = (req, res, next) => {
  if (req.user.role !== "School") {
    return res.status(403).json({
      success: false,
      message: "Access denied. School privileges required",
    });
  }
  next();
};

// Apply authentication and school authorization to all routes
router.use(authenticateToken, requireSchool);

// Get students with status for a specific school
router.get("/students-status", getSchoolStudentsStatus);

// Get status statistics for a school
router.get("/status-stats", getSchoolStatusStats);

module.exports = router;
