const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['video', 'article', 'course']
  },
  title: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  platform: {
    type: String
  }
});

const TopicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  resources: [ResourceSchema],
  subtopics: [String],
  order: {
    type: Number,
    required: true
  },
  roadmapId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Roadmap'
  }
}, { timestamps: true });

module.exports = mongoose.model('Topic', TopicSchema); 