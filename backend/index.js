const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();

// Connect to database
connectDB().catch((error) => {
  console.error("Failed to connect to database:", error);
  process.exit(1);
});

// Security middleware
app.use(helmet());

// CORS configuration (multiple origins, no Vercel-specific wildcard)
const allowedOrigins = (
  process.env.CLIENT_URLS ||
  process.env.CLIENT_URL ||
  ("http://localhost:5173" && "'http://localhost:5000',")
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const isOriginAllowed = (origin) => {
  if (!origin) return true; // non-browser or same-origin requests
  return allowedOrigins.includes(origin);
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Ensure correct IPs behind proxies (e.g., Vercel/NGINX)
app.set("trust proxy", 1);

// Rate limiting
const isProd = process.env.NODE_ENV === "production";

// Global limiter (very relaxed in production, disabled in dev)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProd ? 1000 : 0, // disable via skip() when not prod
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  // Disable the limiter entirely in non-production environments
  skip: () => !isProd,
});
app.use(globalLimiter);

// Tighter limiter only for login to prevent brute-force
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts, please try again later.",
  },
});
// Apply specifically to the login endpoint
app.use("/api/auth/login", loginLimiter);

// Body parser middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const studentRoutes = require("./routes/students");
const schoolStudentRoutes = require("./routes/schoolStudents");
const assignmentRoutes = require("./routes/assignments");
const driverRoutes = require("./routes/driver");
const subdriverRoutes = require("./routes/subdriver");
const greeterRoutes = require("./routes/greeter");
const schoolRoutes = require("./routes/school");
const waitingTimeRoutes = require("./routes/waitingTime");
const absentFeedbackRoutes = require("./routes/absentFeedback");
const excelUploadRoutes = require("./routes/excelUpload");
const geocodeRoutes = require("./routes/geocode");

// Routes (always under /api)
app.use(`/api/auth`, authRoutes);
app.use(`/api/users`, userRoutes);
app.use(`/api/students`, studentRoutes);
app.use(`/api/school-students`, schoolStudentRoutes);
app.use(`/api/assignments`, assignmentRoutes);
app.use(`/api/driver`, driverRoutes);
app.use(`/api/subdriver`, subdriverRoutes);
app.use(`/api/greeter`, greeterRoutes);
app.use(`/api/school`, schoolRoutes);
app.use(`/api/waiting-time`, waitingTimeRoutes);
app.use(`/api/absent-feedback`, absentFeedbackRoutes);
app.use(`/api/excel-upload`, excelUploadRoutes);
app.use(`/api/geocode`, geocodeRoutes);

// Health check route
app.get(`/api/health`, (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("Global error handler:", error);

  res.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal server error",
    error: process.env.NODE_ENV === "development" ? error.stack : undefined,
  });
});

const PORT = process.env.PORT || 5000;

// Export for Vercel serverless, otherwise listen locally
if (process.env.VERCEL) {
  module.exports = app;
} else {
  app.listen(PORT, () => {
    console.log(
      `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
    );
  });
}
