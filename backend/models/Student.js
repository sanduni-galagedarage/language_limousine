const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: [true, "Date is required"],
      trim: true,
    },
    trip: {
      type: String,
      required: [true, "Trip is required"],
      trim: true,
    },
    actualArrivalTime: {
      type: String,
      required: [true, "Actual arrival time is required"],
      trim: true,
    },
    arrivalTime: {
      type: String,
      required: [true, "Arrival time is required"],
      trim: true,
    },
    departurePickupTime: {
      type: String,
      trim: true,
    },
    flight: {
      type: String,
      required: [true, "Flight is required"],
      trim: true,
    },
    dOrI: {
      type: String,
      required: [true, "D or I is required"],
      enum: ["D", "I"],
      trim: true,
    },
    mOrF: {
      type: String,
      required: [true, "M or F is required"],
      enum: ["M", "F"],
      trim: true,
    },
    studentNo: {
      type: String,
      required: [true, "Student number is required"],
      trim: true,
    },
    studentGivenName: {
      type: String,
      required: [true, "Student given name is required"],
      trim: true,
    },
    studentFamilyName: {
      type: String,
      required: [true, "Student family name is required"],
      trim: true,
    },
    hostGivenName: {
      type: String,
      required: [true, "Host given name is required"],
      trim: true,
    },
    hostFamilyName: {
      type: String,
      required: [true, "Host family name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    specialInstructions: {
      type: String,
      trim: true,
    },
    studyPermit: {
      type: String,
      enum: ["Y", "N"],
      trim: true,
    },
    school: {
      type: String,
      required: [true, "School is required"],
      trim: true,
    },
    staffMemberAssigned: {
      type: String,
      trim: true,
    },
    client: {
      type: String,
      required: [true, "Client is required"],
      trim: true,
    },
    excelOrder: {
      type: Number,
      required: [true, "Excel order is required"],
      min: 1,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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

// Create indexes for better performance
studentSchema.index({ date: 1, trip: 1 });
studentSchema.index({ studentNo: 1, date: 1 });
studentSchema.index({ isActive: 1 });
studentSchema.index({ excelOrder: 1, date: 1 }); // Add index for excel order
studentSchema.index({
  trip: "text",
  studentNo: "text",
  arrivalTime: "text",
  studentGivenName: "text",
  studentFamilyName: "text",
  flight: "text",
  school: "text",
});

module.exports = mongoose.model("Student", studentSchema);
