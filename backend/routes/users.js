const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const {
  addUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUsersByRole,
  getAllSchools,
  getUserStats,
  getAllAdmins,
  addAdmin,
  registerAdmin,
} = require("../controllers/userController");
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

// Validation middleware for adding users
const validateAddUser = [
  body("username")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Username is required"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please enter a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("gender").optional(),
  body("role")
    .isIn(["Greeter", "Driver", "Subdriver", "School"])
    .withMessage("Role must be Greeter, Driver, Subdriver, or School"),
  body("greeterID")
    .optional()
    .isString()
    .withMessage("GreeterID must be a string"),
  body("driverID")
    .optional()
    .isString()
    .withMessage("DriverID must be a string"),
  body("subdriverID")
    .optional()
    .isString()
    .withMessage("SubdriverID must be a string"),
  body("schoolID")
    .optional()
    .isString()
    .withMessage("SchoolID must be a string"),
  body("vehicleNumber")
    .optional()
    .isString()
    .withMessage("Vehicle Number must be a string"),
  body("status")
    .optional()
    .isIn(["Active", "Inactive", "Pending"])
    .withMessage("Status must be Active, Inactive, or Pending"),
  handleValidationErrors,
];

// Validation middleware for updating users
const validateUpdateUser = [
  body("username")
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage("Username is required"),
  body("email")
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage("Please enter a valid email"),
  body("gender").optional(),
  body("role")
    .optional()
    .isIn(["Greeter", "Driver", "Subdriver", "School"])
    .withMessage("Role must be Greeter, Driver, Subdriver, or School"),
  body("greeterID")
    .optional()
    .isString()
    .withMessage("GreeterID must be a string"),
  body("driverID")
    .optional()
    .isString()
    .withMessage("DriverID must be a string"),
  body("subdriverID")
    .optional()
    .isString()
    .withMessage("SubdriverID must be a string"),
  body("schoolID")
    .optional()
    .isString()
    .withMessage("SchoolID must be a string"),
  body("vehicleNumber")
    .optional()
    .isString()
    .withMessage("Vehicle Number must be a string"),
  body("status")
    .optional()
    .isIn(["Active", "Inactive", "Pending"])
    .withMessage("Status must be Active, Inactive, or Pending"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
  handleValidationErrors,
];

// Public admin registration route (no authentication required)
router.post(
  "/register-admin",
  [
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
  ],
  registerAdmin
);

// All routes require admin authentication
router.use(authenticateToken, requireAdmin);

// Add new user
router.post("/", validateAddUser, addUser);

// Get all users (with pagination and search)
router.get("/", getAllUsers);

// Get user statistics
router.get("/stats", getUserStats);

// Get users by role
router.get("/role/:role", getUsersByRole);

// Get all schools for dropdown
router.get("/schools/dropdown", getAllSchools);

// Admin management routes
router.get("/admins", getAllAdmins);
router.post("/admins", addAdmin);

// Get user by ID
router.get("/:userId", getUserById);

// Update user
router.put("/:userId", validateUpdateUser, updateUser);

// Delete user
router.delete("/:userId", deleteUser);

module.exports = router;
