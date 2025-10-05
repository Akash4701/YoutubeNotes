import React, { useState } from 'react';
import { MessageCircle, User, Clock, Send, X } from 'lucide-react';

type Comment = {
  id: string;
  content: string;
  noteId: string;
  parentId: string | null;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  replies?: Comment[];
};

type AllCommentsProps = {
  comment: Comment;
  onReply?: (content: string, parentId: string) => Promise<void>;
  isSubmitting?: boolean;
};

function AllComments({ comment, onReply, isSubmitting = false }: AllCommentsProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');

  // Format the date to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  // Get initials from authorId for avatar
  const getInitials = (authorId: string) => {
    return authorId.substring(0, 2).toUpperCase();
  };

  // Generate a consistent color based on authorId
  const getAvatarColor = (authorId: string) => {
    const colors = [
      'bg-blue-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-indigo-500',
      'bg-teal-500',
    ];
    const index = authorId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim() || !onReply) return;
    
    await onReply(replyText, comment.id);
    setReplyText('');
    setIsReplying(false);
  };

  const handleCancelReply = () => {
    setReplyText('');
    setIsReplying(false);
  };

  return (
    <div className="group relative bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-blue-300 transition-all duration-300 ease-in-out">
      {/* Decorative gradient border on hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
      
      <div className="relative flex gap-4">
        {/* Avatar */}
        <div className={`flex-shrink-0 w-12 h-12 ${getAvatarColor(comment.authorId)} rounded-full flex items-center justify-center text-white font-bold shadow-md`}>
          {getInitials(comment.authorId)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="font-semibold text-gray-900">{comment.authorId}</span>
            </div>
            <span className="text-gray-400">•</span>
            <div className="flex items-center gap-1 text-gray-500">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-sm">{formatDate(comment.createdAt)}</span>
            </div>
          </div>

          {/* Comment Text */}
          <p className="text-gray-700 leading-relaxed mb-3 break-words">
            {comment.content}
          </p>

          {/* Footer Actions */}
          <div className="flex items-center gap-4 text-sm">
            {onReply && (
              <button 
                onClick={() => setIsReplying(!isReplying)}
                className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Reply</span>
              </button>
            )}
            
            <button className="text-gray-500 hover:text-red-600 transition-colors">
              Report
            </button>
          </div>

          {/* Reply Input Section */}
          {isReplying && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 animate-in fade-in slide-in-from-top-2 duration-200">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to ${comment.authorId}...`}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleSubmitReply}
                  disabled={!replyText.trim() || isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Sending...' : 'Send'}</span>
                </button>
                <button
                  onClick={handleCancelReply}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Thread indicator for nested comments */}
      {comment.parentId && (
        <div className="absolute left-6 top-0 w-0.5 h-full bg-gradient-to-b from-blue-400 to-transparent opacity-30"></div>
      )}
    </div>
  );
}

export default AllComments;