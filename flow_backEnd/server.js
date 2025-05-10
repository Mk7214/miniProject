try {
  require("dotenv").config();
} catch (err) {
  // Keep only this important error
  console.error("Error loading dotenv, using process.env without it");
}

const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDB = require("./config/db");
// const progressRoutes = require('./routes/progressRoutesNew');

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Configure CORS for Vercel deployment
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean); // Remove any undefined values

app.use(
  cors({
    origin: function(origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);

// Log all requests
app.use((req, res, next) => {
  next();
});

// Add this just after your middleware setup but before routes
// app.get('/api/progress/user-progress', (req, res) => {...});
// app.post('/api/progress/update-progress', (req, res) => {...});
// app.get('/api/progress/recent-activity', (req, res) => {...});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/roadmaps", require("./routes/roadmapRoutes"));
// app.use('/api/progress', progressRoutes);
app.use("/api/progress", require("./routes/progressRoute"));
app.use("/api/comments", require("./routes/commentRoutes"));
app.use("/api/likes", require("./routes/likeRoutes"));
app.use("/api/bookmarks", require("./routes/bookmarkRoutes"));
app.use("/api/topic-views", require("./routes/topicViewRoutes"));

// Add a health check endpoint for Vercel
app.get("/api/health", (req, res) => {
  res.status(200).send({ status: "ok", timestamp: new Date().toISOString() });
});

// Create a catch-all route handler for the API
app.all("/api/*", (req, res) => {
  res.status(404).send({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;

// Start the server in non-serverless environments
if (process.env.NODE_ENV !== "test" && process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    // Keep these informative logs
    console.log(`Server running on port ${PORT}`);
  });

  // Connect to the database for development
  connectDB();
} else {
  // For serverless environment (Vercel), connect on demand
  connectDB();
}

// Handle connection errors (keep this important error handler)
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

// Add these imports near the top
require("./models/Topic");
require("./models/Roadmap");
require("./models/Bookmark");
require("./models/User");

module.exports = app;

