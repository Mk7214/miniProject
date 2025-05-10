const Comment = require('../models/Comment');
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

// Get all comments for a topic
exports.getComments = async (req, res) => {
  try {
    const { topicId, roadmapId } = req.params;
    
    // Fetch comments for this topic
    const comments = await Comment.find({ 
      topic: topicId,
      roadmap: roadmapId,
      parentComment: null 
    })
    .populate('user', 'username email')
    .sort({ createdAt: -1 });
    
    // For each comment, fetch replies
    const commentsWithReplies = await Promise.all(comments.map(async (comment) => {
      const replies = await Comment.find({ 
        parentComment: comment._id 
      })
      .populate('user', 'username email')
      .sort({ createdAt: 1 });
      
      return {
        ...comment.toObject(),
        replies: replies
      };
    }));
    
    res.status(200).json({
      success: true,
      comments: commentsWithReplies
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comments',
      error: error.message
    });
  }
};

// Add a new comment
exports.addComment = async (req, res) => {
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
    const { text, parentCommentId } = req.body;
    const userId = authResult.user.id;
    
    // Validate input
    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required'
      });
    }
    
    // Create new comment
    const newComment = new Comment({
      user: userId,
      topic: topicId,
      roadmap: roadmapId,
      text: text.trim(),
      parentComment: parentCommentId || null
    });
    
    await newComment.save();
    
    // Populate user data for response
    const populatedComment = await Comment.findById(newComment._id)
      .populate('user', 'username email');
    
    res.status(201).json({
      success: true,
      comment: populatedComment
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: error.message
    });
  }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
  try {
    // Check authentication
    const authResult = await checkAuth(req, res);
    if (!authResult.authenticated) {
      return res.status(401).json({
        success: false,
        message: authResult.message
      });
    }
    
    const { commentId } = req.params;
    const userId = authResult.user.id;
    
    // Find the comment
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }
    
    // Check if user is authorized to delete
    if (comment.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }
    
    // Delete comment and all its replies
    await Comment.deleteMany({ 
      $or: [
        { _id: commentId },
        { parentComment: commentId }
      ]
    });
    
    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete comment',
      error: error.message
    });
  }
};

// Like a comment
exports.likeComment = async (req, res) => {
  try {
    // Check authentication
    const authResult = await checkAuth(req, res);
    if (!authResult.authenticated) {
      return res.status(401).json({
        success: false,
        message: authResult.message
      });
    }
    
    const { commentId } = req.params;
    const userId = authResult.user.id;
    
    console.log('Like comment request received:');
    console.log('Comment ID:', commentId);
    console.log('User ID:', userId);
    
    if (!commentId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Both Comment ID and User ID are required'
      });
    }
    
    // Try to find the comment
    let comment;
    try {
      comment = await Comment.findById(commentId);
    } catch (err) {
      console.error('Error finding comment:', err);
      return res.status(400).json({
        success: false,
        message: 'Invalid comment ID format'
      });
    }
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }
    
    // Check if user already liked this comment
    const alreadyLiked = comment.likes.some(id => id.toString() === userId.toString());
    console.log('Already liked:', alreadyLiked);
    
    if (alreadyLiked) {
      // Unlike the comment
      comment.likes = comment.likes.filter(id => id.toString() !== userId.toString());
      console.log('Removing like');
    } else {
      // Like the comment
      comment.likes.push(userId);
      console.log('Adding like');
    }
    
    await comment.save();
    console.log('Comment saved, likes:', comment.likes.length);
    
    res.status(200).json({
      success: true,
      liked: !alreadyLiked,
      likeCount: comment.likes.length
    });
  } catch (error) {
    console.error('Error liking comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process like',
      error: error.message
    });
  }
}; 