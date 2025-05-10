const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const User = require("../models/User");
const Roadmap = require("../models/Roadmap");
const {
  getRecentActivity,
  updateTopicProgress,
  getUserProgress,
} = require("../controllers/progressController");
const auth = require("../middleware/auth.js");

// Health check route (no auth)
router.get("/health", function (req, res) {
  res
    .status(200)
    .json({ success: true, message: "Progress routes are working" });
});

// Get user progress with real data - protected with auth
router.get("/user-progress", auth, getUserProgress);

// Update topic progress - protected with auth
router.post("/update-progress", auth, updateTopicProgress);

// Get recent activity with real data - protected with auth
router.get("/recent-activity", auth, getRecentActivity);

module.exports = router;
