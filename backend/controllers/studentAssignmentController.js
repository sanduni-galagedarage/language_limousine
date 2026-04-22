const StudentAssignment = require("../models/StudentAssignment");
const Student = require("../models/Student");
const User = require("../models/User");
const WaitingTime = require("../models/WaitingTime");
const mongoose = require("mongoose");

// Compute offset between UTC and a target time zone for a specific instant
function getTimeZoneOffsetMsFor(date, timeZone) {
  const opts = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };
  const partsTz = new Intl.DateTimeFormat("en-CA", {
    ...opts,
    timeZone,
  }).formatToParts(date);
  const partsUtc = new Intl.DateTimeFormat("en-CA", {
    ...opts,
    timeZone: "UTC",
  }).formatToParts(date);
  const getNum = (parts, type) =>
    parseInt(parts.find((p) => p.type === type)?.value || "0", 10);
  const msTz = Date.UTC(
    getNum(partsTz, "year"),
    getNum(partsTz, "month") - 1,
    getNum(partsTz, "day"),
    getNum(partsTz, "hour"),
    getNum(partsTz, "minute"),
    getNum(partsTz, "second")
  );
  const msUtc = Date.UTC(
    getNum(partsUtc, "year"),
    getNum(partsUtc, "month") - 1,
    getNum(partsUtc, "day"),
    getNum(partsUtc, "hour"),
    getNum(partsUtc, "minute"),
    getNum(partsUtc, "second")
  );
  return msUtc - msTz; // positive when TZ is behind UTC (e.g., PDT)
}

// Build a Date object for today in Vancouver with provided HH:MM[:SS]
function buildVancouverDateFromTimeString(timeString) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Vancouver",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const getNum = (type) =>
    parseInt(parts.find((p) => p.type === type)?.value || "0", 10);
  const y = getNum("year");
  const m = getNum("month");
  const d = getNum("day");
  const [hStr, mStr, sStr] = timeString.split(":");
  const hh = parseInt(hStr, 10) || 0;
  const mm = parseInt(mStr, 10) || 0;
  const ss = parseInt(sStr || "0", 10) || 0;
  // Build the time as if it's local Vancouver wall clock, then adjust to the proper UTC instant
  const baseUtc = Date.UTC(y, (m || 1) - 1, d || 1, hh, mm, ss);
  const offset = getTimeZoneOffsetMsFor(new Date(baseUtc), "America/Vancouver");
  return new Date(baseUtc + offset);
}

// Helper function to normalize date format
function normalizeDateQuery(dateStr) {
  if (!dateStr) return null;
  // Accept YYYY-MM-DD or MM/DD/YYYY and normalize to YYYY-MM-DD
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    const [m, d, y] = dateStr.split("/");
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return dateStr;
}

