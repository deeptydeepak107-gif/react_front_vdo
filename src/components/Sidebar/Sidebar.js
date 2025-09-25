import React from 'react';
import { 
  FiHome, FiTrendingUp, FiCompass, FiPlay, FiClock, FiThumbsUp,
  FiMusic, FiFilm, FiSlack, FiBook, FiHeart, FiBookOpen
} from 'react-icons/fi';
import './Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar, selectedCategory, onCategorySelect }) => {
  const categories = [
    { id: 'all', name: 'Home', icon: <FiHome /> },
    { id: 'trending', name: 'Trending', icon: <FiTrendingUp /> },
    { id: 'explore', name: 'Explore', icon: <FiCompass /> },
    { id: 'subscriptions', name: 'Subscriptions', icon: <FiPlay /> },
    { id: 'library', name: 'Library', icon: <FiClock /> },
    { id: 'liked', name: 'Liked videos', icon: <FiThumbsUp /> },
  ];

  const contentCategories = [
    { id: 'music', name: 'Music', icon: <FiMusic /> },
    { id: 'movies', name: 'Movies', icon: <FiFilm /> },
    { id: 'gaming', name: 'Gaming', icon: <FiSlack /> },
    { id: 'news', name: 'News', icon: <FiBook /> },
    { id: 'sports', name: 'Sports', icon: <FiHeart /> },
    { id: 'learning', name: 'Learning', icon: <FiBookOpen /> },
  ];

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-content">
          <div className="sidebar-section">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`sidebar-item ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => onCategorySelect(category.id)}
              >
                <span className="sidebar-icon">{category.icon}</span>
                <span className="sidebar-text">{category.name}</span>
              </button>
            ))}
          </div>

          <div className="sidebar-divider"></div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">Categories</h3>
            {contentCategories.map((category) => (
              <button
                key={category.id}
                className={`sidebar-item ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => onCategorySelect(category.id)}
              >
                <span className="sidebar-icon">{category.icon}</span>
                <span className="sidebar-text">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`}
        onClick={toggleSidebar}
      ></div>
    </>
  );
};

export default Sidebar;
