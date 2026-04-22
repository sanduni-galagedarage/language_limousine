const mongoose = require("mongoose");

const studentAssignmentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student ID is required"],
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return !this.subdriverId; // Either driverId or subdriverId must be provided
      },
    },
    subdriverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return !this.driverId; // Either driverId or subdriverId must be provided
      },
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Assigned by user is required"],
    },
    assignmentDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["Assigned", "Completed", "Cancelled"],
      default: "Assigned",
    },
    pickupStatus: {
      type: String,
      enum: ["Pending", "Completed"],
      default: "Pending",
    },
    deliveryStatus: {
      type: String,
      enum: ["Pending", "Completed"],
      default: "Pending",
    },
    pickupTime: {
      type: Date,
    },
    deliveryTime: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
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

// Ensure only one active assignment per student
studentAssignmentSchema.index(
  { studentId: 1, isActive: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);

// Ensure driver/subdriver is not assigned to both roles for the same assignment
studentAssignmentSchema.index({ driverId: 1, subdriverId: 1, isActive: 1 });

// Create indexes for better performance
studentAssignmentSchema.index({ driverId: 1, isActive: 1 });
studentAssignmentSchema.index({ subdriverId: 1, isActive: 1 });
studentAssignmentSchema.index({ assignedBy: 1 });
studentAssignmentSchema.index({ assignmentDate: 1 });

module.exports = mongoose.model("StudentAssignment", studentAssignmentSchema);
