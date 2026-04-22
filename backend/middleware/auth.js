const jwt = require("jsonwebtoken");
const User = require("../models/User");

// JWT Authentication Middleware
const authenticateToken = async (req, res, next) => {
  try {
    console.log("Auth middleware - headers:", req.headers);
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN
    console.log("Auth middleware - token:", token ? "present" : "missing");

    if (!token) {
      console.log("Auth middleware - no token provided");
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );

    // Find user
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }

    res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

// Admin Authorization Middleware
const requireAdmin = async (req, res, next) => {
  try {
    // Check if user exists and is admin
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (req.user.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required",
      });
    }

    next();
  } catch (error) {
    console.error("Admin authorization error:", error);
    res.status(500).json({
      success: false,
      message: "Authorization failed",
    });
  }
};

// School Authorization Middleware
const requireSchool = async (req, res, next) => {
  try {
    // Check if user exists and is a school
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (req.user.role !== "School") {
      return res.status(403).json({
        success: false,
        message: "Access denied. School privileges required",
      });
    }

    next();
  } catch (error) {
    console.error("School authorization error:", error);
    res.status(500).json({
      success: false,
      message: "Authorization failed",
    });
  }
};

// Greeter Authorization Middleware
const requireGreeter = async (req, res, next) => {
  try {
    // Check if user exists and is a greeter
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (req.user.role !== "Greeter") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Greeter privileges required",
      });
    }

    next();
  } catch (error) {
    console.error("Greeter authorization error:", error);
    res.status(500).json({
      success: false,
      message: "Authorization failed",
    });
  }
};

// Generic role authorization middleware
const requireRoles = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required roles: ${allowedRoles.join(", ")}`,
        });
      }

      next();
    } catch (error) {
      console.error("Role authorization error:", error);
      res.status(500).json({
        success: false,
        message: "Authorization failed",
      });
    }
  };
};

// Optional Authentication Middleware (for routes that can work with or without auth)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-secret-key"
      );
      const user = await User.findById(decoded.userId).select("-password");

      if (user && user.isActive) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireSchool,
  requireGreeter,
  requireRoles,
  optionalAuth,
};
