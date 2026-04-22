const Student = require("../models/Student");
const StudentAssignment = require("../models/StudentAssignment");
const WaitingTime = require("../models/WaitingTime");

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

// GET /api/school/students-status - Get students with status for a specific school
const getSchoolStudentsStatus = async (req, res) => {
  try {
    const schoolUsername = req.user.username;
    const page = parseInt(req.query.page || "1", 10);
    const rawLimit = req.query.limit;
    const noLimit = rawLimit === "all";
    const limit = noLimit ? null : parseInt(rawLimit || "10", 10);
    const date = req.query.date;
    const search = req.query.search || "";

    // Build query for students from this school
    const query = {
      school: schoolUsername,
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
      ];
    }

    let students = [];
    let total = 0;
    if (noLimit) {
      students = await Student.find(query).sort({ arrivalTime: 1 });
      total = students.length;
    } else {
      const skip = (page - 1) * limit;
      const [studentsResult, totalCount] = await Promise.all([
        Student.find(query).sort({ arrivalTime: 1 }).skip(skip).limit(limit),
        Student.countDocuments(query),
      ]);
      students = studentsResult;
      total = totalCount;
    }

    // Get student IDs to fetch their status
    const studentIds = students.map((student) => student._id);

    // Get assignments for these students
    const assignments = await StudentAssignment.find({
      studentId: { $in: studentIds },
      isActive: true,
    }).select("studentId pickupStatus deliveryStatus pickupTime deliveryTime");

    // Get waiting times for these students
    const waitingTimes = await WaitingTime.find({
      studentId: { $in: studentIds },
      isActive: true,
    }).select("studentId pickupTime status");

    // Create maps for quick lookup
    const assignmentMap = new Map();
    assignments.forEach((assignment) => {
      assignmentMap.set(assignment.studentId.toString(), assignment);
    });

    const waitingTimeMap = new Map();
    waitingTimes.forEach((wt) => {
      waitingTimeMap.set(wt.studentId.toString(), wt);
    });

    // Combine student data with status information
    const studentsWithStatus = students.map((student) => {
      const studentId = student._id.toString();
      const assignment = assignmentMap.get(studentId);
      const waitingTime = waitingTimeMap.get(studentId);

      // Determine overall status
      let status = "Waiting";
      let statusDetails = {
        waiting: true,
        inCar: false,
        delivered: false,
      };

      if (waitingTime?.pickupTime) {
        status = "In Car";
        statusDetails = {
          waiting: false,
          inCar: true,
          delivered: false,
        };
      }

      if (assignment?.deliveryStatus === "Completed") {
        status = "Delivered";
        statusDetails = {
          waiting: false,
          inCar: false,
          delivered: true,
        };
      }

      // Determine pickup time from WaitingTime first, then fallback to Assignment
      const rawPickupTime =
        waitingTime?.pickupTime || assignment?.pickupTime || null;

      // Format times
      let pickupTimeFormatted = null;
      if (rawPickupTime) {
        try {
          const pickupTime = new Date(rawPickupTime);
          if (!isNaN(pickupTime.getTime())) {
            pickupTimeFormatted = pickupTime.toLocaleTimeString("en-CA", {
              hour12: true,
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              timeZone: "America/Vancouver",
            });
          }
        } catch (error) {
          console.error("Error formatting pickup time:", error);
        }
      }

      let deliveryTimeFormatted = null;
      if (assignment?.deliveryTime) {
        try {
          const deliveryTime = new Date(assignment.deliveryTime);
          deliveryTimeFormatted = deliveryTime.toLocaleTimeString("en-CA", {
            hour12: true,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            timeZone: "America/Vancouver",
          });
        } catch (error) {
          console.error("Error formatting delivery time:", error);
        }
      }

      return {
        ...student.toObject(),
        status,
        statusDetails,
        pickupTime: rawPickupTime,
        pickupTimeFormatted,
        deliveryTime: assignment?.deliveryTime || null,
        deliveryTimeFormatted,
        pickupStatus: assignment?.pickupStatus || "Pending",
        deliveryStatus: assignment?.deliveryStatus || "Pending",
      };
    });

    // Calculate status counts
    const statusCounts = {
      waiting: studentsWithStatus.filter((s) => s.statusDetails.waiting).length,
      inCar: studentsWithStatus.filter((s) => s.statusDetails.inCar).length,
      delivered: studentsWithStatus.filter((s) => s.statusDetails.delivered)
        .length,
    };

    return res.json({
      success: true,
      data: {
        students: studentsWithStatus,
        statusCounts,
        pagination: noLimit
          ? {
              currentPage: 1,
              totalPages: 1,
              totalStudents: total,
              limit: total,
            }
          : {
              currentPage: page,
              totalPages: Math.ceil(total / (limit || 1)),
              totalStudents: total,
              limit,
            },
      },
    });
  } catch (err) {
    console.error("getSchoolStudentsStatus error", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// GET /api/school/status-stats - Get status statistics for a school
const getSchoolStatusStats = async (req, res) => {
  try {
    const schoolUsername = req.user.username;
    const date = req.query.date;

    // Build query for students from this school
    const query = {
      school: schoolUsername,
      isActive: true,
    };

    if (date) {
      query.date = normalizeDateQuery(date);
    }

    // Get all students for this school
    const students = await Student.find(query).select("_id");
    const studentIds = students.map((student) => student._id);

    // Get assignments and waiting times
    const [assignments, waitingTimes] = await Promise.all([
      StudentAssignment.find({
        studentId: { $in: studentIds },
        isActive: true,
      }).select("studentId pickupStatus deliveryStatus"),
      WaitingTime.find({
        studentId: { $in: studentIds },
        isActive: true,
      }).select("studentId pickupTime"),
    ]);

    // Create maps for quick lookup
    const assignmentMap = new Map();
    assignments.forEach((assignment) => {
      assignmentMap.set(assignment.studentId.toString(), assignment);
    });

    const waitingTimeMap = new Map();
    waitingTimes.forEach((wt) => {
      waitingTimeMap.set(wt.studentId.toString(), wt);
    });

    // Calculate statistics
    let waiting = 0;
    let inCar = 0;
    let delivered = 0;

    students.forEach((student) => {
      const studentId = student._id.toString();
      const assignment = assignmentMap.get(studentId);
      const waitingTime = waitingTimeMap.get(studentId);

      if (assignment?.deliveryStatus === "Completed") {
        delivered++;
      } else if (waitingTime?.pickupTime) {
        inCar++;
      } else {
        waiting++;
      }
    });

    const total = students.length;

    return res.json({
      success: true,
      data: {
        total,
        waiting,
        inCar,
        delivered,
        percentageWaiting: total > 0 ? Math.round((waiting / total) * 100) : 0,
        percentageInCar: total > 0 ? Math.round((inCar / total) * 100) : 0,
        percentageDelivered:
          total > 0 ? Math.round((delivered / total) * 100) : 0,
      },
    });
  } catch (err) {
    console.error("getSchoolStatusStats error", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getSchoolStudentsStatus,
  getSchoolStatusStats,
};
