const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

exports.signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        console.log('Signup attempt:', { username, email });
        
        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            console.log('User already exists:', email);
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            username,
            email,
            password: hashedPassword
        });

        await user.save();
        console.log('User created successfully:', { username, email });
        
        const token = jwt.sign(
            { id: user._id },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Set token as cookie (for same-origin requests)
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        // Return token in response body (for cross-origin requests)
        res.status(201).json({
            success: true,
            message: 'User created successfully',
            token: token,
            user: {
                name: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt:', email);

        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found:', email);
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Password mismatch for user:', email);
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        console.log('Login successful for user:', email);
        
        const token = jwt.sign(
            { id: user._id },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Set token as cookie (for same-origin requests)
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        // Return token in response body (for cross-origin requests)
        res.json({
            success: true,
            message: 'Login successful',
            token: token, // Include token in response
            user: {
                name: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.logout = (req, res) => {
    res.clearCookie('token');
    res.json({ success: true, message: 'Logged out successfully' });
};

exports.getCurrentUser = async (req, res) => {
    try {
        console.log('getCurrentUser called');
        console.log('User from token:', req.user);
        
        const user = await User.findById(req.user.id).select('-password');
        console.log('Found user:', user);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        res.json({
            success: true,
            user: {
                name: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
}; 