const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

module.exports = (req, res, next) => {
  try {
    console.log('Auth middleware called');
    console.log('Headers:', req.headers);
    console.log('Cookies:', req.cookies);
    
    // Check for token in multiple places
    
    // 1. Check Authorization header (Bearer token)
    let token;
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
      console.log('Token found in Authorization header');
    } 
    // 2. Check cookies if no token in header
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
      console.log('Token found in cookies');
    }
    
    if (!token) {
      console.log('No token found in cookies or Authorization header');
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }

    console.log('Token found:', token.substring(0, 15) + '...');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Decoded token user ID:', decoded.id);
    
    // Set the user ID from the decoded token
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
}; 