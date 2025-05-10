const express = require('express');
const router = express.Router();

// Mock data with proper object structure including names
const mockUserProgress = {
  progress: [
    {
      roadmap: { _id: '68177fb938cfc28970b435ce', title: 'C++ Programming Path' },
      completedTopics: [
        { 
          topic: { _id: '68177fb938cfc28970b435cf', title: 'C++ Basics' },
          completedAt: new Date().toISOString()
        }
      ],
      percentageComplete: 35,
      lastAccessedAt: new Date().toISOString()
    }
  ]
};

// Mock recent activity data with proper names
const mockRecentActivity = {
  recentActivity: [
    {
      topicId: '68177fb938cfc28970b435cf',
      topicTitle: 'C++ Basics',
      roadmapId: '68177fb938cfc28970b435ce',
      roadmapTitle: 'C++ Programming Path',
      completedAt: new Date().toISOString()
    },
    {
      topicId: '68177fb938cfc28970b435d0',
      topicTitle: 'Object-Oriented Programming',
      roadmapId: '68177fb938cfc28970b435ce',
      roadmapTitle: 'C++ Programming Path',
      completedAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
    }
  ]
};

// Simple health check (no auth)
router.get('/health', (req, res) => {
  res.json({ message: 'Progress routes are working!' });
});

// Get user progress
router.get('/user-progress', (req, res) => {
  res.json(mockUserProgress);
});

// Get recent activity
router.get('/recent-activity', (req, res) => {
  res.json(mockRecentActivity);
});

// Update topic progress
router.post('/update-progress', (req, res) => {
  res.json({
    success: true,
    message: 'Progress updated successfully'
  });
});

module.exports = router; 