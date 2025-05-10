const User = require("../models/User");
const Roadmap = require("../models/Roadmap");

// Health check endpoint
exports.getHealthCheck = (req, res) => {
  res
    .status(200)
    .json({ success: true, message: "Progress controller is working" });
};

// Get user progress
const getUserProgress = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - User ID not found in request",
      });
    }

    User.findById(req.user.id)
      .populate({
        path: "progress.roadmap",
        select: "title description",
      })
      .populate({
        path: "progress.completedTopics.topic",
        select: "title",
      })
      .then((user) => {
        if (!user) {
          return res.status(404).json({
            success: false,
            message: "User not found",
          });
        }

        res.status(200).json({
          success: true,
          progress: user.progress || [],
        });
      })
      .catch((error) => {
        console.error("Error fetching user progress:", error);
        res.status(500).json({
          success: false,
          message: "Error fetching progress",
          error: error.message,
        });
      });
  } catch (error) {
    console.error("Error fetching user progress:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching progress",
      error: error.message,
    });
  }
};

// Update topic progress
const updateTopicProgress = async (req, res) => {
  try {
    const { roadmapId, topicId } = req.body;
    const userId = req.user.id;

    Promise.all([User.findById(userId), Roadmap.findById(roadmapId)])
      .then(([user, roadmap]) => {
        if (!user || !roadmap) {
          return res.status(404).json({
            success: false,
            message: "User or roadmap not found",
          });
        }

        // Find or create progress entry for this roadmap
        let progressEntry = user.progress.find(
          (p) => p.roadmap && p.roadmap.toString() === roadmapId,
        );

        if (!progressEntry) {
          progressEntry = {
            roadmap: roadmapId,
            completedTopics: [],
            percentageComplete: 0,
            lastAccessedAt: new Date(),
          };
          user.progress.push(progressEntry);
        }

        // Add topic to completed list if not already completed
        const topicExists = progressEntry.completedTopics.some(
          (t) => t.topic && t.topic.toString() === topicId,
        );

        if (!topicExists) {
          progressEntry.completedTopics.push({
            topic: topicId,
            completedAt: new Date(),
          });
        }

        // Update percentage complete
        const totalTopics = roadmap.topics.length;
        progressEntry.percentageComplete =
          (progressEntry.completedTopics.length / totalTopics) * 100;
        progressEntry.lastAccessedAt = new Date();

        return user.save();
      })
      .then((updatedUser) => {
        const progressEntry = updatedUser.progress.find(
          (p) => p.roadmap && p.roadmap.toString() === roadmapId,
        );

        res.status(200).json({
          success: true,
          message: "Progress updated successfully",
          progress: progressEntry,
        });
      })
      .catch((error) => {
        console.error("Error updating progress:", error);
        res.status(500).json({
          success: false,
          message: "Error updating progress",
          error: error.message,
        });
      });
  } catch (error) {
    console.error("Error updating progress:", error);
    res.status(500).json({
      success: false,
      message: "Error updating progress",
      error: error.message,
    });
  }
};

// Get recent activity
const getRecentActivity = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - User ID not found in request",
      });
    }

    User.findById(req.user.id)
      .populate({
        path: "progress.roadmap",
        select: "title",
      })
      .populate({
        path: "progress.completedTopics.topic",
        select: "title",
      })
      .then((user) => {
        if (!user) {
          return res.status(404).json({
            success: false,
            message: "User not found",
          });
        }
        // Create a flattened list of recent activities
        const recentActivity = user.progress
          .flatMap((p) =>
            (p.completedTopics || []).map((t) => ({
              topicTitle: t.topic ? t.topic.title : "Unknown Topic",
              roadmapTitle: p.roadmap ? p.roadmap.title : "Unknown Roadmap",
              completedAt: t.completedAt,
            })),
          )
          .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
          .slice(0, 5);

        res.status(200).json({
          success: true,
          recentActivity,
        });
      })
      .catch((error) => {
        console.error("Error fetching recent activity:", error);
        res.status(500).json({
          success: false,
          message: "Error fetching recent activity",
          error: error.message,
        });
      });
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching recent activity",
      error: error.message,
    });
  }
};

module.exports = {
  getRecentActivity,
  updateTopicProgress,
  getUserProgress,
};
