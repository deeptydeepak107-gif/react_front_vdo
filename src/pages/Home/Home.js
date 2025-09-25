import React, { useState, useEffect } from 'react';
import VideoCard from '../../components/VideoCard/VideoCard';
import { videoAPI } from '../../services/api';
import './Home.css';

const Home = ({ onVideoSelect }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await videoAPI.getVideos({
        ordering: '-created_at',
        page_size: 20
      });
      setVideos(response.data.results || response.data);
      setError('');
    } catch (error) {
      setError('Failed to load videos');
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading videos...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="home-page">
      <div className="videos-grid">
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            onClick={onVideoSelect}
          />
        ))}
      </div>
      
      {videos.length === 0 && (
        <div className="empty-state">
          <h2>No videos found</h2>
          <p>Be the first to upload a video!</p>
        </div>
      )}
    </div>
  );
};

export default Home;