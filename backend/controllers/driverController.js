const User = require("../models/User");
const bcrypt = require("bcryptjs");

// GET /api/driver/profile - Get driver profile
const getDriverProfile = async (req, res) => {
  try {
    const driverId = req.user._id;

    const driver = await User.findById(driverId).select("-password").lean();

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    // Check if user is actually a driver
    if (driver.role !== "Driver" && driver.role !== "Subdriver") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Driver privileges required",
      });
    }

    return res.json({
      success: true,
      data: { driver },
    });
  } catch (err) {
    console.error("getDriverProfile error", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// PUT /api/driver/profile - Update driver profile
const updateDriverProfile = async (req, res) => {
  try {
    const driverId = req.user._id;
    const {
      username,
      email,
      gender,
      password,
      driverID,
      vehicleNumber,
      status,
    } = req.body;

    // Find the driver
    const driver = await User.findById(driverId);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    // Check if user is actually a driver
    if (driver.role !== "Driver" && driver.role !== "Subdriver") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Driver privileges required",
      });
    }

    // Update fields if provided
    if (username) driver.username = username;
    if (email) driver.email = email;
    if (gender) driver.gender = gender;
    if (driverID) driver.driverID = driverID;
    if (vehicleNumber) driver.vehicleNumber = vehicleNumber;
    if (status) driver.status = status;

    // Handle password update if provided
    if (password && password !== "••••••••••••") {
      const saltRounds = 10;
      driver.password = await bcrypt.hash(password, saltRounds);
    }

    await driver.save();

    // Return updated driver without password
    const updatedDriver = await User.findById(driverId).select("-password");

    return res.json({
      success: true,
      message: "Profile updated successfully",
      data: { driver: updatedDriver },
    });
  } catch (err) {
    console.error("updateDriverProfile error", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// GET /api/driver/stats - Get driver statistics
const getDriverStats = async (req, res) => {
  try {
    const driverId = req.user._id;
    const date = req.query.date || new Date().toISOString().split("T")[0];

    // Build date filter
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    // Import StudentAssignment model
    const StudentAssignment = require("../models/StudentAssignment");

    const query = {
      $or: [{ driverId: driverId }, { subdriverId: driverId }],
      isActive: true,
      assignmentDate: { $gte: startDate, $lt: endDate },
    };

    const [totalAssignments, completedPickups, completedDeliveries] =
      await Promise.all([
        StudentAssignment.countDocuments(query),
        StudentAssignment.countDocuments({
          ...query,
          pickupStatus: "Completed",
        }),
        StudentAssignment.countDocuments({
          ...query,
          deliveryStatus: "Completed",
        }),
      ]);

    const pendingPickups = totalAssignments - completedPickups;
    const pendingDeliveries = totalAssignments - completedDeliveries;

    return res.json({
      success: true,
      data: {
        stats: {
          totalAssignments,
          completedPickups,
          completedDeliveries,
          pendingPickups,
          pendingDeliveries,
        },
      },
    });
  } catch (err) {
    console.error("getDriverStats error", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getDriverProfile,
  updateDriverProfile,
  getDriverStats,
};
