const mongoose = require('mongoose');
require('dotenv').config();
const Bookmark = require('../models/Bookmark');
const Topic = require('../models/Topic');
const Roadmap = require('../models/Roadmap');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected...');
  } catch (err) {
    console.error('Database connection error:', err.message);
    process.exit(1);
  }
}

async function fixBookmarks() {
  await connectDB();
  
  console.log('Checking bookmarks...');
  
  // Get all bookmarks
  const bookmarks = await Bookmark.find();
  console.log(`Found ${bookmarks.length} bookmarks`);
  
  let invalidBookmarks = 0;
  
  // Check each bookmark
  for (const bookmark of bookmarks) {
    const topicExists = await Topic.exists({ _id: bookmark.topic });
    const roadmapExists = await Roadmap.exists({ _id: bookmark.roadmap });
    
    if (!topicExists || !roadmapExists) {
      console.log(`Invalid bookmark found: ${bookmark._id}`);
      console.log(`Topic exists: ${topicExists}, Roadmap exists: ${roadmapExists}`);
      invalidBookmarks++;
      
      // Option 1: Delete invalid bookmarks
      // await Bookmark.findByIdAndDelete(bookmark._id);
      // console.log(`Deleted invalid bookmark: ${bookmark._id}`);
      
      // Option 2: Create placeholder Topic/Roadmap for invalid references
      if (!topicExists) {
        const newTopic = new Topic({
          _id: bookmark.topic,
          title: `Placeholder Topic ${bookmark.topic.toString().slice(-5)}`,
          description: 'This topic was created to fix invalid references'
        });
        await newTopic.save();
        console.log(`Created placeholder Topic: ${newTopic._id}`);
      }
      
      if (!roadmapExists) {
        const newRoadmap = new Roadmap({
          _id: bookmark.roadmap,
          title: `Placeholder Roadmap ${bookmark.roadmap.toString().slice(-5)}`,
          description: 'This roadmap was created to fix invalid references'
        });
        await newRoadmap.save();
        console.log(`Created placeholder Roadmap: ${newRoadmap._id}`);
      }
    }
  }
  
  console.log(`Found ${invalidBookmarks} invalid bookmarks out of ${bookmarks.length}`);
  console.log('Bookmark verification completed');
  
  mongoose.disconnect();
}

fixBookmarks().catch(err => {
  console.error('Error:', err);
  mongoose.disconnect();
}); 