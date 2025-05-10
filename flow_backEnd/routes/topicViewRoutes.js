const express = require('express');
const router = express.Router();
const { recordTopicView, getMostViewedTopics } = require('../controllers/topicViewController');

// Record a topic view
router.post('/:roadmapId/:topicId', recordTopicView);

// Get most viewed topics
router.get('/popular', getMostViewedTopics);

module.exports = router; 