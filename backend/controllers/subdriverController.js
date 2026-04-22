const User = require("../models/User");
const bcrypt = require("bcryptjs");

// GET /api/subdriver/profile - Get subdriver profile
const getSubdriverProfile = async (req, res) => {
  try {
    const subdriverId = req.user._id;

    const subdriver = await User.findById(subdriverId).select("-password").lean();

    if (!subdriver) {
      return res.status(404).json({
        success: false,
        message: "Subdriver not found",
      });
    }

    // Check if user is actually a subdriver
    if (subdriver.role !== "Subdriver") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Subdriver privileges required",
      });
    }

    return res.json({
      success: true,
      data: { subdriver },
    });
  } catch (err) {
    console.error("getSubdriverProfile error", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// PUT /api/subdriver/profile - Update subdriver profile
const updateSubdriverProfile = async (req, res) => {
  try {
    const subdriverId = req.user._id;
    const {
      username,
      email,
      gender,
      password,
      subdriverID,
      vehicleNumber,
      status,
    } = req.body;

    // Find the subdriver
    const subdriver = await User.findById(subdriverId);

    if (!subdriver) {
      return res.status(404).json({
        success: false,
        message: "Subdriver not found",
      });
    }

    // Check if user is actually a subdriver
    if (subdriver.role !== "Subdriver") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Subdriver privileges required",
      });
    }

    // Update fields if provided
    if (username) subdriver.username = username;
    if (email) subdriver.email = email;
    if (gender) subdriver.gender = gender;
    if (subdriverID) subdriver.subdriverID = subdriverID;
    if (vehicleNumber) subdriver.vehicleNumber = vehicleNumber;
    if (status) subdriver.status = status;

    // Handle password update if provided
    if (password && password !== "••••••••••••") {
      const saltRounds = 10;
      subdriver.password = await bcrypt.hash(password, saltRounds);
    }

    await subdriver.save();

    // Return updated subdriver without password
    const updatedSubdriver = await User.findById(subdriverId).select("-password");

    return res.json({
      success: true,
      message: "Profile updated successfully",
      data: { subdriver: updatedSubdriver },
    });
  } catch (err) {
    console.error("updateSubdriverProfile error", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// GET /api/subdriver/stats - Get subdriver statistics
const getSubdriverStats = async (req, res) => {
  try {
    const subdriverId = req.user._id;
    const date = req.query.date || new Date().toISOString().split("T")[0];

    // Build date filter
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    // Import StudentAssignment model
    const StudentAssignment = require("../models/StudentAssignment");

    const query = {
      subdriverId: subdriverId,
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
    console.error("getSubdriverStats error", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getSubdriverProfile,
  updateSubdriverProfile,
  getSubdriverStats,
};
