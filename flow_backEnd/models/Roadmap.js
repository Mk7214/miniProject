const mongoose = require('mongoose');

const roadmapSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    topics: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic'
    }],
    category: {
        type: String
    },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner'
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

const webDevRoadmap = {
    title: "Web Development",
    description: "Complete path to become a web developer",
    topics: [
        {
            title: "HTML Fundamentals",
            description: "Learn the basics of HTML",
            resources: [
                {
                    type: "video",
                    title: "HTML Full Course",
                    url: "https://www.youtube.com/watch?v=pQN-pnXPaVg",
                    platform: "YouTube"
                },
                {
                    type: "article",
                    title: "MDN HTML Guide",
                    url: "https://developer.mozilla.org/en-US/docs/Learn/HTML",
                    platform: "MDN"
                }
            ],
            order: 1
        }
        // Add more topics
    ]
};

module.exports = mongoose.model('Roadmap', roadmapSchema); 