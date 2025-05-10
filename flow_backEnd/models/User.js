const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    progress: [{
        roadmap: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Roadmap'
        },
        completedTopics: [{
            topic: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Topic'
            },
            completedAt: {
                type: Date,
                default: Date.now
            }
        }],
        percentageComplete: {
            type: Number,
            default: 0
        },
        lastAccessedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

module.exports = mongoose.model('User', userSchema); 