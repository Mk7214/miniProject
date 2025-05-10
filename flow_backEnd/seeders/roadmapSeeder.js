const mongoose = require('mongoose');
const Roadmap = require('../models/Roadmap');
const Topic = require('../models/Topic');
const roadmapData = require('../data/roadmapData');

require('dotenv').config();

const seedRoadmaps = async () => {
    try {
        // Connect to MongoDB Atlas
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB Atlas');

        // Clear existing data
        await Roadmap.deleteMany({});
        await Topic.deleteMany({});
        console.log('Cleared existing roadmaps and topics');

        // Process each roadmap
        for (const roadmapItem of roadmapData) {
            // Create topic documents first
            const topicPromises = roadmapItem.topics.map(async (topicData) => {
                const topic = new Topic({
                    title: topicData.title,
                    description: topicData.description,
                    resources: topicData.resources,
                    subtopics: topicData.subtopics,
                    order: topicData.order
                });
                
                await topic.save();
                return topic._id;
            });
            
            const topicIds = await Promise.all(topicPromises);
            
            // Create the roadmap with topic references
            const roadmap = new Roadmap({
                title: roadmapItem.title,
                description: roadmapItem.description,
                topics: topicIds
            });
            
            await roadmap.save();
        }

        console.log('Database seeded successfully');
        await mongoose.connection.close();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

// Run the seeder if this file is executed directly
if (require.main === module) {
    seedRoadmaps();
}

module.exports = seedRoadmaps; 