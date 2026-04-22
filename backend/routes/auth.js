const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const {
  adminRegister,
  adminLogin,
  userLogin,
  getAdminProfile,
  updateAdminProfile,
} = require("../controllers/adminController");
const { authenticateToken, requireAdmin } = require("../middleware/auth");

// Validation error handling middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

// Validation middleware for admin registration (simplified)
const validateAdminRegistration = [
  body("username")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters long"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please enter a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  handleValidationErrors,
];

// Validation middleware for other user types
const validateRegistration = [
  body("username")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters long"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please enter a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("gender")
    .isIn(["Male", "Female", "Other"])
    .withMessage("Gender must be Male, Female, or Other"),
  body("role")
    .isIn(["Admin", "Greeter", "Driver", "Subdriver", "School"])
    .withMessage("Role must be Admin, Greeter, Driver, Subdriver, or School"),
  handleValidationErrors,
];

const validateLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please enter a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
];

const validateProfileUpdate = [
  body("username")
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters long"),
  body("email")
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage("Please enter a valid email"),
  body("gender")
    .optional()
    .isIn(["Male", "Female", "Other"])
    .withMessage("Gender must be Male, Female, or Other"),
  handleValidationErrors,
];

// Admin Registration Route
router.post("/register", validateAdminRegistration, adminRegister);

// Admin Login Route
router.post("/login", validateLogin, adminLogin);

// General User Login Route (for all user types)
router.post("/user/login", validateLogin, userLogin);

// Get Admin Profile Route (Protected)
router.get("/profile", authenticateToken, getAdminProfile);

// Update Admin Profile Route (Protected)
router.put(
  "/profile",
  authenticateToken,
  validateProfileUpdate,
  updateAdminProfile
);

// Admin-only registration route (for admins to register other users)
router.post(
  "/admin/register",
  authenticateToken,
  requireAdmin,
  validateRegistration,
  adminRegister
);

module.exports = router;
