const express = require("express");
const router = express.Router();
const { authenticateToken, requireGreeter } = require("../middleware/auth");
const {
  getAbsentFeedback,
  submitAbsentFeedback,
  updateFeedbackById,
  deleteFeedback,
  getFeedbackStats,
} = require("../controllers/absentFeedbackController");

// Greeter routes (require greeter authentication)
router.use(authenticateToken, requireGreeter);

// Get absent feedback for a specific date
router.get("/", getAbsentFeedback);

// Get feedback statistics
router.get("/stats", getFeedbackStats);

// Create or update absent feedback
router.post("/", submitAbsentFeedback);

// Update specific feedback by ID
router.put("/:id", updateFeedbackById);

// Delete feedback (soft delete)
router.delete("/:id", deleteFeedback);

module.exports = router;
