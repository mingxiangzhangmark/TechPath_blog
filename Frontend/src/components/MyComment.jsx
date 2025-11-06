import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyComments } from "../services/comment";

export default function MyComments() {
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const data = await getMyComments();
      setComments(data);
      setError(false);
    } catch (err) {
      console.error("Failed to load comments:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setError(false);
    setComments([]);
    fetchComments();
  };

  const handleRetry = () => {
    setError(false);
  };

  // Limit the length of comment content
  const truncateContent = (text, maxLength = 60) => {
    if (!text) return "";
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  // Load comments from the backend
  useEffect(() => {
    fetchComments();
  }, []);

  // Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-gray-400 text-xl font-semibold">Loading comments…</p>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-gray-400 text-xl font-semibold">
          Failed to load comments. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">My Comments</h1>
          <p className="text-gray-500">Your posted comments</p>
        </div>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100 transition"
        >
          Refresh
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex flex-col items-center justify-center border rounded-lg p-8">
          <p className="text-gray-500 mb-3">
            Failed to load your comments. Please try again.
          </p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!error && comments.length === 0 && (
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <p className="text-gray-400 text-xl md:text-2xl font-semibold text-center">
            No comments yet.<br />
            Your thoughts could be the start of something great — share them now!
          </p>
        </div>
      )}

      {/* Comment List */}
      {!error && comments.length > 0 && (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="border rounded-lg p-4 hover:bg-gray-50 transition cursor-pointer"
              onClick={() => navigate(`/posts/${comment.postSlug}`)}
            >
              {/* Post title: smaller font size, remove bolding */}
              <div className="flex justify-between items-center mb-1">
                <h2 className="text-sm text-gray-500">
                  {comment.postTitle}
                </h2>
                <span className="text-xs text-gray-400">
                  {comment.createdAt}
                </span>
              </div>

              {/* Comments Off on Highlight */}
              <p className="text-gray-800 text-base md:text-lg">
                {truncateContent(comment.content)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
