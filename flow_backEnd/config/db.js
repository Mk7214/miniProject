const mongoose = require('mongoose');

// Cache connection between serverless function invocations
let cachedDb = null;

const connectDB = async () => {
  if (cachedDb) {
    console.log('Using existing database connection');
    return cachedDb;
  }

  try {
    // Connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s inactivity
      family: 4 // Use IPv4, skip trying IPv6
    };

    // Get connection string from environment variables
    const mongoUri = process.env.MONGO_URI;
    
    if (!mongoUri) {
      throw new Error('MONGO_URI environment variable not set');
    }

    console.log('Establishing new database connection');
    
    // Create new connection
    const client = await mongoose.connect(mongoUri, options);
    
    cachedDb = client;
    console.log('MongoDB connected successfully');
    return cachedDb;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error; // Don't exit process in serverless environment
  }
};

module.exports = connectDB; 