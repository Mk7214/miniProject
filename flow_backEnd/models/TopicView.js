const mongoose = require('mongoose');

const TopicViewModel = new mongoose.Schema({
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  roadmap: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Roadmap'
  },
  viewedAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for faster queries
TopicViewModel.index({ topic: 1, viewedAt: -1 });

module.exports = mongoose.model('TopicView', TopicViewModel); 