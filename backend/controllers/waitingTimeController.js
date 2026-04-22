const WaitingTime = require("../models/WaitingTime");
const Student = require("../models/Student");

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

// GET /api/waiting-time - Get waiting times for a specific date
const getWaitingTimes = async (req, res) => {
  try {
    const {
      date,
      page = 1,
      limit = 10,
      search = "",
      status = "",
      sortBy = "excelOrder",
      sortOrder = "asc",
    } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date parameter is required",
      });
    }

    // Normalize date format for database query
    const normalizedDate = normalizeDateQuery(date);

    // Build query
    const query = { date: normalizedDate, isActive: true };
    if (status) query.status = status;

    // Get students for the date first
    const studentsQuery = { date: normalizedDate, isActive: true };
    if (search) {
      studentsQuery.$or = [
        { studentNo: { $regex: search, $options: "i" } },
        { studentGivenName: { $regex: search, $options: "i" } },
        { studentFamilyName: { $regex: search, $options: "i" } },
        { flight: { $regex: search, $options: "i" } },
      ];
    }

    // Build sort object based on sortBy and sortOrder
    let sortObject = {};
    const sortDirection = sortOrder === "desc" ? -1 : 1;

    switch (sortBy) {
      case "excelOrder":
        sortObject = { excelOrder: sortDirection };
        break;
      case "arrivalTime":
        sortObject = { arrivalTime: sortDirection };
        break;
      case "studentNo":
        sortObject = { studentNo: sortDirection };
        break;
      case "flight":
        sortObject = { flight: sortDirection };
        break;
      case "studentGivenName":
        sortObject = { studentGivenName: sortDirection };
        break;
      default:
        sortObject = { excelOrder: sortDirection };
    }

    const students = await Student.find(studentsQuery).sort(sortObject);
    const studentIds = students.map((student) => student._id);

    // Get existing waiting times for these students
    const existingWaitingTimes = await WaitingTime.find({
      studentId: { $in: studentIds },
      date: normalizedDate,
      isActive: true,
    }).populate(
      "studentId",
      "studentNo studentGivenName studentFamilyName arrivalTime flight dOrI hostGivenName phone school address city"
    );

    // Create a map of existing waiting times
    const waitingTimeMap = new Map();
    existingWaitingTimes.forEach((wt) => {
      waitingTimeMap.set(wt.studentId._id.toString(), wt);
    });

    // Combine students with their waiting times
    const combinedData = students.map((student) => {
      const existingWT = waitingTimeMap.get(student._id.toString());
      if (existingWT) {
        return {
          ...student.toObject(),
          waitingTimeId: existingWT._id,
          waitingTime: existingWT.waitingTime,
          waitingStartedAt: existingWT.waitingStartedAt || null,
          pickupTime: existingWT.pickupTime,
          status: existingWT.status,
          notes: existingWT.notes,
          lastUpdated: existingWT.updatedAt,
        };
      } else {
        return {
          ...student.toObject(),
          waitingTimeId: null,
          waitingTime: 0,
          waitingStartedAt: null,
          pickupTime: null,
          status: "waiting",
          notes: "",
          lastUpdated: null,
        };
      }
    });

    // Apply pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedData = combinedData.slice(skip, skip + parseInt(limit));
    const total = combinedData.length;

    return res.json({
      success: true,
      data: {
        waitingTimes: paginatedData,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalWaitingTimes: total,
          limit: parseInt(limit),
        },
      },
    });
  } catch (err) {
    console.error("getWaitingTimes error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// POST /api/waiting-time - Create or update waiting time
const updateWaitingTime = async (req, res) => {
  try {
    const { studentId, date, waitingTime, pickupTime, notes, status, waitingStartedAt } =
      req.body;
    const updatedBy = req.user._id;

    // Validate input
    if (!studentId || !date || waitingTime === undefined) {
      return res.status(400).json({
        success: false,
        message: "Student ID, date, and waiting time are required",
      });
    }

    if (waitingTime < 0 || waitingTime > 120) {
      return res.status(400).json({
        success: false,
        message: "Waiting time must be between 0 and 120 minutes",
      });
    }

    // Normalize date format for database consistency
    const normalizedDate = normalizeDateQuery(date);

    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Current server time in HH:MM:SS for Canada timezone
    const nowTime = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "America/Vancouver",
    });

    // Check if waiting time already exists for this student and date
    let waitingTimeRecord = await WaitingTime.findOne({
      studentId,
      date: normalizedDate,
      isActive: true,
    });

    if (waitingTimeRecord) {
      // Update existing record
      waitingTimeRecord.waitingTime = waitingTime;
      if (pickupTime !== undefined) waitingTimeRecord.pickupTime = pickupTime;
      // Update waitingStartedAt if provided, otherwise set it if not set yet
      if (waitingStartedAt !== undefined) {
        waitingTimeRecord.waitingStartedAt = waitingStartedAt;
      } else if (!waitingTimeRecord.waitingStartedAt) {
        waitingTimeRecord.waitingStartedAt = nowTime;
      }
      waitingTimeRecord.status = status || waitingTimeRecord.status;
      waitingTimeRecord.notes = notes || waitingTimeRecord.notes;
      waitingTimeRecord.updatedBy = updatedBy;
      await waitingTimeRecord.save();
    } else {
      // Create new record
      waitingTimeRecord = new WaitingTime({
        studentId,
        date: normalizedDate,
        flight: student.flight,
        arrivalTime: student.arrivalTime,
        waitingTime,
        waitingStartedAt: waitingStartedAt || nowTime,
        pickupTime,
        status: status || "waiting",
        notes: notes || "",
        updatedBy,
      });
      await waitingTimeRecord.save();
    }

    // Populate the response
    const populatedRecord = await WaitingTime.findById(waitingTimeRecord._id)
      .populate(
        "studentId",
        "studentNo studentGivenName studentFamilyName arrivalTime flight dOrI hostGivenName phone school address city"
      )
      .populate("updatedBy", "username");

    return res.json({
      success: true,
      message: "Waiting time updated successfully",
      data: { waitingTime: populatedRecord },
    });
  } catch (err) {
    console.error("updateWaitingTime error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// PUT /api/waiting-time/:id - Update specific waiting time
const updateWaitingTimeById = async (req, res) => {
  try {
    const { id } = req.params;
    const { waitingTime, pickupTime, notes, status } = req.body;
    const updatedBy = req.user._id;

    if (waitingTime !== undefined && (waitingTime < 0 || waitingTime > 120)) {
      return res.status(400).json({
        success: false,
        message: "Waiting time must be between 0 and 120 minutes",
      });
    }

    const waitingTimeRecord = await WaitingTime.findOne({
      _id: id,
      isActive: true,
    });

    if (!waitingTimeRecord) {
      return res.status(404).json({
        success: false,
        message: "Waiting time record not found",
      });
    }

    // Update fields
    if (waitingTime !== undefined) waitingTimeRecord.waitingTime = waitingTime;
    if (pickupTime !== undefined) waitingTimeRecord.pickupTime = pickupTime;
    if (status !== undefined) waitingTimeRecord.status = status;
    if (notes !== undefined) waitingTimeRecord.notes = notes;
    waitingTimeRecord.updatedBy = updatedBy;

    await waitingTimeRecord.save();

    // Populate the response
    const populatedRecord = await WaitingTime.findById(id)
      .populate(
        "studentId",
        "studentNo studentGivenName studentFamilyName arrivalTime flight dOrI hostGivenName phone school address city"
      )
      .populate("updatedBy", "username");

    return res.json({
      success: true,
      message: "Waiting time updated successfully",
      data: { waitingTime: populatedRecord },
    });
  } catch (err) {
    console.error("updateWaitingTimeById error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// DELETE /api/waiting-time/:id - Soft delete waiting time
const deleteWaitingTime = async (req, res) => {
  try {
    const { id } = req.params;

    const waitingTimeRecord = await WaitingTime.findById(id);
    if (!waitingTimeRecord) {
      return res.status(404).json({
        success: false,
        message: "Waiting time record not found",
      });
    }

    waitingTimeRecord.isActive = false;
    await waitingTimeRecord.save();

    return res.json({
      success: true,
      message: "Waiting time deleted successfully",
    });
  } catch (err) {
    console.error("deleteWaitingTime error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// GET /api/waiting-time/stats - Get waiting time statistics
const getWaitingTimeStats = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date parameter is required",
      });
    }

    const stats = await WaitingTime.aggregate([
      { $match: { date, isActive: true } },
      {
        $group: {
          _id: null,
          totalStudents: { $sum: 1 },
          averageWaitingTime: { $avg: "$waitingTime" },
          maxWaitingTime: { $max: "$waitingTime" },
          minWaitingTime: { $min: "$waitingTime" },
          waitingCount: {
            $sum: { $cond: [{ $eq: ["$status", "waiting"] }, 1, 0] },
          },
          pickedUpCount: {
            $sum: { $cond: [{ $eq: ["$status", "picked_up"] }, 1, 0] },
          },
          completedCount: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
        },
      },
    ]);

    const result = stats[0] || {
      totalStudents: 0,
      averageWaitingTime: 0,
      maxWaitingTime: 0,
      minWaitingTime: 0,
      waitingCount: 0,
      pickedUpCount: 0,
      completedCount: 0,
    };

    return res.json({
      success: true,
      data: { stats: result },
    });
  } catch (err) {
    console.error("getWaitingTimeStats error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getWaitingTimes,
  updateWaitingTime,
  updateWaitingTimeById,
  deleteWaitingTime,
  getWaitingTimeStats,
};
