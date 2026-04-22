const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const {
  getDriverAssignments,
  getDriverCompletedTasks,
  updatePickupStatus,
  updateDeliveryStatus,
  updateDeliveryTime,
} = require("../controllers/studentAssignmentController");

const {
  getSubdriverProfile,
  updateSubdriverProfile,
  getSubdriverStats,
} = require("../controllers/subdriverController");

// Subdriver authentication middleware
const requireSubdriver = (req, res, next) => {
  if (req.user.role !== "Subdriver") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Subdriver privileges required",
    });
  }
  next();
};

// Apply authentication and subdriver authorization to all routes
router.use(authenticateToken, requireSubdriver);

// Get subdriver's assignments for today
router.get("/my-assignments", getDriverAssignments);

// Get subdriver's completed tasks
router.get("/completed-tasks", getDriverCompletedTasks);

// Update pickup status
router.put("/update-pickup/:assignmentId", updatePickupStatus);

// Update delivery status
router.put("/update-delivery/:assignmentId", updateDeliveryStatus);

// Update delivery time
router.put("/update-delivery-time/:assignmentId", updateDeliveryTime);

// Subdriver profile routes
router.get("/profile", getSubdriverProfile);
router.put("/profile", updateSubdriverProfile);
router.get("/stats", getSubdriverStats);

module.exports = router;
