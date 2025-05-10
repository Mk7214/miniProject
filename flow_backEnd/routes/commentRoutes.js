const express = require('express');
const router = express.Router();
const {
  getComments,
  addComment,
  deleteComment,
  likeComment
} = require('../controllers/commentController');

// Define the like route first to avoid route conflicts
router.post('/like/:commentId', likeComment);

// Get comments for a topic
router.get('/:roadmapId/:topicId', getComments);

// Add a comment (requires auth)
router.post('/:roadmapId/:topicId', addComment);

// Delete a comment (requires auth)
router.delete('/:commentId', deleteComment);

module.exports = router; 