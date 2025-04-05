require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Configure CORS for Vercel deployment
const allowedOrigins = [
  process.env.FRONTEND_URL || 'https://flow-frontend.vercel.app', // Production frontend
  'http://localhost:5173', // Local development frontend
  'http://localhost:3000' // Alternative local development
];

app.use(cors({
    origin: function(origin, callback) {
      // Allow requests with no origin (like mobile apps, curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log('CORS blocked for:', origin);
        callback(null, true); // Temporarily allow all origins in development
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Log all requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Routes
console.log('Mounting routes...');
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/roadmaps', require('./routes/roadmapRoutes'));
app.use('/api/progress', require('./routes/progressRoutes'));
console.log('Routes mounted successfully');

// Add a health check endpoint for Vercel
app.get('/api/health', (req, res) => {
  res.status(200).send({ status: 'ok', timestamp: new Date().toISOString() });
});

// Create a catch-all route handler for the API
app.all('/api/*', (req, res) => {
  res.status(404).send({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

// Start the server in non-serverless environments
if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Auth routes available at http://localhost:${PORT}/api/auth`);
    });
    
    // Connect to the database for development
    connectDB();
} else {
    // For serverless environment (Vercel), connect on demand
    connectDB();
}

// Handle connection errors
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

module.exports = app; 