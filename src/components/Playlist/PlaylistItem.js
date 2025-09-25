// components/Playlist/PlaylistItem.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { playlistAPI } from '../../services/api';

const PlaylistItem = ({ playlist, videoId, onUpdate }) => {
  const [isInPlaylist, setIsInPlaylist] = useState(false);
  const [loading, setLoading] = useState(false);

  // Wrap the function in useCallback to prevent unnecessary re-renders
  const checkIfVideoInPlaylist = useCallback(async () => {
    try {
      const response = await playlistAPI.getPlaylistVideos(playlist.id);
      const videos = response.data.videos || response.data;
      const videoExists = videos.some(video => video.id === parseInt(videoId));
      setIsInPlaylist(videoExists);
    } catch (error) {
      console.error('Error checking playlist:', error);
    }
  }, [playlist.id, videoId]); // Add dependencies

  useEffect(() => {
    checkIfVideoInPlaylist();
  }, [checkIfVideoInPlaylist]); // Now include the function in dependencies

  const handleToggleVideo = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      if (isInPlaylist) {
        await playlistAPI.removeVideoFromPlaylist(playlist.id, videoId);
      } else {
        await playlistAPI.addVideoToPlaylist(playlist.id, videoId);
      }
      setIsInPlaylist(!isInPlaylist);
      onUpdate(); // Refresh the list
    } catch (error) {
      console.error('Error updating playlist:', error);
      alert('Failed to update playlist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="playlist-item">
      <div className="playlist-info">
        <h4>{playlist.name}</h4>
        <p className="video-count">{playlist.videos_count || playlist.videos?.length || 0} videos</p>
        {playlist.description && (
          <p className="playlist-description">{playlist.description}</p>
        )}
        <span className={`privacy-badge ${playlist.is_public ? 'public' : 'private'}`}>
          {playlist.is_public ? 'Public' : 'Private'}
        </span>
      </div>
      
      <button
        onClick={handleToggleVideo}
        disabled={loading}
        className={`toggle-btn ${isInPlaylist ? 'remove' : 'add'}`}
      >
        {loading ? '...' : isInPlaylist ? '✓ Added' : '+ Add'}
      </button>
    </div>
  );
};

export default PlaylistItem;