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
  getDriverProfile,
  updateDriverProfile,
  getDriverStats,
} = require("../controllers/driverController");

// Driver authentication middleware
const requireDriver = (req, res, next) => {
  if (req.user.role !== "Driver" && req.user.role !== "Subdriver") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Driver privileges required",
    });
  }
  next();
};

// Apply authentication and driver authorization to all routes
router.use(authenticateToken, requireDriver);

// Get driver's assignments for today
router.get("/my-assignments", getDriverAssignments);

// Get driver's completed tasks
router.get("/completed-tasks", getDriverCompletedTasks);

// Update pickup status
router.put("/update-pickup/:assignmentId", updatePickupStatus);

// Update delivery status
router.put("/update-delivery/:assignmentId", updateDeliveryStatus);

// Update delivery time
router.put("/update-delivery-time/:assignmentId", updateDeliveryTime);

// Driver profile routes
router.get("/profile", getDriverProfile);
router.put("/profile", updateDriverProfile);
router.get("/stats", getDriverStats);

module.exports = router;