// POST /api/assignments - Assign students to driver/subdriver
const assignStudents = async (req, res) => {
  try {
    const { studentIds, driverId, subdriverId, notes, assignmentDate } =
      req.body;

    // Validate input
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Student IDs array is required and must not be empty",
      });
    }

    if (!driverId && !subdriverId) {
      return res.status(400).json({
        success: false,
        message: "Either driverId or subdriverId must be provided",
      });
    }

    if (driverId && subdriverId) {
      return res.status(400).json({
        success: false,
        message: "Cannot assign to both driver and subdriver simultaneously",
      });
    }

    // Require assignmentDate from greeter UI
    if (!assignmentDate) {
      return res.status(400).json({
        success: false,
        message: "assignmentDate is required (YYYY-MM-DD)",
      });
    }

    const iso = normalizeDateQuery(assignmentDate);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assignmentDate format. Use YYYY-MM-DD",
      });
    }

    // Validate driver/subdriver exists and has correct role
    let assignedTo = null;
    if (driverId) {
      assignedTo = await User.findOne({
        _id: driverId,
        role: "Driver",
        isActive: true,
      });
      if (!assignedTo) {
        return res.status(404).json({
          success: false,
          message: "Driver not found or inactive",
        });
      }
    } else if (subdriverId) {
      assignedTo = await User.findOne({
        _id: subdriverId,
        role: "Subdriver",
        isActive: true,
      });
      if (!assignedTo) {
        return res.status(404).json({
          success: false,
          message: "Subdriver not found or inactive",
        });
      }
    }

    // Validate all students exist and are not already assigned
    const students = await Student.find({
      _id: { $in: studentIds },
      isActive: true,
    });

    if (students.length !== studentIds.length) {
      return res.status(404).json({
        success: false,
        message: "One or more students not found",
      });
    }

    // Ensure we don't duplicate assignment for the same student on same date
    const startDate = new Date(`${iso}T00:00:00.000Z`);
    const endDate = new Date(`${iso}T00:00:00.000Z`);
    endDate.setDate(endDate.getDate() + 1);

    const alreadyAssigned = await StudentAssignment.find({
      studentId: { $in: studentIds },
      isActive: true,
      assignmentDate: { $gte: startDate, $lt: endDate },
    }).distinct("studentId");

    if (alreadyAssigned.length > 0) {
      return res.status(400).json({
        success: false,
        message: `These students are already assigned for ${iso}: ${alreadyAssigned.join(
          ", "
        )}`,
      });
    }

    // Create assignments with required date
    const assignments = studentIds.map((studentId) => ({
      studentId,
      driverId: driverId || null,
      subdriverId: subdriverId || null,
      assignedBy: req.user._id,
      notes: notes || "",
      assignmentDate: startDate,
    }));

    const createdAssignments = await StudentAssignment.insertMany(assignments);

    // Populate the created assignments with student and driver/subdriver details
    const populatedAssignments = await StudentAssignment.find({
      _id: { $in: createdAssignments.map((a) => a._id) },
    })
      .populate(
        "studentId",
        "studentNo studentGivenName studentFamilyName arrivalTime actualArrivalTime flight address city"
      )
      .populate("driverId", "username driverID vehicleNumber")
      .populate("subdriverId", "username subdriverID vehicleNumber")
      .populate("assignedBy", "username");

    return res.status(201).json({
      success: true,
      message: "Students assigned successfully",
      data: { assignments: populatedAssignments },
    });
  } catch (err) {
    console.error("assignStudents error", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// GET /api/assignments - Get assignments list (supports date, driver filters, pagination override)
const getAssignments = async (req, res) => {
  try {
    const page = parseInt(req.query.page || "1", 10);
    const limitParam = req.query.limit;
    // Support limit=all to disable pagination
    const limit = limitParam === "all" ? 0 : parseInt(limitParam || "10", 10);
    const search = req.query.search || "";
    const status = req.query.status;
    const date = req.query.date || new Date().toISOString().split("T")[0];
    const driverId = req.query.driverId;
    const subdriverId = req.query.subdriverId;

    // Build date filter
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    const query = {
      isActive: true,
      assignmentDate: { $gte: startDate, $lt: endDate },
    };
    if (status) query.status = status;
    if (driverId) query.driverId = driverId;
    if (subdriverId) query.subdriverId = subdriverId;

    if (search) {
      query.$or = [{ notes: { $regex: search, $options: "i" } }];
    }

    const skip = (page - 1) * limit;
    // Build the mongoose query
    let findQuery = StudentAssignment.find(query)
      .populate(
        "studentId",
        "trip studentNo studentGivenName studentFamilyName arrivalTime actualArrivalTime flight dOrI mOrF hostGivenName hostFamilyName phone school address city specialInstructions studyPermit client excelOrder"
      )
      .populate("driverId", "username driverID vehicleNumber")
      .populate("subdriverId", "username subdriverID vehicleNumber")
      .populate("assignedBy", "username")
      .sort({ assignmentDate: -1 });

    if (limit > 0) {
      findQuery = findQuery.skip(skip).limit(limit);
    }

    const [assignments, total] = await Promise.all([
      findQuery,
      StudentAssignment.countDocuments(query),
    ]);

    return res.json({
      success: true,
      data: {
        assignments,
        pagination: {
          currentPage: page,
          totalPages: limit > 0 ? Math.ceil(total / limit) : 1,
          totalAssignments: total,
          limit,
        },
      },
    });
  } catch (err) {
    console.error("getAssignments error", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// GET /api/assignments/unassigned-students - Get students not yet assigned
const getUnassignedStudents = async (req, res) => {
  try {
    const page = parseInt(req.query.page || "1", 10);
    const limit = parseInt(req.query.limit || "10", 10);
    const search = req.query.search || "";
    const date = req.query.date;

    // Get assigned student IDs, filtered by selected date if provided
    let assignedStudentIds = [];
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      assignedStudentIds = await StudentAssignment.find({
        isActive: true,
        assignmentDate: { $gte: startDate, $lt: endDate },
      }).distinct("studentId");
    } else {
      assignedStudentIds = await StudentAssignment.find({
        isActive: true,
      }).distinct("studentId");
    }

    // Build query for unassigned students (by their student.date when provided)
    const query = {
      _id: { $nin: assignedStudentIds },
      isActive: true,
    };

    if (date) {
      query.date = normalizeDateQuery(date);
    }

    if (search) {
      query.$or = [
        { studentNo: { $regex: search, $options: "i" } },
        { studentGivenName: { $regex: search, $options: "i" } },
        { studentFamilyName: { $regex: search, $options: "i" } },
        { flight: { $regex: search, $options: "i" } },
        { hostGivenName: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const [students, total] = await Promise.all([
      // Sort primarily by excelOrder to mirror Admin's Excel view, with arrivalTime as secondary
      Student.find(query)
        .sort({ excelOrder: 1, arrivalTime: 1 })
        .skip(skip)
        .limit(limit),
      Student.countDocuments(query),
    ]);

    return res.json({
      success: true,
      data: {
        students,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalStudents: total,
          limit,
        },
      },
    });
  } catch (err) {
    console.error("getUnassignedStudents error", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// GET /api/assignments/drivers - Get all drivers and subdrivers
const getDriversAndSubdrivers = async (req, res) => {
  try {
    const [drivers, subdrivers] = await Promise.all([
      User.find({ role: "Driver", isActive: true })
        .select("username driverID vehicleNumber")
        .sort({ username: 1 }),
      User.find({ role: "Subdriver", isActive: true })
        .select("username subdriverID vehicleNumber status")
        .sort({ username: 1 }),
    ]);

    return res.json({
      success: true,
      data: {
        drivers,
        subdrivers,
      },
    });
  } catch (err) {
    console.error("getDriversAndSubdrivers error", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// PUT /api/assignments/:assignmentId - Update assignment status
const updateAssignment = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const assignmentId = req.params.assignmentId;

    const assignment = await StudentAssignment.findOne({
      _id: assignmentId,
      isActive: true,
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    if (status && !["Assigned", "Completed", "Cancelled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be Assigned, Completed, or Cancelled",
      });
    }

    if (status) assignment.status = status;
    if (notes !== undefined) assignment.notes = notes;

    await assignment.save();

    const populatedAssignment = await StudentAssignment.findById(assignmentId)
      .populate(
        "studentId",
        "studentNo studentGivenName studentFamilyName arrivalTime actualArrivalTime flight address city"
      )
      .populate("driverId", "username driverID vehicleNumber")
      .populate("subdriverId", "username subdriverID vehicleNumber")
      .populate("assignedBy", "username");

    return res.json({
      success: true,
      message: "Assignment updated successfully",
      data: { assignment: populatedAssignment },
    });
  } catch (err) {
    console.error("updateAssignment error", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// DELETE /api/assignments/:assignmentId - Cancel assignment (soft delete)
const cancelAssignment = async (req, res) => {
  try {
    const assignmentId = req.params.assignmentId;

    console.log("🔍 cancelAssignment - Received assignmentId:", assignmentId);
    console.log("🔍 cancelAssignment - req.params:", req.params);

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      console.log(
        "🔍 cancelAssignment - Invalid ObjectId format:",
        assignmentId
      );
      return res.status(400).json({
        success: false,
        message: "Invalid assignment ID format",
      });
    }

    const assignment = await StudentAssignment.findOne({
      _id: assignmentId,
      isActive: true,
    });

    console.log("🔍 cancelAssignment - Found assignment:", assignment);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    assignment.isActive = false;
    assignment.status = "Cancelled";
    await assignment.save();

    return res.json({
      success: true,
      message: "Assignment cancelled successfully",
    });
  } catch (err) {
    console.error("cancelAssignment error", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// GET /api/assignments/driver/my-assignments - Get assignments for logged-in driver
const getDriverAssignments = async (req, res) => {
  try {
    const driverId = req.user._id;
    const page = parseInt(req.query.page || "1", 10);
    const limit = parseInt(req.query.limit || "10", 10);
    const date = req.query.date || new Date().toISOString().split("T")[0]; // Today by default

    // Build date filter
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    const query = {
      $or: [{ driverId: driverId }, { subdriverId: driverId }],
      isActive: true,
      assignmentDate: { $gte: startDate, $lt: endDate },
    };

    const skip = (page - 1) * limit;
    const [assignments, total] = await Promise.all([
      StudentAssignment.find(query)
        .populate(
          "studentId",
          "trip studentNo studentGivenName studentFamilyName arrivalTime actualArrivalTime flight dOrI mOrF hostGivenName hostFamilyName phone school address city specialInstructions studyPermit client excelOrder"
        )
        .populate("driverId", "username driverID vehicleNumber")
        .populate("subdriverId", "username subdriverID vehicleNumber")
        .sort({ assignmentDate: -1 })
        .skip(skip)
        .limit(limit),
      StudentAssignment.countDocuments(query),
    ]);

    // Format delivery time for display
    const assignmentsWithFormattedTimes = assignments.map((assignment) => {
      // Format delivery time for display
      let deliveryTimeFormatted = null;
      if (assignment.deliveryTime) {
        const deliveryTime = new Date(assignment.deliveryTime);
        deliveryTimeFormatted = deliveryTime.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
      }

      return {
        ...assignment.toObject(),
        deliveryTimeFormatted: deliveryTimeFormatted,
      };
    });

    console.log(
      "🔍 getDriverAssignments - Query:",
      JSON.stringify(query, null, 2)
    );
    console.log(
      "🔍 getDriverAssignments - Found assignments:",
      assignments.length
    );
    if (assignments.length > 0) {
      console.log(
        "🔍 Sample assignment:",
        JSON.stringify(assignments[0], null, 2)
      );
    }

    return res.json({
      success: true,
      data: {
        assignments: assignmentsWithFormattedTimes,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalAssignments: total,
          limit,
        },
      },
    });
  } catch (err) {
    console.error("getDriverAssignments error", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// GET /api/driver/completed-tasks - Get completed assignments for logged-in driver
const getDriverCompletedTasks = async (req, res) => {
  try {
    const driverId = req.user._id;
    const page = parseInt(req.query.page || "1", 10);
    const limit = parseInt(req.query.limit || "10", 10);
    const date = req.query.date || new Date().toISOString().split("T")[0]; // Today by default

    // Build date filter
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    const query = {
      $and: [
        { $or: [{ driverId: driverId }, { subdriverId: driverId }] },
        { isActive: true },
        { assignmentDate: { $gte: startDate, $lt: endDate } },
        {
          $or: [{ pickupStatus: "Completed" }, { deliveryStatus: "Completed" }],
        },
      ],
    };

    const skip = (page - 1) * limit;
    const [assignments, total] = await Promise.all([
      StudentAssignment.find(query)
        .populate(
          "studentId",
          "trip studentNo studentGivenName studentFamilyName arrivalTime actualArrivalTime flight dOrI mOrF hostGivenName hostFamilyName phone school address city specialInstructions studyPermit client excelOrder"
        )
        .populate("driverId", "username driverID vehicleNumber")
        .populate("subdriverId", "username subdriverID vehicleNumber")
        .sort({ assignmentDate: -1 })
        .skip(skip)
        .limit(limit),
      StudentAssignment.countDocuments(query),
    ]);

    // Format delivery time for display
    const assignmentsWithFormattedTimes = assignments.map((assignment) => {
      // Format delivery time for display
      let deliveryTimeFormatted = null;
      if (assignment.deliveryTime) {
        const deliveryTime = new Date(assignment.deliveryTime);
        deliveryTimeFormatted = deliveryTime.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
      }

      return {
        ...assignment.toObject(),
        deliveryTimeFormatted: deliveryTimeFormatted,
      };
    });

    return res.json({
      success: true,
      data: {
        assignments: assignmentsWithFormattedTimes,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalAssignments: total,
          limit,
        },
      },
    });
  } catch (err) {
    console.error("getDriverCompletedTasks error", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// PUT /api/assignments/driver/update-pickup - Update pickup status
const updatePickupStatus = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { pickupStatus } = req.body;
    const driverId = req.user._id;

    if (!["Pending", "Completed"].includes(pickupStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pickup status. Must be Pending or Completed",
      });
    }

    const assignment = await StudentAssignment.findOne({
      _id: assignmentId,
      $or: [{ driverId: driverId }, { subdriverId: driverId }],
      isActive: true,
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message:
          "Assignment not found or you don't have permission to update it",
      });
    }

    assignment.pickupStatus = pickupStatus;
    if (pickupStatus === "Completed") {
      assignment.pickupTime = new Date();
    }
    await assignment.save();

    const populatedAssignment = await StudentAssignment.findById(assignmentId)
      .populate(
        "studentId",
        "studentNo studentGivenName studentFamilyName arrivalTime flight address city"
      )
      .populate("driverId", "username driverID vehicleNumber")
      .populate("subdriverId", "username subdriverID vehicleNumber");

    return res.json({
      success: true,
      message: "Pickup status updated successfully",
      data: { assignment: populatedAssignment },
    });
  } catch (err) {
    console.error("updatePickupStatus error", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// PUT /api/assignments/driver/update-delivery - Update delivery status
const updateDeliveryStatus = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { deliveryStatus } = req.body;
    const driverId = req.user._id;

    if (!["Pending", "Completed"].includes(deliveryStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid delivery status. Must be Pending or Completed",
      });
    }

    const assignment = await StudentAssignment.findOne({
      _id: assignmentId,
      $or: [{ driverId: driverId }, { subdriverId: driverId }],
      isActive: true,
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message:
          "Assignment not found or you don't have permission to update it",
      });
    }

    assignment.deliveryStatus = deliveryStatus;
    if (deliveryStatus === "Completed") {
      assignment.deliveryTime = new Date();
    }
    await assignment.save();

    const populatedAssignment = await StudentAssignment.findById(assignmentId)
      .populate(
        "studentId",
        "studentNo studentGivenName studentFamilyName arrivalTime flight address city"
      )
      .populate("driverId", "username driverID vehicleNumber")
      .populate("subdriverId", "username subdriverID vehicleNumber");

    // Format delivery time for display
    if (populatedAssignment.deliveryTime) {
      const deliveryTime = new Date(populatedAssignment.deliveryTime);
      populatedAssignment.deliveryTimeFormatted =
        deliveryTime.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
    }

    return res.json({
      success: true,
      message: "Delivery status updated successfully",
      data: { assignment: populatedAssignment },
    });
  } catch (err) {
    console.error("updateDeliveryStatus error", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// PUT /api/assignments/driver/update-delivery-time - Update delivery time
const updateDeliveryTime = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { deliveryTime } = req.body;
    const driverId = req.user._id;

    if (!deliveryTime) {
      return res.status(400).json({
        success: false,
        message: "Delivery time is required",
      });
    }

    const assignment = await StudentAssignment.findOne({
      _id: assignmentId,
      $or: [{ driverId: driverId }, { subdriverId: driverId }],
      isActive: true,
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message:
          "Assignment not found or you don't have permission to update it",
      });
    }

    // Convert delivery time string to Date object
    // Expected format: "HH:MM:SS" or "HH:MM"
    let deliveryDateTime;
    if (deliveryTime) {
      // Validate time format
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])(:([0-5][0-9]))?$/;
      if (!timeRegex.test(deliveryTime)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid delivery time format. Use HH:MM:SS or HH:MM (24-hour format)",
        });
      }

      const [hours, minutes, seconds] = deliveryTime.split(":").map(Number);
      if (hours !== undefined && minutes !== undefined) {
        deliveryDateTime = buildVancouverDateFromTimeString(deliveryTime);
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid delivery time format. Use HH:MM:SS or HH:MM",
        });
      }
    }

    assignment.deliveryTime = deliveryDateTime;
    await assignment.save();

    const populatedAssignment = await StudentAssignment.findById(assignmentId)
      .populate(
        "studentId",
        "studentNo studentGivenName studentFamilyName arrivalTime actualArrivalTime flight address city"
      )
      .populate("driverId", "username driverID vehicleNumber")
      .populate("subdriverId", "username subdriverID vehicleNumber");

    // Format delivery time for display
    if (populatedAssignment.deliveryTime) {
      const deliveryTime = new Date(populatedAssignment.deliveryTime);
      populatedAssignment.deliveryTimeFormatted =
        deliveryTime.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
    }

    return res.json({
      success: true,
      message: "Delivery time updated successfully",
      data: { assignment: populatedAssignment },
    });
  } catch (err) {
    console.error("updateDeliveryTime error", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  assignStudents,
  getAssignments,
  getUnassignedStudents,
  getDriversAndSubdrivers,
  updateAssignment,
  cancelAssignment,
  getDriverAssignments,
  getDriverCompletedTasks,
  updatePickupStatus,
  updateDeliveryStatus,
  updateDeliveryTime,
};
