const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
    // If already connected, use the existing connection
    if (isConnected) {
        console.log('Using existing database connection');
        return;
    }

    // Connection options
    const options = {
        // useNewUrlParser: true, (no longer needed in newer mongoose versions)
        // useUnifiedTopology: true, (no longer needed in newer mongoose versions)
        serverSelectionTimeoutMS: 10000, // Timeout after 10s instead of 30s
        socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    };

    try {
        // Get MongoDB URI from environment variables, with fallback
        const dbUri = process.env.MONGODB_URI || process.env.MONGO_URI;
        
        if (!dbUri) {
            throw new Error('MongoDB connection string is missing in environment variables');
        }

        const connection = await mongoose.connect(dbUri, options);
        
        isConnected = !!connection.connections[0].readyState;
        
        console.log(`MongoDB connected successfully (${isConnected ? 'connected' : 'disconnected'})`);
        
        // Return the connection for use in serverless environments
        return connection;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        
        // In serverless environments, don't exit the process
        if (process.env.NODE_ENV !== 'production') {
            process.exit(1);
        }
        
        throw error;
    }
};

module.exports = connectDB; 