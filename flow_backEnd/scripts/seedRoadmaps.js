const mongoose = require('mongoose');
const Roadmap = require('../models/Roadmap');
const roadmaps = require('../models/roadmapData');
require('dotenv').config();

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        // Clear existing roadmaps
        await Roadmap.deleteMany({});
        
        // Insert new roadmaps
        await Roadmap.insertMany(roadmaps);
        
        console.log('Database seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase(); 