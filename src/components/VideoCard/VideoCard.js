import React from 'react';
import { FiEye, FiThumbsUp, FiClock } from 'react-icons/fi';
import './VideoCard.css';

const VideoCard = ({ video, onClick }) => {
  const formatViews = (views) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M views`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K views`;
    }
    return `${views} views`;
  };

  const formatDuration = (duration) => {
    if (!duration) return '';
    const seconds = Math.floor(duration % 60);
    const minutes = Math.floor((duration / 60) % 60);
    const hours = Math.floor(duration / 3600);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <div className="video-card" onClick={() => onClick(video)}>
      <div className="video-thumbnail">
        <img 
          src={video.thumbnail || '/placeholder-thumbnail.jpg'} 
          alt={video.title}
          className="thumbnail-image"
        />
        {video.duration && (
          <span className="video-duration">{formatDuration(video.duration)}</span>
        )}
      </div>
      
      <div className="video-info">
        <div className="channel-avatar">
          <img 
            src={`https://ui-avatars.com/api/?name=${video.uploader.username}&background=random`}
            alt={video.uploader.username}
          />
        </div>
        
        <div className="video-details">
          <h3 className="video-title">{video.title}</h3>
          <p className="channel-name">{video.uploader.username}</p>
          <div className="video-stats">
            <span className="stat">
              <FiEye /> {formatViews(video.views)}
            </span>
            <span className="stat">
              <FiClock /> {formatDate(video.created_at)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;