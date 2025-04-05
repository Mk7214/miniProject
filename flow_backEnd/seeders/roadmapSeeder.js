const mongoose = require('mongoose');
const Roadmap = require('../models/Roadmap');
const roadmapData = require('../data/roadmapData');

require('dotenv').config();

const seedRoadmaps = async () => {
    try {
        // Connect to MongoDB Atlas
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB Atlas');

        // Clear existing roadmaps
        await Roadmap.deleteMany({});
        console.log('Cleared existing roadmaps');

        // Insert new roadmaps
        const roadmaps = await Roadmap.insertMany(roadmapData);
        console.log(`Successfully inserted ${roadmaps.length} roadmaps`);

        // Close the connection
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