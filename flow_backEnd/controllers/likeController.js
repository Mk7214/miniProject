const Like = require('../models/Like');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

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

// Toggle like for a topic
exports.toggleLike = async (req, res) => {
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
    
    // Check if user already liked this topic
    const existingLike = await Like.findOne({
      user: userId,
      topic: topicId,
      roadmap: roadmapId
    });
    
    if (existingLike) {
      // User already liked, so remove the like
      await Like.findByIdAndDelete(existingLike._id);
      
      res.status(200).json({
        success: true,
        liked: false,
        message: 'Like removed successfully'
      });
    } else {
      // User hasn't liked, so add a like
      const newLike = new Like({
        user: userId,
        topic: topicId,
        roadmap: roadmapId
      });
      
      await newLike.save();
      
      res.status(201).json({
        success: true,
        liked: true,
        message: 'Topic liked successfully'
      });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process like',
      error: error.message
    });
  }
};

// Get like status and count for a topic
exports.getLikeStatus = async (req, res) => {
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
    
    // Check if user has liked this topic
    const userLike = await Like.findOne({
      user: userId,
      topic: topicId,
      roadmap: roadmapId
    });
    
    // Get total like count
    const likeCount = await Like.countDocuments({
      topic: topicId,
      roadmap: roadmapId
    });
    
    res.status(200).json({
      success: true,
      liked: !!userLike,
      likeCount
    });
  } catch (error) {
    console.error('Error getting like status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get like status',
      error: error.message
    });
  }
}; 