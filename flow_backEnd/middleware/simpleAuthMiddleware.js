const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Simplified auth middleware
const simpleProtect = async (req, res, next) => {
  try {
    // Get token from header or cookies
    const token = req.cookies.jwt || 
                 (req.headers.authorization && req.headers.authorization.startsWith('Bearer')
                  ? req.headers.authorization.split(' ')[1] : null);
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    
    // Get user from token
    const user = await User.findById(decoded.id).select('-password');
    
    // Check if user exists
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    
    // Add user to request object
    req.user = {
      id: user._id,
      username: user.username,
      email: user.email
    };
    
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

module.exports = { simpleProtect }; 