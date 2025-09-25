import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiMenu, FiSearch, FiVideo, FiBell, FiUser, FiUpload } from 'react-icons/fi'; // Add FiUpload
import './Header.css';

const Header = ({ onToggleSidebar, onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleUploadClick = () => {
    navigate('/upload');
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-btn" onClick={onToggleSidebar}>
          <FiMenu />
        </button>
        <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <span className="logo-icon">🎬</span>
          <span className="logo-text">VideoGallery</span>
        </div>
      </div>

      <div className="header-center">
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-btn">
            <FiSearch />
          </button>
        </form>
      </div>

      <div className="header-right">
        {currentUser ? (
          <>
            <button className="icon-btn" onClick={handleUploadClick} title="Upload video">
              <FiUpload />
            </button>
            <button className="icon-btn">
              <FiBell />
            </button>
            <div 
              className="user-menu" 
              onMouseEnter={() => setShowUserMenu(true)}
              onMouseLeave={() => setShowUserMenu(false)}
            >
              <img
                src={`https://ui-avatars.com/api/?name=${currentUser.username}&background=random`}
                alt={currentUser.username}
                className="user-avatar"
              />
              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="user-info">
                    <strong>{currentUser.username}</strong>
                    <span>{currentUser.email}</span>
                  </div>
                  <button onClick={handleLogout} className="logout-btn">
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <button className="login-btn" onClick={handleLoginClick}>
            <FiUser /> Sign In
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;