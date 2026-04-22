const express = require("express");
const router = express.Router();
const { authenticateToken, requireSchool } = require("../middleware/auth");
const { getStudentsBySchool } = require("../controllers/studentController");

// Middleware to ensure the user can only access students from their own school
const validateSchoolAccess = async (req, res, next) => {
  try {
    const schoolUsername = req.params.schoolUsername;
    const userSchool = req.user.username;

    // Ensure the school user can only access students from their own school
    if (schoolUsername !== userSchool) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied. You can only view students from your own school.",
      });
    }

    next();
  } catch (error) {
    console.error("validateSchoolAccess error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get students by school username (filtered by the logged-in school user)
router.get(
  "/:schoolUsername",
  authenticateToken,
  requireSchool,
  validateSchoolAccess,
  getStudentsBySchool
);

module.exports = router;
