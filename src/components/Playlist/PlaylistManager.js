// components/Playlist/PlaylistManager.jsx - FIXED
import React, { useState, useEffect } from 'react';
import { playlistAPI } from '../../services/api';
import PlaylistModal from './PlaylistModal';
import PlaylistItem from './PlaylistItem';

const PlaylistManager = ({ videoId, onClose }) => {
  const [playlists, setPlaylists] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const response = await playlistAPI.getPlaylists();
      
      // Handle different response formats
      let playlistsData = [];
      
      if (Array.isArray(response.data)) {
        playlistsData = response.data;
      } else if (response.data.results && Array.isArray(response.data.results)) {
        playlistsData = response.data.results;
      } else if (response.data.playlists && Array.isArray(response.data.playlists)) {
        playlistsData = response.data.playlists;
      } else {
        console.warn('Unexpected playlists response format:', response.data);
        playlistsData = [];
      }
      
      setPlaylists(playlistsData);
    } catch (error) {
      console.error('Error fetching playlists:', error);
      setError('Failed to load playlists');
      setPlaylists([]); // Ensure it's always an array
    } finally {
      setLoading(false);
    }
  };

  const handlePlaylistCreated = (newPlaylist) => {
    setPlaylists(prev => [newPlaylist, ...prev]);
  };

  if (loading) {
    return (
      <div className="playlist-manager">
        <div className="loading">Loading playlists...</div>
      </div>
    );
  }

  return (
    <div className="playlist-manager">
      <div className="playlist-header">
        <h3>Save to Playlist</h3>
        <button onClick={onClose} className="close-btn">×</button>
      </div>

      <div className="playlist-actions">
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          + Create New Playlist
        </button>
      </div>

      <div className="playlists-list">
        {/* SAFE ARRAY CHECK */}
        {Array.isArray(playlists) && playlists.map(playlist => (
          <PlaylistItem
            key={playlist.id}
            playlist={playlist}
            videoId={videoId}
            onUpdate={fetchPlaylists}
          />
        ))}
        
        {(!Array.isArray(playlists) || playlists.length === 0) && (
          <div className="empty-playlists">
            <p>No playlists yet. Create your first playlist!</p>
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {showCreateModal && (
        <PlaylistModal
          onClose={() => setShowCreateModal(false)}
          onPlaylistCreated={handlePlaylistCreated}
          videoId={videoId}
        />
      )}
    </div>
  );
};

export default PlaylistManager;