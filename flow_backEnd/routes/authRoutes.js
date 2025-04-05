const express = require('express');
const router = express.Router();
const { signup, login, logout, getCurrentUser } = require('../controllers/authController');
const auth = require('../middleware/auth');

// Log all requests to auth routes
router.use((req, res, next) => {
  console.log(`Auth Route: ${req.method} ${req.path}`);
  console.log('Request headers:', req.headers);
  console.log('Request cookies:', req.cookies);
  next();
});

// Auth routes
console.log('Registering auth routes...');
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', auth, getCurrentUser);
console.log('Auth routes registered successfully');

module.exports = router; 