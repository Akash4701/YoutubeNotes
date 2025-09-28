import React, { useState } from 'react';
import { MessageCircle, Reply, Send, User } from 'lucide-react';

interface Comment {
  id: number;
  author: string;
  content: string;
  timestamp: string;
  avatar: string;
  replies: Comment[];
}

interface CommentItemProps {
  comment: Comment;
  depth?: number;
  replyingTo: number | null;
  setReplyingTo: (id: number | null) => void;
  replyText: string;
  setReplyText: (text: string) => void;
  addReply: (parentId: number) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({ 
  comment, 
  depth = 0, 
  replyingTo, 
  setReplyingTo, 
  replyText, 
  setReplyText, 
  addReply 
}) => (
  <div className={`${depth > 0 ? 'ml-8 mt-4' : 'mb-6'} transition-all duration-200`}>
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
          {comment.avatar}
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium text-gray-900">{comment.author}</span>
            <span className="text-gray-500 text-sm">{comment.timestamp}</span>
          </div>
          <p className="text-gray-700 mb-3 leading-relaxed">{comment.content}</p>
          <button
            onClick={() => setReplyingTo(comment.id)}
            className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-150"
          >
            <Reply size={14} />
            <span>Reply</span>
          </button>
        </div>
      </div>
      
      {replyingTo === comment.id && (
        <div className="mt-4 ml-11 p-3 bg-gray-50 rounded-lg">
          <textarea
            value={replyText}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            className="w-full p-2 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
          <div className="flex justify-end space-x-2 mt-2">
            <button
              onClick={() => {
                setReplyingTo(null);
                setReplyText('');
              }}
              className="px-3 py-1 text-gray-600 hover:text-gray-800 transition-colors duration-150"
            >
              Cancel
            </button>
            <button
              onClick={() => addReply(comment.id)}
              className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-150"
            >
              <Send size={14} />
              <span>Reply</span>
            </button>
          </div>
        </div>
      )}
    </div>
    
    {comment.replies.map(reply => (
      <CommentItem 
        key={reply.id} 
        comment={reply} 
        depth={depth + 1}
        replyingTo={replyingTo}
        setReplyingTo={setReplyingTo}
        replyText={replyText}
        setReplyText={setReplyText}
        addReply={addReply}
      />
    ))}
  </div>
);

const Comments: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      author: 'Sarah Johnson',
      content: 'This is such a thoughtful post! I really appreciate the insights you shared.',
      timestamp: '2 hours ago',
      avatar: 'SJ',
      replies: [
        {
          id: 2,
          author: 'Mike Chen',
          content: 'I agree! The examples really helped clarify the concepts.',
          timestamp: '1 hour ago',
          avatar: 'MC',
          replies: [
            {
              id: 3,
              author: 'Emma Davis',
              content: 'Same here! Looking forward to more content like this.',
              timestamp: '45 minutes ago',
              avatar: 'ED',
              replies: []
            }
          ]
        },
        {
          id: 4,
          author: 'Alex Rivera',
          content: 'Thanks for sharing this. Very helpful!',
          timestamp: '30 minutes ago',
          avatar: 'AR',
          replies: []
        }
      ]
    },
    {
      id: 5,
      author: 'Tom Wilson',
      content: 'Great article! I have a question about the implementation details though.',
      timestamp: '3 hours ago',
      avatar: 'TW',
      replies: []
    }
  ]);

  const [newComment, setNewComment] = useState<string>('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState<string>('');

  const addComment = (): void => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now(),
        author: 'You',
        content: newComment,
        timestamp: 'just now',
        avatar: 'Y',
        replies: []
      };
      setComments([comment, ...comments]);
      setNewComment('');
    }
  };

  const addReply = (parentId: number): void => {
    if (replyText.trim()) {
      const reply: Comment = {
        id: Date.now(),
        author: 'You',
        content: replyText,
        timestamp: 'just now',
        avatar: 'Y',
        replies: []
      };
      
      const addReplyToComment = (commentsList: Comment[]): Comment[] => {
        return commentsList.map(comment => {
          if (comment.id === parentId) {
            return { ...comment, replies: [...comment.replies, reply] };
          }
          if (comment.replies.length > 0) {
            return { ...comment, replies: addReplyToComment(comment.replies) };
          }
          return comment;
        });
      };
      
      setComments(addReplyToComment(comments));
      setReplyText('');
      setReplyingTo(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <MessageCircle className="text-blue-600" size={24} />
          <h2 className="text-2xl font-bold text-gray-900">Comments ({comments.length})</h2>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <textarea
            value={newComment}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
          <div className="flex justify-between items-center mt-3">
            <span className="text-gray-500 text-sm">
              {newComment.length}/500 characters
            </span>
            <button
              onClick={addComment}
              disabled={!newComment.trim()}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
            >
              <Send size={16} />
              <span>Post Comment</span>
            </button>
          </div>
        </div>
      </div>

      <div>
        {comments.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500 text-lg">No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments.map(comment => (
            <CommentItem 
              key={comment.id} 
              comment={comment} 
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyText={replyText}
              setReplyText={setReplyText}
              addReply={addReply}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Comments;