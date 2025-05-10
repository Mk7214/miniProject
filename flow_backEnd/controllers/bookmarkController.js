const Bookmark = require('../models/Bookmark');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const Topic = require('../models/Topic');
const Roadmap = require('../models/Roadmap');

// Helper function to check authentication
const checkAuth = async (req, res) => {
  try {
    // Get token from header or cookies
    const token = req.cookies.jwt || 
                 (req.headers.authorization && req.headers.authorization.startsWith('Bearer')
                  ? req.headers.authorization.split(' ')[1] : null);
    
    // Check if token exists
    if (!token) {
      return { authenticated: false, message: 'Not authorized, no token' };
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    
    // Get user from token
    const user = await User.findById(decoded.id).select('-password');
    
    // Check if user exists
    if (!user) {
      return { authenticated: false, message: 'User not found' };
    }
    
    return { 
      authenticated: true, 
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    };
  } catch (error) {
    console.error('Auth error:', error);
    return { authenticated: false, message: 'Not authorized, token failed' };
  }
};

// Toggle bookmark for a topic
exports.toggleBookmark = async (req, res) => {
  try {
    // Check authentication
    const authResult = await checkAuth(req, res);
    if (!authResult.authenticated) {
      return res.status(401).json({
        success: false,
        message: authResult.message
      });
    }
    
    const { topicId, roadmapId } = req.params;
    const userId = authResult.user.id;
    
    // Check if user already bookmarked this topic
    const existingBookmark = await Bookmark.findOne({
      user: userId,
      topic: topicId,
      roadmap: roadmapId
    });
    
    if (existingBookmark) {
      // User already bookmarked, so remove it
      await Bookmark.findByIdAndDelete(existingBookmark._id);
      
      res.status(200).json({
        success: true,
        bookmarked: false,
        message: 'Bookmark removed successfully'
      });
    } else {
      // User hasn't bookmarked, so add it
      const newBookmark = new Bookmark({
        user: userId,
        topic: topicId,
        roadmap: roadmapId
      });
      
      await newBookmark.save();
      
      res.status(201).json({
        success: true,
        bookmarked: true,
        message: 'Topic bookmarked successfully'
      });
    }
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process bookmark',
      error: error.message
    });
  }
};

// Get bookmark status for a topic
exports.getBookmarkStatus = async (req, res) => {
  try {
    // Check authentication
    const authResult = await checkAuth(req, res);
    if (!authResult.authenticated) {
      return res.status(401).json({
        success: false,
        message: authResult.message
      });
    }
    
    const { topicId, roadmapId } = req.params;
    const userId = authResult.user.id;
    
    // Check if user has bookmarked this topic
    const userBookmark = await Bookmark.findOne({
      user: userId,
      topic: topicId,
      roadmap: roadmapId
    });
    
    res.status(200).json({
      success: true,
      bookmarked: !!userBookmark
    });
  } catch (error) {
    console.error('Error getting bookmark status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get bookmark status',
      error: error.message
    });
  }
};

// Get all bookmarks for a user
exports.getUserBookmarks = async (req, res) => {
  try {
    // Check authentication first
    const authResult = await checkAuth(req, res);
    if (!authResult.authenticated) {
      return res.status(401).json({
        success: false,
        message: authResult.message
      });
    }
    
    const userId = authResult.user.id;
    
    // Get the user's bookmarks and populate roadmap and topic references
    const bookmarks = await Bookmark.find({ user: userId })
      .populate({
        path: 'roadmap',
        select: '_id title description' // Only select needed fields
      })
      .populate({
        path: 'topic',
        select: '_id title description' // Only select needed fields
      });

    res.json({
      success: true,
      bookmarks
    });
  } catch (error) {
    console.error('Error getting user bookmarks:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 