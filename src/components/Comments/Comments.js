import React, { useState, useEffect } from 'react';
import { commentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Comments.css';

const Comments = ({ videoId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const { currentUser } = useAuth();

  useEffect(() => {
    if (videoId) {
      fetchComments();
    }
  }, [videoId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await commentAPI.getComments(videoId);
      
      // Handle different response structures
      let commentsData = [];
      
      if (Array.isArray(response.data)) {
        // If response.data is already an array
        commentsData = response.data;
      } else if (response.data.results && Array.isArray(response.data.results)) {
        // If response has pagination structure {results: [], count: number}
        commentsData = response.data.results;
      } else if (response.data.items && Array.isArray(response.data.items)) {
        // If response has items structure
        commentsData = response.data.items;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        // If response has data structure
        commentsData = response.data.data;
      }
      
      console.log('Comments data:', commentsData); // For debugging
      setComments(commentsData || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setError('Failed to load comments');
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
  e.preventDefault();
  if (!newComment.trim() || !currentUser) return;

  setSending(true);
  setError('');

  try {
    // Only send content and parent, NOT video
    const payload = {
      content: newComment.trim(),
      parent: null
    };

    console.log('Posting comment payload:', payload);
    const response = await commentAPI.createComment(videoId, payload);

    setComments(prev => [response.data, ...prev]);
    setNewComment('');
  } catch (error) {
    console.error('Error posting comment:', error);
    setError('Failed to post comment');
  } finally {
    setSending(false);
  }
};
  const handleSubmitReply = async (parentComment) => {
    if (!replyContent.trim() || !currentUser) return;

    setSending(true);
    setError('');

    try {
      const response = await commentAPI.createComment(videoId, {
        content: replyContent.trim(),
        parent: parentComment.id
      });

      // Update the parent comment with the new reply
      setComments(prev => prev.map(comment => 
        comment.id === parentComment.id
          ? { 
              ...comment, 
              replies: Array.isArray(comment.replies) 
                ? [...comment.replies, response.data] 
                : [response.data] 
            }
          : comment
      ));

      setReplyContent('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Error posting reply:', error);
      setError('Failed to post reply');
    } finally {
      setSending(false);
    }
  };

  const handleCancelReply = () => {
    setReplyContent('');
    setReplyingTo(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  // Safe check for comments array
  const commentsArray = Array.isArray(comments) ? comments : [];
  const commentsCount = commentsArray.length;

  if (loading) {
    return (
      <div className="comments-section">
        <h3 className="comments-title">Comments</h3>
        <div className="comments-loading">Loading comments...</div>
      </div>
    );
  }

  return (
    <div className="comments-section">
      <h3 className="comments-title">
        Comments {commentsCount > 0 && <span className="comments-count">({commentsCount})</span>}
      </h3>

      {/* Comment Input */}
      {currentUser ? (
        <form onSubmit={handleSubmitComment} className="comment-form">
          <div className="comment-input-container">
            <img
              src={`https://ui-avatars.com/api/?name=${currentUser.username}&background=random`}
              alt={currentUser.username}
              className="comment-user-avatar"
            />
            <div className="comment-input-wrapper">
              <input
                type="text"
                placeholder="Add a public comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="comment-input"
                maxLength={1000}
              />
              <div className="comment-actions">
                <button
                  type="button"
                  onClick={() => setNewComment('')}
                  className="comment-cancel-btn"
                  disabled={!newComment}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="comment-submit-btn"
                  disabled={!newComment.trim() || sending}
                >
                  {sending ? 'Commenting...' : 'Comment'}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="comments-login-prompt">
          <p>Please <a href="/login">login</a> to leave a comment.</p>
        </div>
      )}

      {error && <div className="comments-error">{error}</div>}

      {/* Comments List */}
      <div className="comments-list">
        {commentsCount === 0 ? (
          <div className="empty-comments">
            <div className="empty-comments-icon">💬</div>
            <p>No comments yet</p>
            <p className="empty-comments-subtext">Be the first to comment!</p>
          </div>
        ) : (
          commentsArray.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUser={currentUser}
              onReply={setReplyingTo}
              replyingTo={replyingTo}
              replyContent={replyContent}
              onReplyChange={setReplyContent}
              onSubmitReply={handleSubmitReply}
              onCancelReply={handleCancelReply}
              formatDate={formatDate}
              sending={sending}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Individual Comment Component
const CommentItem = ({
  comment,
  currentUser,
  onReply,
  replyingTo,
  replyContent,
  onReplyChange,
  onSubmitReply,
  onCancelReply,
  formatDate,
  sending
}) => {
  const isReplying = replyingTo === comment.id;
  
  // Safe check for replies array
  const repliesArray = Array.isArray(comment.replies) ? comment.replies : [];
  const hasReplies = repliesArray.length > 0;

  return (
    <div className="comment-item">
      <img
        src={`https://ui-avatars.com/api/?name=${comment.user?.username || 'User'}&background=random`}
        alt={comment.user?.username || 'User'}
        className="comment-avatar"
      />
      
      <div className="comment-content">
        <div className="comment-header">
          <span className="comment-author">{comment.user?.username || 'Unknown User'}</span>
          <span className="comment-date">{formatDate(comment.created_at)}</span>
        </div>
        
        <p className="comment-text">{comment.content}</p>
        
        <div className="comment-actions">
          {currentUser && (
            <button
              className="comment-reply-btn"
              onClick={() => onReply(isReplying ? null : comment.id)}
            >
              {isReplying ? 'Cancel' : 'Reply'}
            </button>
          )}
        </div>

        {/* Reply Input */}
        {isReplying && currentUser && (
          <div className="reply-form">
            <div className="comment-input-container">
              <img
                src={`https://ui-avatars.com/api/?name=${currentUser.username}&background=random`}
                alt={currentUser.username}
                className="comment-user-avatar"
              />
              <div className="comment-input-wrapper">
                <input
                  type="text"
                  placeholder="Write a reply..."
                  value={replyContent}
                  onChange={(e) => onReplyChange(e.target.value)}
                  className="comment-input"
                  maxLength={1000}
                />
                <div className="comment-actions">
                  <button
                    type="button"
                    onClick={onCancelReply}
                    className="comment-cancel-btn"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => onSubmitReply(comment)}
                    className="comment-submit-btn"
                    disabled={!replyContent.trim() || sending}
                  >
                    {sending ? 'Replying...' : 'Reply'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Nested Replies */}
        {hasReplies && (
          <div className="replies-container">
            {repliesArray.map(reply => (
              <div key={reply.id} className="comment-item reply-item">
                <img
                  src={`https://ui-avatars.com/api/?name=${reply.user?.username || 'User'}&background=random`}
                  alt={reply.user?.username || 'User'}
                  className="comment-avatar"
                />
                <div className="comment-content">
                  <div className="comment-header">
                    <span className="comment-author">{reply.user?.username || 'Unknown User'}</span>
                    <span className="comment-date">{formatDate(reply.created_at)}</span>
                  </div>
                  <p className="comment-text">{reply.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Comments;