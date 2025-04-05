const Roadmap = require('../models/Roadmap');

// @desc    Get all roadmaps
// @route   GET /api/roadmaps
// @access  Public
const getAllRoadmaps = async (req, res) => {
    try {
        console.log('Fetching all roadmaps...');
        const roadmaps = await Roadmap.find();
        console.log('Found roadmaps:', roadmaps);
        res.json(roadmaps);
    } catch (error) {
        console.error('Error fetching roadmaps:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get a specific roadmap by ID
// @route   GET /api/roadmaps/:id
// @access  Public
const getRoadmapById = async (req, res) => {
    try {
        const roadmap = await Roadmap.findById(req.params.id);
        if (!roadmap) {
            return res.status(404).json({ message: 'Roadmap not found' });
        }
        res.json(roadmap);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get a specific topic from a roadmap
// @route   GET /api/roadmaps/:roadmapId/topics/:topicIndex
// @access  Public
const getTopic = async (req, res) => {
    try {
        const { roadmapId, topicIndex } = req.params;
        console.log('Fetching topic with params:', { roadmapId, topicIndex });

        const roadmap = await Roadmap.findById(roadmapId);
        console.log('Found roadmap:', roadmap ? 'yes' : 'no');
        
        if (!roadmap) {
            console.log('Roadmap not found for ID:', roadmapId);
            return res.status(404).json({ message: 'Roadmap not found' });
        }

        console.log('Roadmap topics:', roadmap.topics.map(t => ({ order: t.order, title: t.title })));
        console.log('Looking for topic with order:', parseInt(topicIndex) + 1);

        // Find topic by order property
        const topic = roadmap.topics.find(t => t.order === parseInt(topicIndex) + 1);
        console.log('Found topic:', topic ? 'yes' : 'no');

        if (!topic) {
            console.log('Topic not found with order:', parseInt(topicIndex) + 1);
            return res.status(404).json({ message: 'Topic not found' });
        }

        console.log('Returning topic:', topic);
        res.json(topic);
    } catch (error) {
        console.error('Error in getTopic:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getUserProgress = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('progress.roadmap')
            .select('progress');
        res.json(user.progress);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllRoadmaps,
    getRoadmapById,
    getTopic
}; 