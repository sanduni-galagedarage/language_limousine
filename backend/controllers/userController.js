const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "your-secret-key", {
    expiresIn: "7d",
  });
};

// Add new user (Admin only)
const addUser = async (req, res) => {
  try {
    // Debug: Log the received request body
    console.log("Received request body:", req.body);

    const {
      username,
      email,
      password,
      gender,
      role,
      greeterID,
      driverID,
      subdriverID,
      schoolID,
      vehicleNumber,
      status,
    } = req.body;

    // Basic validation (gender not required for School)
    if (!username || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Username, email, password, and role are required",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email or username already exists",
      });
    }

    // Validate role
    const validRoles = ["Admin", "Greeter", "Driver", "Subdriver", "School"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid role. Must be one of: Admin, Greeter, Driver, Subdriver, School",
      });
    }

    // Gender is optional for all roles now

    // Role-specific validations
    let roleSpecificData = {};

    if (role === "Greeter") {
      if (!greeterID) {
        return res.status(400).json({
          success: false,
          message: "GreeterID is required for Greeter role",
        });
      }

      // Check if greeterID already exists
      const existingGreeter = await User.findOne({ greeterID });
      if (existingGreeter) {
        return res.status(400).json({
          success: false,
          message: "GreeterID already exists",
        });
      }

      roleSpecificData.greeterID = greeterID;
    }

    if (role === "Driver") {
      if (!driverID) {
        return res.status(400).json({
          success: false,
          message: "DriverID is required for Driver role",
        });
      }

      // Check if driverID already exists
      const existingDriver = await User.findOne({ driverID });
      if (existingDriver) {
        return res.status(400).json({
          success: false,
          message: "DriverID already exists",
        });
      }

      roleSpecificData.driverID = driverID;
      if (vehicleNumber) {
        roleSpecificData.vehicleNumber = vehicleNumber;
      }
    }

    if (role === "Subdriver") {
      if (!subdriverID || !vehicleNumber) {
        return res.status(400).json({
          success: false,
          message:
            "SubdriverID and Vehicle Number are required for Subdriver role",
        });
      }

      // Check if subdriverID already exists
      const existingSubdriver = await User.findOne({ subdriverID });
      if (existingSubdriver) {
        return res.status(400).json({
          success: false,
          message: "SubdriverID already exists",
        });
      }

      // Validate status if provided
      const validStatuses = ["Active", "Inactive", "Pending"];
      if (status && !validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status. Must be one of: Active, Inactive, Pending",
        });
      }

      roleSpecificData.subdriverID = subdriverID;
      roleSpecificData.vehicleNumber = vehicleNumber;
      roleSpecificData.status = status || "Active";
    }

    if (role === "School") {
      if (!schoolID) {
        return res.status(400).json({
          success: false,
          message: "SchoolID is required for School role",
        });
      }

      // Check if schoolID already exists
      const existingSchool = await User.findOne({ schoolID });
      if (existingSchool) {
        return res.status(400).json({
          success: false,
          message: "SchoolID already exists",
        });
      }

      roleSpecificData.schoolID = schoolID;
    }

    // Debug: Log the data being saved
    const userData = {
      username,
      email,
      password,
      ...(gender ? { gender } : {}),
      role,
      ...roleSpecificData,
      createdBy: req.user._id,
    };

    console.log("Data being saved to database:", userData);

    // Create new user
    const newUser = new User(userData);

    await newUser.save();

    // Debug: Log the saved user
    console.log("Saved user:", newUser.toJSON());

    // Return success response (without token for admin-created users)
    res.status(201).json({
      success: true,
      message: `${role} user added successfully`,
      data: {
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
          gender: newUser.gender,
          greeterID: newUser.greeterID,
          driverID: newUser.driverID,
          subdriverID: newUser.subdriverID,
          schoolID: newUser.schoolID,
          vehicleNumber: newUser.vehicleNumber,
          status: newUser.status,
          isActive: newUser.isActive,
          createdAt: newUser.createdAt,
        },
      },
    });
  } catch (error) {
    console.error("Add user error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get all users (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 10, search } = req.query;

    // Build query
    const query = {};

    // Filter by role if provided
    if (role && ["Greeter", "Driver", "Subdriver", "School"].includes(role)) {
      query.role = role;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { greeterID: { $regex: search, $options: "i" } },
        { driverID: { $regex: search, $options: "i" } },
        { subdriverID: { $regex: search, $options: "i" } },
        { schoolID: { $regex: search, $options: "i" } },
        { vehicleNumber: { $regex: search, $options: "i" } },
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Get users with pagination
    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("createdBy", "username email");

    // Get total count
    const totalUsers = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalUsers / limit),
          totalUsers,
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get user by ID (Admin only)
const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select("-password")
      .populate("createdBy", "username email");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Update user (Admin only)
const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, email, gender, role, greeterID, isActive } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Build updates object
    const updates = {};
    if (username) updates.username = username;
    if (email) updates.email = email;
    if (gender !== undefined) updates.gender = gender;
    if (role) updates.role = role;
    if (greeterID !== undefined) updates.greeterID = greeterID;
    if (isActive !== undefined) updates.isActive = isActive;

    // Validate role if being updated
    if (role && !["Greeter", "Driver", "Subdriver", "School"].includes(role)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid role. Must be one of: Greeter, Driver, Subdriver, School",
      });
    }

    // No strict gender validation

    // Check for duplicate email/username if being updated
    if (email || username) {
      const existingUser = await User.findOne({
        $or: [
          { email: email || user.email },
          { username: username || user.username },
        ],
        _id: { $ne: userId },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User with this email or username already exists",
        });
      }
    }

    // Check for duplicate greeterID if being updated
    if (greeterID && greeterID !== user.greeterID) {
      const existingGreeter = await User.findOne({ greeterID });
      if (existingGreeter) {
        return res.status(400).json({
          success: false,
          message: "GreeterID already exists",
        });
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .select("-password")
      .populate("createdBy", "username email");

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Delete user (Admin only)
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    // Delete user
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get users by role (Admin only)
const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const { page = 1, limit = 10, search } = req.query;

    // Validate role
    const validRoles = ["Greeter", "Driver", "Subdriver", "School"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid role. Must be one of: Greeter, Driver, Subdriver, School",
      });
    }

    // Build query
    const query = { role };

    // Search functionality
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { greeterID: { $regex: search, $options: "i" } },
        { driverID: { $regex: search, $options: "i" } },
        { subdriverID: { $regex: search, $options: "i" } },
        { schoolID: { $regex: search, $options: "i" } },
        { vehicleNumber: { $regex: search, $options: "i" } },
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Get users with pagination
    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("createdBy", "username email");

    // Get total count
    const totalUsers = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalUsers / limit),
          totalUsers,
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Get users by role error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get user statistics (Admin only)
const getUserStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
          activeCount: {
            $sum: { $cond: ["$isActive", 1, 0] },
          },
        },
      },
    ]);

    // Format stats
    const formattedStats = {};
    stats.forEach((stat) => {
      formattedStats[stat._id] = {
        total: stat.count,
        active: stat.activeCount,
        inactive: stat.count - stat.activeCount,
      };
    });

    // Get total users
    const totalUsers = await User.countDocuments();
    const totalActiveUsers = await User.countDocuments({ isActive: true });

    res.status(200).json({
      success: true,
      data: {
        stats: formattedStats,
        total: {
          users: totalUsers,
          active: totalActiveUsers,
          inactive: totalUsers - totalActiveUsers,
        },
      },
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get all schools for dropdown (Admin only)
const getAllSchools = async (req, res) => {
  try {
    // Get all active schools with only necessary fields for dropdown
    const schools = await User.find({
      role: "School",
      isActive: true,
    })
      .select("username schoolID")
      .sort({ username: 1 });

    res.status(200).json({
      success: true,
      data: {
        schools: schools.map((school) => ({
          value: school.username, // Use username as the value
          label: `${school.username} (${school.schoolID})`, // Display both username and schoolID
        })),
      },
    });
  } catch (error) {
    console.error("Get all schools error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get all admins (Admin only)
const getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: "Admin", isActive: true })
      .select("username email isActive createdAt")
      .sort({ username: 1 });

    res.status(200).json({
      success: true,
      data: { admins },
    });
  } catch (error) {
    console.error("Error fetching admins:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Add new admin (Admin only)
const addAdmin = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Basic validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Username, email, and password are required",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email or username already exists",
      });
    }

    // Create new admin user
    const newAdmin = new User({
      username,
      email,
      password,
      role: "Admin",
      gender: "Other", // Default gender for admin
      isActive: true,
      createdBy: req.user._id,
    });

    await newAdmin.save();

    // Return success response (without password)
    const adminData = newAdmin.toJSON();
    delete adminData.password;

    res.status(201).json({
      success: true,
      message: "Admin user created successfully",
      data: { admin: adminData },
    });
  } catch (error) {
    console.error("Error creating admin:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Public admin registration (no authentication required)
const registerAdmin = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Basic validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Required fields: username, email, and password",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email or username already exists",
      });
    }

    // Create new admin user as active
    const newAdmin = new User({
      username,
      email,
      password,
      role: "Admin",
      gender: "Other", // Default gender for admin
      isActive: true, // Active immediately
      status: "Active", // Active status
      createdBy: null, // No creator for public registration
    });

    await newAdmin.save();

    // Return success response (without password)
    const adminData = newAdmin.toJSON();
    delete adminData.password;

    res.status(201).json({
      success: true,
      message: "Admin registration successful! You can now log in.",
      data: { admin: adminData },
    });
  } catch (error) {
    console.error("Error registering admin:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
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
};
