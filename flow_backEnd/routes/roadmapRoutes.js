const express = require('express');
const router = express.Router();
const { getAllRoadmaps, getRoadmapById, getTopic } = require('../controllers/roadmapController');
const protect = require('../middleware/authMiddleware');

// Topic routes (more specific)
router.get('/:roadmapId/topics/:topicIndex', getTopic);

// Roadmap routes (more generic)
router.get('/', getAllRoadmaps);
router.get('/:id', getRoadmapById);

module.exports = router; 