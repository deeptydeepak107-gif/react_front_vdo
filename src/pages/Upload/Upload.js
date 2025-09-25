import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { videoAPI, categoryAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Upload.css';

const Upload = () => {
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    category: '',
    videoFile: null,
    thumbnail: null
  });
  const [categories, setCategories] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [touched, setTouched] = useState({
    title: false,
    videoFile: false
  });
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Fetch categories on component mount
  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await categoryAPI.getCategories();
        
        // Handle different response structures
        let categoriesData = [];
        
        if (Array.isArray(response.data)) {
          // If response.data is already an array
          categoriesData = response.data;
        } else if (response.data.results && Array.isArray(response.data.results)) {
          // If response has pagination structure {results: [], count: number}
          categoriesData = response.data.results;
        } else if (response.data.items && Array.isArray(response.data.items)) {
          // If response has items structure
          categoriesData = response.data.items;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          // If response has data structure
          categoriesData = response.data.data;
        }
        
        setCategories(categoriesData || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUploadData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Mark field as touched
    if (name === 'title') {
      setTouched(prev => ({ ...prev, title: true }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setUploadData(prev => ({
      ...prev,
      [name]: files[0]
    }));
    
    // Mark field as touched
    if (name === 'videoFile') {
      setTouched(prev => ({ ...prev, videoFile: true }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const getFieldError = (fieldName, value) => {
    if (!touched[fieldName]) return '';
    
    switch (fieldName) {
      case 'title':
        return !value ? 'Title is required' : '';
      case 'videoFile':
        return !value ? 'Video file is required' : '';
      default:
        return '';
    }
  };

  const validateForm = () => {
    const errors = {
      title: getFieldError('title', uploadData.title),
      videoFile: getFieldError('videoFile', uploadData.videoFile)
    };

    // Check file size if video file exists
    if (uploadData.videoFile && uploadData.videoFile.size > 500 * 1024 * 1024) {
      errors.videoFile = 'Video file must be less than 500MB';
    }

    // Check file type if video file exists
    if (uploadData.videoFile) {
      const allowedVideoTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/mkv'];
      if (!allowedVideoTypes.includes(uploadData.videoFile.type)) {
        errors.videoFile = 'Please select a valid video file (MP4, AVI, MOV, MKV)';
      }
    }

    // Check thumbnail type if thumbnail exists
    if (uploadData.thumbnail) {
      const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedImageTypes.includes(uploadData.thumbnail.type)) {
        errors.thumbnail = 'Thumbnail must be a JPEG or PNG image';
      }
    }

    // Set errors and return validation result
    const hasErrors = Object.values(errors).some(error => error !== '');
    if (hasErrors) {
      setError('Please fix the errors below');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Mark all fields as touched to show errors
    setTouched({
      title: true,
      videoFile: true
    });
    
    if (!validateForm()) return;
    
    if (!currentUser) {
      setError('Please login to upload videos');
      navigate('/login');
      return;
    }

    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('title', uploadData.title);
      formData.append('description', uploadData.description);
      if (uploadData.category) {
        formData.append('category', uploadData.category);
      }
      formData.append('video_file', uploadData.videoFile);
      if (uploadData.thumbnail) {
        formData.append('thumbnail', uploadData.thumbnail);
      }

      const response = await videoAPI.createVideo(formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      });

      setSuccess('Video uploaded successfully!');
      setTimeout(() => {
        navigate(`/watch/${response.data.id}`);
      }, 2000);
      
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.response?.data?.error || 'Failed to upload video');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  const titleError = getFieldError('title', uploadData.title);
  const videoFileError = getFieldError('videoFile', uploadData.videoFile);

  return (
    <div className="upload-page">
      <div className="upload-container">
        <h1>Upload Video</h1>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit} className="upload-form">
          {/* Video File Upload */}
          <div className="form-section">
            <label className="form-label">Video File *</label>
            <div className="file-upload">
              <input
                type="file"
                name="videoFile"
                accept="video/mp4,video/avi,video/mov,video/mkv"
                onChange={handleFileChange}
                className="file-input"
                required
              />
              <div className="file-dropzone">
                {uploadData.videoFile ? (
                  <div className="file-selected">
                    <span className="file-name">{uploadData.videoFile.name}</span>
                    <span className="file-size">
                      ({(uploadData.videoFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                  </div>
                ) : (
                  <div className="file-placeholder">
                    <div className="upload-icon">📹</div>
                    <p>Click to select video or drag and drop</p>
                    <p className="file-hint">MP4, AVI, MOV, or MKV (Max 500MB)</p>
                  </div>
                )}
              </div>
            </div>
            {videoFileError && <span className="field-error">{videoFileError}</span>}
          </div>

          {/* Thumbnail Upload */}
          <div className="form-section">
            <label className="form-label">Thumbnail (Optional)</label>
            <div className="file-upload">
              <input
                type="file"
                name="thumbnail"
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleFileChange}
                className="file-input"
              />
              <div className="file-dropzone thumbnail-dropzone">
                {uploadData.thumbnail ? (
                  <div className="thumbnail-preview">
                    <img 
                      src={URL.createObjectURL(uploadData.thumbnail)} 
                      alt="Thumbnail preview" 
                    />
                    <span className="change-thumbnail">Change</span>
                  </div>
                ) : (
                  <div className="file-placeholder">
                    <div className="upload-icon">🖼️</div>
                    <p>Select thumbnail (Optional)</p>
                    <p className="file-hint">JPEG or PNG</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="form-section">
            <label className="form-label" htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={uploadData.title}
              onChange={handleInputChange}
              onBlur={() => handleBlur('title')}
              placeholder="Enter video title"
              className={`form-input ${titleError ? 'error' : ''}`}
              required
              maxLength={200}
            />
            {titleError && <span className="field-error">{titleError}</span>}
          </div>

          {/* Description */}
          <div className="form-section">
            <label className="form-label" htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={uploadData.description}
              onChange={handleInputChange}
              placeholder="Describe your video"
              className="form-textarea"
              rows="4"
              maxLength={5000}
            />
          </div>

          {/* Category */}
          <div className="form-section">
            <label className="form-label" htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={uploadData.category}
              onChange={handleInputChange}
              className="form-select"
              disabled={categoriesLoading}
            >
              <option value="">Select a category</option>
              {categoriesLoading ? (
                <option value="" disabled>Loading categories...</option>
              ) : (
                Array.isArray(categories) && categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))
              )}
            </select>
            {categoriesLoading && (
              <span className="loading-text">Loading categories...</span>
            )}
            {!categoriesLoading && (!Array.isArray(categories) || categories.length === 0) && (
              <span className="field-error">No categories available</span>
            )}
          </div>

          {/* Progress Bar */}
          {uploadProgress > 0 && (
            <div className="progress-section">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <span className="progress-text">{uploadProgress}%</span>
            </div>
          )}

          {/* Buttons */}
          <div className="form-actions">
            <button 
              type="button" 
              onClick={handleCancel}
              className="cancel-btn"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="upload-btn"
              disabled={loading}
            >
              {loading ? 'Uploading...' : 'Upload Video'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Upload;