const AbsentFeedback = require("../models/AbsentFeedback");
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

// GET /api/absent-feedback - Get absent feedback for a specific date
const getAbsentFeedback = async (req, res) => {
  try {
    const { date, page = 1, limit = 10, search = "", status = "" } = req.query;

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

    const students = await Student.find(studentsQuery).sort({ arrivalTime: 1 });
    const studentIds = students.map((student) => student._id);

    // Get existing absent feedback for these students
    const existingFeedback = await AbsentFeedback.find({
      studentId: { $in: studentIds },
      date,
      isActive: true,
    }).populate(
      "studentId",
      "studentNo studentGivenName studentFamilyName arrivalTime flight dOrI hostGivenName phone school address city"
    );

    // Create a map of existing feedback
    const feedbackMap = new Map();
    existingFeedback.forEach((fb) => {
      feedbackMap.set(fb.studentId._id.toString(), fb);
    });

    // Combine students with their feedback
    const combinedData = students.map((student) => {
      const existingFB = feedbackMap.get(student._id.toString());
      if (existingFB) {
        return {
          ...student.toObject(),
          feedbackId: existingFB._id,
          feedback: existingFB.feedback,
          feedbackType: existingFB.feedbackType,
          status: existingFB.status,
          submittedAt: existingFB.createdAt,
          reviewedAt: existingFB.updatedAt,
        };
      } else {
        return {
          ...student.toObject(),
          feedbackId: null,
          feedback: "",
          feedbackType: "absent",
          status: "pending",
          submittedAt: null,
          reviewedAt: null,
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
        students: paginatedData,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalStudents: total,
          limit: parseInt(limit),
        },
      },
    });
  } catch (err) {
    console.error("getAbsentFeedback error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// POST /api/absent-feedback - Create or update absent feedback
const submitAbsentFeedback = async (req, res) => {
  try {
    const { studentId, date, feedback, feedbackType } = req.body;
    const submittedBy = req.user._id;

    // Validate input
    if (!studentId || !date || !feedback) {
      return res.status(400).json({
        success: false,
        message: "Student ID, date, and feedback are required",
      });
    }

    if (feedback.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Feedback must be less than 1000 characters",
      });
    }

    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Check if feedback already exists for this student and date
    let feedbackRecord = await AbsentFeedback.findOne({
      studentId,
      date,
      isActive: true,
    });

    if (feedbackRecord) {
      // Update existing record
      feedbackRecord.feedback = feedback;
      feedbackRecord.feedbackType = feedbackType || feedbackRecord.feedbackType;
      feedbackRecord.status = "pending"; // Reset status when updated
      feedbackRecord.reviewedBy = null;
      feedbackRecord.reviewNotes = "";
      await feedbackRecord.save();
    } else {
      // Create new record
      feedbackRecord = new AbsentFeedback({
        studentId,
        date,
        flight: student.flight,
        arrivalTime: student.arrivalTime,
        feedback,
        feedbackType: feedbackType || "absent",
        submittedBy,
      });
      await feedbackRecord.save();
    }

    // Populate the response
    const populatedRecord = await AbsentFeedback.findById(feedbackRecord._id)
      .populate(
        "studentId",
        "studentNo studentGivenName studentFamilyName arrivalTime flight dOrI hostGivenName phone school address city"
      )
      .populate("submittedBy", "username");

    return res.json({
      success: true,
      message: "Absent feedback submitted successfully",
      data: { feedback: populatedRecord },
    });
  } catch (err) {
    console.error("submitAbsentFeedback error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// PUT /api/absent-feedback/:id - Update specific feedback by ID
const updateFeedbackById = async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback, feedbackType } = req.body;
    const updatedBy = req.user._id;

    if (feedback && feedback.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Feedback must be less than 1000 characters",
      });
    }

    const feedbackRecord = await AbsentFeedback.findOne({
      _id: id,
      isActive: true,
    });

    if (!feedbackRecord) {
      return res.status(404).json({
        success: false,
        message: "Feedback record not found",
      });
    }

    // Update fields
    if (feedback !== undefined) feedbackRecord.feedback = feedback;
    if (feedbackType !== undefined) feedbackRecord.feedbackType = feedbackType;
    feedbackRecord.status = "pending"; // Reset status when updated
    feedbackRecord.reviewedBy = null;
    feedbackRecord.reviewNotes = "";

    await feedbackRecord.save();

    // Populate the response
    const populatedRecord = await AbsentFeedback.findById(id)
      .populate(
        "studentId",
        "studentNo studentGivenName studentFamilyName arrivalTime flight dOrI hostGivenName phone school address city"
      )
      .populate("submittedBy", "username");

    return res.json({
      success: true,
      message: "Feedback updated successfully",
      data: { feedback: populatedRecord },
    });
  } catch (err) {
    console.error("updateFeedbackById error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// DELETE /api/absent-feedback/:id - Soft delete feedback
const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    const feedbackRecord = await AbsentFeedback.findById(id);
    if (!feedbackRecord) {
      return res.status(404).json({
        success: false,
        message: "Feedback record not found",
      });
    }

    feedbackRecord.isActive = false;
    await feedbackRecord.save();

    return res.json({
      success: true,
      message: "Feedback deleted successfully",
    });
  } catch (err) {
    console.error("deleteFeedback error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// GET /api/absent-feedback/stats - Get feedback statistics
const getFeedbackStats = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date parameter is required",
      });
    }

    const stats = await AbsentFeedback.aggregate([
      { $match: { date, isActive: true } },
      {
        $group: {
          _id: null,
          totalFeedback: { $sum: 1 },
          pendingCount: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          reviewedCount: {
            $sum: { $cond: [{ $eq: ["$status", "reviewed"] }, 1, 0] },
          },
          resolvedCount: {
            $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] },
          },
          absentCount: {
            $sum: { $cond: [{ $eq: ["$feedbackType", "absent"] }, 1, 0] },
          },
          lateCount: {
            $sum: { $cond: [{ $eq: ["$feedbackType", "late"] }, 1, 0] },
          },
          noShowCount: {
            $sum: { $cond: [{ $eq: ["$feedbackType", "no_show"] }, 1, 0] },
          },
          otherCount: {
            $sum: { $cond: [{ $eq: ["$feedbackType", "other"] }, 1, 0] },
          },
        },
      },
    ]);

    const result = stats[0] || {
      totalFeedback: 0,
      pendingCount: 0,
      reviewedCount: 0,
      resolvedCount: 0,
      absentCount: 0,
      lateCount: 0,
      noShowCount: 0,
      otherCount: 0,
    };

    return res.json({
      success: true,
      data: { stats: result },
    });
  } catch (err) {
    console.error("getFeedbackStats error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getAbsentFeedback,
  submitAbsentFeedback,
  updateFeedbackById,
  deleteFeedback,
  getFeedbackStats,
};
