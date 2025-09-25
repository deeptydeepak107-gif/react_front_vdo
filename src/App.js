import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import Home from './pages/Home/Home';
import Watch from './pages/Watch/Watch';
import Upload from './pages/Upload/Upload';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import { logger } from './utils/logger';
import './App.css';

// API configuration for different environments
const API_CONFIG = {
  development: 'http://localhost:3001',
  production: 'https://your-api-address.com' // Replace with your actual API address
};

export const API_BASE_URL = API_CONFIG[process.env.NODE_ENV] || API_CONFIG.production;

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Production-safe logging
  React.useEffect(() => {
    logger.log('App component mounted');
  }, []);

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    logger.log(`Category selected: ${category}`);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    logger.log(`Search query: ${query}`);
  };

  const handleVideoSelect = (video) => {
    logger.log(`Video selected: ${video.id}`);
    // Use React Router navigation instead of window.location for SPA behavior
    window.location.href = `/watch/${video.id}`;
  };

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="app">
            <Header 
              onToggleSidebar={handleToggleSidebar}
              onSearch={handleSearch}
            />
            
            <div className="app-body">
              <Sidebar 
                isOpen={sidebarOpen}
                selectedCategory={selectedCategory}
                onCategorySelect={handleCategorySelect}
              />
              
              <main className="main-content">
                <Routes>
                  <Route 
                    path="/" 
                    element={
                      <ErrorBoundary>
                        <Home 
                          onVideoSelect={handleVideoSelect}
                          category={selectedCategory}
                          searchQuery={searchQuery}
                        />
                      </ErrorBoundary>
                    } 
                  />
                  <Route 
                    path="/watch/:videoId" 
                    element={
                      <ErrorBoundary>
                        <Watch />
                      </ErrorBoundary>
                    } 
                  />
                  <Route 
                    path="/upload" 
                    element={
                      <ErrorBoundary>
                        <Upload />
                      </ErrorBoundary>
                    } 
                  />
                  <Route 
                    path="/login" 
                    element={
                      <ErrorBoundary>
                        <Login />
                      </ErrorBoundary>
                    } 
                  />
                  <Route 
                    path="/register" 
                    element={
                      <ErrorBoundary>
                        <Register />
                      </ErrorBoundary>
                    } 
                  />
                </Routes>
              </main>
            </div>
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;