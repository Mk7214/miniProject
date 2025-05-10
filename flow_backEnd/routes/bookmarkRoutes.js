const express = require('express');
const router = express.Router();
const {
  toggleBookmark,
  getBookmarkStatus,
  getUserBookmarks
} = require('../controllers/bookmarkController');
const Bookmark = require('../models/Bookmark');

// Toggle bookmark for a topic (requires auth)
router.post('/:roadmapId/:topicId', toggleBookmark);

// Get bookmark status
router.get('/:roadmapId/:topicId', getBookmarkStatus);

// Get all bookmarks for the current user
router.get('/', getUserBookmarks);

// Add this route for debugging
router.get('/debug', async (req, res) => {
  try {
    const allBookmarks = await Bookmark.find();
    res.json({ 
      count: allBookmarks.length,
      bookmarks: allBookmarks 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 