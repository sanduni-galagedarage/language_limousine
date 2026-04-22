const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      validate: {
        validator: function (v) {
          // Allow any length for School usernames (no min limit)
          if (this.role === "School") {
            return typeof v === "string" && v.trim().length >= 1;
          }
          // For other roles, keep a minimal requirement of 3 for safety
          return typeof v === "string" && v.trim().length >= 3;
        },
        message:
          "Username must be at least 3 characters long (no minimum for School)",
      },
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: "Other",
    },
    dateOfBirth: {
      type: Date,
    },
    address: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    zipCode: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
    companyName: {
      type: String,
      trim: true,
    },
    position: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    employeeId: {
      type: String,
      trim: true,
    },
    emergencyContact: {
      name: {
        type: String,
        trim: true,
      },
      relationship: {
        type: String,
        trim: true,
      },
      phone: {
        type: String,
        trim: true,
      },
      email: {
        type: String,
        trim: true,
      },
    },
    // Greeter specific fields
    greeterID: {
      type: String,
      unique: true,
      sparse: true,
      required: function () {
        return this.role === "Greeter";
      },
    },
    // Driver specific fields
    driverID: {
      type: String,
      unique: true,
      sparse: true,
      required: function () {
        return this.role === "Driver";
      },
      validate: {
        validator: function (v) {
          // Only validate if role is Driver
          if (this.role === "Driver") {
            return v && v.length > 0;
          }
          return true;
        },
        message: "DriverID is required for Driver role",
      },
    },
    // SubDriver specific fields
    subdriverID: {
      type: String,
      unique: true,
      sparse: true,
      required: function () {
        return this.role === "Subdriver";
      },
    },
    // School specific fields
    schoolID: {
      type: String,
      unique: true,
      sparse: true,
      required: function () {
        return this.role === "School";
      },
    },
    // Vehicle number for drivers and subdrivers
    vehicleNumber: {
      type: String,
      // Optional for Driver; still required for Subdriver below
      required: function () {
        return this.role === "Subdriver";
      },
      validate: {
        validator: function (v) {
          if (this.role === "Subdriver") {
            return v && v.length > 0;
          }
          return true;
        },
        message: "Vehicle Number is required for Subdriver role",
      },
      trim: true,
    },
    // Status field - allow all possible statuses for flexibility
    status: {
      type: String,
      enum: [
        "On Duty",
        "Off Duty",
        "Available",
        "Busy",
        "Active",
        "Inactive",
        "Pending",
      ],
      default: "Active",
      required: function () {
        return this.role === "Driver" || this.role === "Subdriver";
      },
    },
    role: {
      type: String,
      enum: ["Admin", "Greeter", "Driver", "Subdriver", "School"],
      default: "Greeter",
      required: [true, "Role is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Set default status based on role
userSchema.pre("save", function (next) {
  if (this.isNew && !this.status) {
    if (this.role === "Driver") {
      this.status = "Off Duty";
    } else if (this.role === "Subdriver") {
      this.status = "Active";
    } else if (this.role === "Admin") {
      this.status = "Active";
    }
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model("User", userSchema);
