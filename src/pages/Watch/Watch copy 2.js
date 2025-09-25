import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { videoAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Watch.css';
import Comments from '../../components/Comments/Comments';

const VideoPlayer = ({ video }) => (
  <div className="video-player">
    <div className="video-wrapper">
      <video controls className="video-element" poster={video.thumbnail}>
        <source src={video.video_file} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  </div>
);

const Watch = () => {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (videoId) fetchVideo();
  }, [videoId]);

  const fetchVideo = async () => {
    try {
      setLoading(true);
      const response = await videoAPI.getVideo(videoId);
      setVideo(response.data);

      if (currentUser) {
        try {
          await videoAPI.addView(videoId);
        } catch (viewError) {
          console.warn('Could not add view:', viewError);
        }
      }
    } catch (err) {
      setError('Failed to load video');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) return alert('Please login to like videos');

    setActionLoading(true);
    try {
      await videoAPI.likeVideo(videoId);
      setVideo((prev) => {
        if (!prev) return prev;
        const wasLiked = prev.is_liked;
        const wasDisliked = prev.is_disliked;
        return {
          ...prev,
          is_liked: !wasLiked,
          is_disliked: wasDisliked && !wasLiked ? false : wasDisliked,
          total_likes: prev.total_likes + (wasLiked ? -1 : 1),
          total_dislikes:
            wasDisliked && !wasLiked ? prev.total_dislikes - 1 : prev.total_dislikes,
        };
      });
    } catch (err) {
      console.error(err);
      fetchVideo();
    } finally {
      setActionLoading(false);
    }
  };

  const handleDislike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) return alert('Please login to dislike videos');

    setActionLoading(true);
    try {
      await videoAPI.dislikeVideo(videoId);
      setVideo((prev) => {
        if (!prev) return prev;
        const wasDisliked = prev.is_disliked;
        const wasLiked = prev.is_liked;
        return {
          ...prev,
          is_disliked: !wasDisliked,
          is_liked: wasLiked && !wasDisliked ? false : wasLiked,
          total_dislikes: prev.total_dislikes + (wasDisliked ? -1 : 1),
          total_likes:
            wasLiked && !wasDisliked ? prev.total_likes - 1 : prev.total_likes,
        };
      });
    } catch (err) {
      console.error(err);
      fetchVideo();
    } finally {
      setActionLoading(false);
    }
  };

  const handleButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    alert('This feature is coming soon!');
  };

  if (loading) return <div className="loading">Loading video...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!video) return <div className="error">Video not found</div>;

  return (
    <div className="watch-page">
      <div className="video-container">
        <VideoPlayer video={video} />
      </div>

      <div className="video-info-section">
        <h1 className="video-title">{video.title}</h1>
        <div className="video-meta">
          <span>{video.views} views</span>
          <span>{new Date(video.created_at).toLocaleDateString()}</span>
        </div>

        <div className="video-actions">
          <button
            type="button"
            className={`action-btn ${video.is_liked ? 'active' : ''}`}
            onClick={handleLike}
            disabled={actionLoading || !currentUser}
          >
            👍 {video.total_likes || 0}
          </button>
          <button
            type="button"
            className={`action-btn ${video.is_disliked ? 'active' : ''}`}
            onClick={handleDislike}
            disabled={actionLoading || !currentUser}
          >
            👎 {video.total_dislikes || 0}
          </button>
          <button type="button" className="action-btn" onClick={handleButtonClick}>
            📤 Share
          </button>
          <button type="button" className="action-btn" onClick={handleButtonClick}>
            ➕ Save
          </button>
        </div>

        <div className="channel-info">
          <img
            src={`https://ui-avatars.com/api/?name=${video.uploader.username}&background=random`}
            alt={video.uploader.username}
            className="channel-avatar"
          />
          <div className="channel-details">
            <h3>{video.uploader.username}</h3>
            <p>Subscriber</p>
          </div>
          <button type="button" className="subscribe-btn" onClick={handleButtonClick}>
            Subscribe
          </button>
        </div>

        <div className="video-description">
          <p>{video.description}</p>
        </div>
      </div>

      <Comments videoId={videoId} />
    </div>
  );
};

export default Watch;
