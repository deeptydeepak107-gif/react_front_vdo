// components/Playlist/PlaylistModal.jsx
import React, { useState } from 'react';
import { playlistAPI } from '../../services/api';

const PlaylistModal = ({ onClose, onPlaylistCreated, videoId }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const response = await playlistAPI.createPlaylist({
        name: name.trim(),
        description: description.trim(),
        is_public: isPublic
      });
      
      if (videoId) {
        // Add the current video to the new playlist
        await playlistAPI.addVideoToPlaylist(response.data.id, videoId);
      }
      
      onPlaylistCreated(response.data);
      onClose();
    } catch (error) {
      console.error('Error creating playlist:', error);
      alert('Failed to create playlist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Create New Playlist</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Playlist Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={200}
            />
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              maxLength={500}
              placeholder="Optional description for your playlist"
            />
          </div>
          
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              Public Playlist
            </label>
            <small>Anyone can view this playlist</small>
          </div>
          
          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" disabled={loading || !name.trim()}>
              {loading ? 'Creating...' : 'Create Playlist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlaylistModal;