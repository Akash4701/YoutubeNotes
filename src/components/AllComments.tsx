import React, { useState } from 'react';
import { MessageCircle, User, Clock, Send, X, ChevronDown, ChevronUp, MoreHorizontal } from 'lucide-react';

type Comment = {
  id: string;
  content: string;
  noteId?: string;
  parentId: string | null;
  replies: Comment[];
  authorId: string;
  createdAt: string;
  updatedAt: string;
  hasMoreReplies?: boolean;
  replyCount?: number;
};

type CommentItemProps = {
  comment: Comment;
  depth?: number;
  onReply?: (content: string, parentId: string) => Promise<void>;
  onFetchMore?: (parentId: string) => Promise<void>;
  isSubmitting?: boolean;
  isFetchingMore?: boolean;
};

export default function CommentItem({ 
  comment, 
  depth = 0, 
  onReply, 
  onFetchMore,
  isSubmitting = false,
  isFetchingMore = false 
}: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

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

  const getInitials = (authorId: string) => {
    return authorId.substring(0, 2).toUpperCase();
  };

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

  const handleFetchMore = async () => {
    if (!onFetchMore) return;
    setIsLoadingMore(true);
    await onFetchMore(comment.id);
    setIsLoadingMore(false);
  };

  const hasReplies = comment.replies && comment.replies.length > 0;
  const showFetchMore = comment.hasMoreReplies ;
  const maxDepth = 5;
  const shouldIndent = depth < maxDepth;

  return (
    <div className={`relative ${shouldIndent ? 'ml-0' : 'ml-0'}`}>
      <div className="group relative bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-blue-300 transition-all duration-300">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
        
        <div className="relative flex gap-3">
          <div className={`flex-shrink-0 w-10 h-10 ${getAvatarColor(comment.authorId)} rounded-full flex items-center justify-center text-white font-bold shadow-md text-sm`}>
            {getInitials(comment.authorId)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-gray-500" />
                <span className="font-semibold text-gray-900 text-sm">{comment.authorId}</span>
              </div>
              <span className="text-gray-400 text-xs">•</span>
              <div className="flex items-center gap-1 text-gray-500">
                <Clock className="w-3 h-3" />
                <span className="text-xs">{formatDate(comment.createdAt)}</span>
              </div>
              {depth > 0 && (
                <>
                  <span className="text-gray-400 text-xs">•</span>
                  <span className="text-xs text-blue-600 font-medium">Reply</span>
                </>
              )}
            </div>

            <p className="text-gray-700 leading-relaxed mb-3 break-words text-sm">
              {comment.content}
            </p>

            <div className="flex items-center gap-4 text-xs flex-wrap">
              {onReply && (
                <button 
                  onClick={() => setIsReplying(!isReplying)}
                  className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 transition-colors font-medium"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Reply</span>
                </button>
              )}
              
              {hasReplies && (
                <button 
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="flex items-center gap-1.5 text-gray-500 hover:text-purple-600 transition-colors font-medium"
                >
                  {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                  <span>{isCollapsed ? 'Show' : 'Hide'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}</span>
                </button>
              )}

              {showFetchMore && !isCollapsed && (
                <button 
                  onClick={handleFetchMore}
                  disabled={isLoadingMore}
                  className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MoreHorizontal className="w-3.5 h-3.5" />
                  <span>{isLoadingMore ? 'Loading...' : `Fetch More (${comment.replyCount || 0} more)`}</span>
                </button>
              )}
            </div>

            {isReplying && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Reply to ${comment.authorId}...`}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                  rows={3}
                  autoFocus
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleSubmitReply}
                    disabled={!replyText.trim() || isSubmitting}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Sending...' : 'Send'}</span>
                  </button>
                  <button
                    onClick={handleCancelReply}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-xs font-medium"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {hasReplies && !isCollapsed && (
        <div className={`mt-3 ${shouldIndent ? 'ml-8 pl-4 border-l-2 border-blue-200' : 'ml-4'} space-y-3`}>
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              onReply={onReply}
              onFetchMore={onFetchMore}
              isSubmitting={isSubmitting}
              isFetchingMore={isFetchingMore}
            />
          ))}
        </div>
      )}
    </div>
  );
}