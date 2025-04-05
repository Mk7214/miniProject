const express = require('express');
const router = express.Router();
const { updateProgress, getUserProgress } = require('../controllers/progressController');
const protect = require('../middleware/authMiddleware');

// Progress routes
router.use(protect); // Protect all progress routes
router.post('/update', updateProgress);
router.get('/', getUserProgress);

module.exports = router; 