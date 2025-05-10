const express = require('express');
const router = express.Router();
const { getAllRoadmaps, getRoadmapById, getTopic, getPopulatedRoadmaps } = require('../controllers/roadmapController');
const protect = require('../middleware/authMiddleware');

// Populated roadmaps route (specific)
router.get('/populated', getPopulatedRoadmaps);

// Topic routes 
router.get('/:roadmapId/topics/:topicIndex', getTopic);

// Roadmap routes (generic)
router.get('/', getAllRoadmaps);
router.get('/:id', getRoadmapById);

module.exports = router; 