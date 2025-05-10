const express = require('express');
const router = express.Router();
const {
  toggleLike,
  getLikeStatus
} = require('../controllers/likeController');

// Toggle like for a topic (requires auth)
router.post('/:roadmapId/:topicId', toggleLike);

// Get like status and count
router.get('/:roadmapId/:topicId', getLikeStatus);

module.exports = router; 