const Roadmap = require("../models/Roadmap");
const mongoose = require("mongoose");

// @desc    Get all roadmaps
// @route   GET /api/roadmaps
// @access  Public
const getAllRoadmaps = async (req, res) => {
  try {
    const roadmaps = await Roadmap.find().populate("topics");

    // Make sure there's at least an empty array
    const safeRoadmaps = roadmaps.map((roadmap) => ({
      ...roadmap.toObject(),
      topics: roadmap.topics || [],
    }));

    res.json(safeRoadmaps);
  } catch (error) {
    console.error("Error fetching roadmaps:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get a specific roadmap by ID
// @route   GET /api/roadmaps/:id
// @access  Public
const getRoadmapById = async (req, res) => {
  try {
    const roadmap = await Roadmap.findById(req.params.id);
    if (!roadmap) {
      return res.status(404).json({ message: "Roadmap not found" });
    }
    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a specific topic from a roadmap
// @route   GET /api/roadmaps/:roadmapId/topics/:topicIndex
// @access  Public
const getTopic = async (req, res) => {
  try {
    const { roadmapId, topicIndex } = req.params;

    // Find the roadmap and populate the topics
    const roadmap = await Roadmap.findById(roadmapId).populate("topics");

    if (!roadmap) {
      return res.status(404).json({ message: "Roadmap not found" });
    }

    // Get the topic by index or _id
    let topic;
    if (mongoose.Types.ObjectId.isValid(topicIndex)) {
      // If topicIndex is a valid ObjectId, find by ID
      topic = roadmap.topics.find((t) => t._id.toString() === topicIndex);
    } else {
      // Otherwise find by order (for backward compatibility)
      const index = parseInt(topicIndex);
      topic = roadmap.topics.find((t) => t.order === index + 1);
    }

    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    res.json(topic);
  } catch (error) {
    console.error("Error in getTopic:", error);
    res.status(500).json({ message: error.message });
  }
};

const getUserProgress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("progress.roadmap")
      .select("progress");
    res.json(user.progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPopulatedRoadmaps = async (req, res) => {
  try {
    // Find all roadmaps and populate the topics field
    const roadmaps = await Roadmap.find().populate("topics");
    console.log(roadmaps);
    if (!roadmaps) {
      return res.status(404).json({ message: "No roadmaps found" });
    }

    res.json(roadmaps);
  } catch (error) {
    console.error("Error getting populated roadmaps:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllRoadmaps,
  getRoadmapById,
  getTopic,
  getPopulatedRoadmaps,
  getUserProgress,
};

