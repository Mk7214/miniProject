const mongoose = require('mongoose');

const roadmapSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    topics: [{
        title: String,
        description: String,
        resources: [{
            type: {
                type: String,
                enum: ['video', 'article', 'course']
            },
            title: String,
            url: String,
            platform: String
        }],
        order: Number
    }]
});

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