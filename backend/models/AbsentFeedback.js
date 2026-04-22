const mongoose = require("mongoose");

const absentFeedbackSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    date: {
      type: String,
      required: true,
      // Format: "MM/DD/YYYY"
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
    feedback: {
      type: String,
      required: true,
      maxLength: 1000,
    },
    feedbackType: {
      type: String,
      enum: ["absent", "late", "no_show", "other"],
      default: "absent",
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved"],
      default: "pending",
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewNotes: {
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
absentFeedbackSchema.index({ date: 1, studentId: 1 });
absentFeedbackSchema.index({ date: 1, flight: 1 });
absentFeedbackSchema.index({ date: 1, status: 1 });
absentFeedbackSchema.index({ submittedBy: 1, date: 1 });

// Ensure virtual fields are serialized
absentFeedbackSchema.set("toJSON", { virtuals: true });
absentFeedbackSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("AbsentFeedback", absentFeedbackSchema);
