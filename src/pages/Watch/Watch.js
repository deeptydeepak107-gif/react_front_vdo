import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { videoAPI, subscriptionAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Comments from '../../components/Comments/Comments';
import PlaylistManager from '../../components/Playlist/PlaylistManager';
import './Watch.css';

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
  const { currentUser } = useAuth();

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showPlaylistManager, setShowPlaylistManager] = useState(false);

  const fetchVideo = useCallback(async () => {
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
      console.error(err);
      setError('Failed to load video');
    } finally {
      setLoading(false);
    }
  }, [videoId, currentUser]);

  useEffect(() => {
    if (videoId) fetchVideo();
  }, [videoId, fetchVideo]);

  const checkSubscriptionStatus = useCallback(async () => {
    if (!currentUser || !video) return;
    try {
      const response = await subscriptionAPI.checkSubscription(video.uploader.id);
      setIsSubscribed(response.data.is_subscribed);
    } catch (err) {
      console.error('Error checking subscription:', err);
      setIsSubscribed(false);
    }
  }, [currentUser, video]);

  useEffect(() => {
    if (video && currentUser) checkSubscriptionStatus();
  }, [video, currentUser, checkSubscriptionStatus]);

  // --- Like / Dislike handlers (useCallback to keep stable references) ---
  const handleLike = useCallback(
    async (e) => {
      if (e && e.preventDefault) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (!currentUser) return alert('Please login to like videos');

      setActionLoading(true);
      try {
        await videoAPI.likeVideo(videoId);
        setVideo((prev) => {
          if (!prev) return prev;
          const wasLiked = !!prev.is_liked;
          const wasDisliked = !!prev.is_disliked;

          return {
            ...prev,
            is_liked: !wasLiked,
            is_disliked: wasDisliked && !wasLiked ? false : wasDisliked,
            total_likes: (prev.total_likes || 0) + (wasLiked ? -1 : 1),
            total_dislikes:
              wasDisliked && !wasLiked ? Math.max((prev.total_dislikes || 0) - 1, 0) : (prev.total_dislikes || 0),
          };
        });
      } catch (err) {
        console.error(err);
        // fallback: re-fetch server state
        fetchVideo();
      } finally {
        setActionLoading(false);
      }
    },
    [videoId, currentUser, fetchVideo]
  );

  const handleDislike = useCallback(
    async (e) => {
      if (e && e.preventDefault) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (!currentUser) return alert('Please login to dislike videos');

      setActionLoading(true);
      try {
        await videoAPI.dislikeVideo(videoId);
        setVideo((prev) => {
          if (!prev) return prev;
          const wasDisliked = !!prev.is_disliked;
          const wasLiked = !!prev.is_liked;

          return {
            ...prev,
            is_disliked: !wasDisliked,
            is_liked: wasLiked && !wasDisliked ? false : wasLiked,
            total_dislikes: (prev.total_dislikes || 0) + (wasDisliked ? -1 : 1),
            total_likes: wasLiked && !wasDisliked ? Math.max((prev.total_likes || 0) - 1, 0) : (prev.total_likes || 0),
          };
        });
      } catch (err) {
        console.error(err);
        fetchVideo();
      } finally {
        setActionLoading(false);
      }
    },
    [videoId, currentUser, fetchVideo]
  );

  const handleSubscribe = useCallback(async () => {
    if (!currentUser) return alert('Please login to subscribe');

    setActionLoading(true);
    try {
      if (isSubscribed) {
        // optimistic local toggle if unsubscribe endpoint not available
        setIsSubscribed(false);
      } else {
        if (!video || !video.uploader) throw new Error('Uploader info missing');
        await subscriptionAPI.subscribe(video.uploader.id);
        setIsSubscribed(true);
      }
    } catch (err) {
      console.error('Subscription error:', err);
      // best-effort UX: toggle locally
      setIsSubscribed((prev) => !prev);
    } finally {
      setActionLoading(false);
    }
  }, [currentUser, isSubscribed, video]);

  const handleSaveToPlaylist = useCallback(() => {
    if (!currentUser) return alert('Please login to save videos');
    setShowPlaylistManager(true);
  }, [currentUser]);

  const handleButtonClick = useCallback((e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
      e.stopPropagation();
    }
    alert('This feature is coming soon!');
  }, []);

  if (loading) return <div className="loading">Loading video...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!video) return <div className="error">Video not found</div>;

  return (
    <div className="watch-page">
      {showPlaylistManager && (
        <PlaylistManager videoId={videoId} onClose={() => setShowPlaylistManager(false)} />
      )}

      <div className="video-container">
        <VideoPlayer video={video} />
      </div>

      <div className="video-info-section">
        <h1 className="video-title">{video.title}</h1>

        <div className="video-meta">
          <span>{video.views} views</span>
          <span>•</span>
          <span>{new Date(video.created_at).toLocaleDateString()}</span>
        </div>

        <div className="video-actions">
          <button
            type="button"
            className={`action-btn like-btn ${video.is_liked ? 'active' : ''}`}
            onClick={handleLike}
            disabled={actionLoading || !currentUser}
          >
            👍 {video.total_likes || 0}
          </button>

          <button
            type="button"
            className={`action-btn dislike-btn ${video.is_disliked ? 'active' : ''}`}
            onClick={handleDislike}
            disabled={actionLoading || !currentUser}
          >
            👎 {video.total_dislikes || 0}
          </button>

          <button
            type="button"
            className="action-btn"
            onClick={handleSaveToPlaylist}
            disabled={!currentUser}
          >
            💾 Save
          </button>

          <button type="button" className="action-btn" onClick={handleButtonClick}>
            📤 Share
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
            <p>{video.uploader.subscribers_count || 0} subscribers</p>
          </div>

          <button
            type="button"
            className={`subscribe-btn ${isSubscribed ? 'subscribed' : ''}`}
            onClick={handleSubscribe}
            disabled={actionLoading || !currentUser}
          >
            {isSubscribed ? 'Subscribed' : 'Subscribe'}
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
