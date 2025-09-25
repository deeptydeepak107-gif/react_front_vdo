// services/api.js - UPDATED WITH ERROR HANDLING
import axios from 'axios';

const API_BASE_URL = 'http://16.170.238.177/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  register: (userData) => api.post('/auth/register/', userData),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// Video API calls
export const videoAPI = {
  getVideos: (params) => api.get('/videos/', { params }),
  getVideo: (id) => api.get(`/videos/${id}/`),
  createVideo: (formData, config) => api.post('/videos/', formData, config),
  likeVideo: (id) => api.post(`/videos/${id}/like/`),
  dislikeVideo: (id) => api.post(`/videos/${id}/dislike/`),
  addView: (id) => api.post(`/videos/${id}/add_view/`),
};

// Category API calls
export const categoryAPI = {
  getCategories: () => api.get('/categories/'),
};

// Comment API calls
export const commentAPI = {
  getComments: (videoId) => api.get(`/videos/${videoId}/comments/`),
  createComment: (videoId, data) => api.post(`/videos/${videoId}/comments/`, data),
};

// SIMPLIFIED Playlist API calls - Using existing endpoints
export const playlistAPI = {
  getPlaylists: () => api.get('/playlists/'),
  createPlaylist: (data) => api.post('/playlists/', data),
  addToPlaylist: (playlistId, videoId) => 
    api.post(`/playlists/${playlistId}/add_video/`, { video_id: videoId }),
  
  // Fallback methods if specific endpoints don't exist
  getPlaylistVideos: async (playlistId) => {
    try {
      // First try the specific endpoint
      return await api.get(`/playlists/${playlistId}/videos/`);
    } catch (error) {
      // Fallback: get all playlists and filter
      const response = await api.get('/playlists/');
      const playlists = Array.isArray(response.data) ? response.data : response.data.results || [];
      const playlist = playlists.find(p => p.id === parseInt(playlistId));
      return { data: playlist?.videos || [] };
    }
  },
};

// SIMPLIFIED Subscription API calls
export const subscriptionAPI = {
  getSubscriptions: () => api.get('/subscriptions/'),
  subscribe: (channelId) => api.post('/subscriptions/subscribe/', { channel_id: channelId }),
  
  // Fallback subscription check
  checkSubscription: async (channelId) => {
    try {
      return await api.get(`/subscriptions/check/${channelId}/`);
    } catch (error) {
      // Fallback: get all subscriptions and check locally
      try {
        const response = await api.get('/subscriptions/');
        const subscriptions = Array.isArray(response.data) ? response.data : response.data.results || [];
        const isSubscribed = subscriptions.some(sub => sub.channel?.id === parseInt(channelId));
        return { data: { is_subscribed: isSubscribed } };
      } catch (subError) {
        // If subscriptions endpoint also fails, return false
        return { data: { is_subscribed: false } };
      }
    }
  },
};

export default api;