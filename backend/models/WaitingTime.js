const mongoose = require("mongoose");

const waitingTimeSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    date: {
      type: String,
      required: true,
      // Format: "YYYY-MM-DD" or normalized equivalent used throughout controllers
    },
    flight: {
      type: String,
      required: true,
    },
    arrivalTime: {
      type: String,
      required: true,
      // Format: "HH:MM:SS"
    },
    // Legacy numeric minutes field (kept for compatibility)
    waitingTime: {
      type: Number,
      required: true,
      min: 0,
      max: 120, // Maximum 120 minutes
      default: 0,
    },
    // New: exact time when waiting was recorded (button press)
    waitingStartedAt: {
      type: String, // "HH:MM:SS"
    },
    pickupTime: {
      type: String,
      // Format: "HH:MM:SS"
    },
    status: {
      type: String,
      enum: ["waiting", "picked_up", "completed"],
      default: "waiting",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    notes: {
      type: String,
      maxLength: 500,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
waitingTimeSchema.index({ date: 1, studentId: 1 });
waitingTimeSchema.index({ date: 1, flight: 1 });

// Virtual for formatted waiting time
waitingTimeSchema.virtual("formattedWaitingTime").get(function () {
  if (this.waitingTime === 0) return "0 min";
  if (this.waitingTime === 1) return "1 min";
  return `${this.waitingTime} mins`;
});

// Ensure virtual fields are serialized
waitingTimeSchema.set("toJSON", { virtuals: true });
waitingTimeSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("WaitingTime", waitingTimeSchema);
