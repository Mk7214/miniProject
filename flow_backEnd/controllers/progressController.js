const Progress = require('../models/Progress');
const User = require('../models/User');

exports.updateProgress = async (req, res) => {
    try {
        const { roadmapId, topicId, completed } = req.body;
        const userId = req.user.id;

        let progress = await Progress.findOne({ 
            user: userId, 
            roadmap: roadmapId 
        });

        if (!progress) {
            progress = await Progress.create({
                user: userId,
                roadmap: roadmapId,
                completedTopics: completed ? [topicId] : [],
                percentageComplete: 0
            });
        } else {
            if (completed) {
                progress.completedTopics.addToSet(topicId);
            } else {
                progress.completedTopics = progress.completedTopics
                    .filter(topic => topic.toString() !== topicId);
            }
            await progress.save();
        }

        res.json({ 
            success: true, 
            progress 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getUserProgress = async (req, res) => {
    try {
        const progress = await Progress.find({ user: req.user.id })
            .populate('roadmap')
            .populate('completedTopics');
        
        res.json(progress);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 