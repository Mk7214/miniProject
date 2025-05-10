import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import ProtectedRoute from './components/ProtectedRoute';
import { authService } from './services/authService';
import { Toaster } from './components/ui/toaster';
import { ThemeProvider } from './components/ui/theme-provider';
import { Bookmarks } from "@/components/Bookmarks";

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <Router>
        <Routes>
          {/* Public routes */}
          <Route 
            path="/login" 
            element={
              authService.isAuthenticated() ? 
                <Navigate to="/home" replace /> : 
                <Login />
            } 
          />
          <Route 
            path="/signup" 
            element={
              authService.isAuthenticated() ? 
                <Navigate to="/home" replace /> : 
                <Signup />
            } 
          />

          {/* Protected routes */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          {/* Topic routes - render Home component to keep Navigation */}
          <Route
            path="/roadmap/:roadmapId/topic/:topicIndex"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          {/* Bookmarks route */}
          <Route
            path="/bookmarks"
            element={
              <ProtectedRoute>
                <Home bookmarksView={true} />
              </ProtectedRoute>
            }
          />

          {/* Redirect root to home if authenticated, otherwise to login */}
          <Route
            path="/"
            element={
              authService.isAuthenticated() ? 
                <Navigate to="/home" replace /> : 
                <Navigate to="/login" replace />
            }
          />
        </Routes>
        <Toaster />
      </Router>
    </ThemeProvider>
  );
}

export default App;

