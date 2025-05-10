const TopicView = require('../models/TopicView');
const Topic = require('../models/Topic');
const Roadmap = require('../models/Roadmap');
const jwt = require('jsonwebtoken');

// Helper function to check authentication - same as in bookmarkController
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

// Record a topic view
exports.recordTopicView = async (req, res) => {
  try {
    const { topicId, roadmapId } = req.params;
    
    // Check authentication
    const authResult = await checkAuth(req, res);
    const userId = authResult.authenticated ? authResult.user.id : null;
    
    // Check for recent view from the same user (within last 5 minutes)
    if (userId) {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const recentView = await TopicView.findOne({
        user: userId,
        topic: topicId,
        roadmap: roadmapId,
        viewedAt: { $gte: fiveMinutesAgo }
      });

      if (recentView) {
        // Update the existing view's timestamp instead of creating a new one
        recentView.viewedAt = new Date();
        await recentView.save();
        
        return res.status(200).json({
          success: true,
          message: 'View timestamp updated'
        });
      }
    }
    
    // Create a new view record
    const topicView = new TopicView({
      topic: topicId,
      roadmap: roadmapId,
      user: userId
    });
    
    await topicView.save();
    
    res.status(201).json({
      success: true,
      message: 'Topic view recorded'
    });
  } catch (error) {
    console.error('Error recording topic view:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record topic view'
    });
  }
};

// Get most viewed topics
exports.getMostViewedTopics = async (req, res) => {
  try {
    // Get most viewed topics from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const topicViews = await TopicView.aggregate([
      { 
        $match: { 
          viewedAt: { $gte: thirtyDaysAgo } 
        } 
      },
      { 
        $group: { 
          _id: "$topic", 
          count: { $sum: 1 },
          lastViewed: { $max: "$viewedAt" },
          roadmapId: { $first: "$roadmap" }
        } 
      },
      { 
        $sort: { 
          count: -1 
        } 
      },
      { 
        $limit: 5 
      }
    ]);
    
    // Get full topic and roadmap details
    const popularTopics = await Promise.all(
      topicViews.map(async (view) => {
        const topic = await Topic.findById(view._id);
        const roadmap = await Roadmap.findById(view.roadmapId);
        
        return {
          _id: view._id,
          title: topic ? topic.title : 'Unknown Topic',
          description: topic ? topic.description : '',
          viewCount: view.count,
          lastViewed: view.lastViewed,
          roadmapId: view.roadmapId,
          roadmapTitle: roadmap ? roadmap.title : 'Unknown Roadmap'
        };
      })
    );
    
    res.json({
      success: true,
      topics: popularTopics
    });
  } catch (error) {
    console.error('Error getting popular topics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get popular topics'
    });
  }
}; 