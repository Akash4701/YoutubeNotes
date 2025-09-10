'use client'
import { useMutation } from '@apollo/client/react';
import gql from 'graphql-tag';
import { Calendar, ExternalLink, FileText, Heart, Play, Sparkles, User } from 'lucide-react';
import React, { useEffect, useState } from 'react'

function NoteCard({ note, index }: { note: any; index: number }) {
  const [liked, setLiked] = useState<boolean>(note.likedByMe);
  const [likesCount, setLikesCount] = useState<number>(note.likesCount || 0);
  console.log('likesCount',likesCount,note.title)


  const LIKE_NOTE = gql`
   mutation LikeNote($noteId:ID!,$liked:Boolean){
     likeNotes(noteId:$noteId,liked:$liked)
   }
  `

  const [likeNoteMutation, { loading: likeLoading }] = useMutation(LIKE_NOTE);
  // Update local state when note prop changes (after reload/refetch)
  useEffect(() => {
    setLiked(note.likedByMe);
    setLikesCount(note.likesCount || 0);
  }, [note.likedByMe, note.likesCount]);

  const handleLikeToggle = async () => {
  const newLikedState = !liked;
  const previousLiked = liked;
  const previousLikesCount = likesCount;
  
  // Optimistically update UI first
  setLiked(newLikedState);
  setLikesCount(prev => {
    if (newLikedState && !previousLiked) {
      return prev + 1; // Liking: add 1
    } else if (!newLikedState && previousLiked) {
      return Math.max(0, prev - 1); // Unliking: subtract 1
    }
    return prev;
  });

  try {
    await likeNoteMutation({
      variables: {
        noteId: note.id,
        liked: newLikedState
      },
      optimisticResponse: {
        likeNotes: newLikedState
      }
    });

    console.log('Like operation successful');
  } catch (err) {
    console.log('Like mutation failed:', err.message);
    
    // Revert optimistic updates on error
    setLiked(previousLiked);
    setLikesCount(previousLikesCount);
  }
};

  const formatDate = (dateString: any) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-gray-100">
      {/* Thumbnail with overlay */}
      <div className="relative overflow-hidden">
        <div className="w-full h-56 relative group overflow-hidden rounded-lg">
          {/* Thumbnail image */}
          <img
            src={note.thumbnail}
            alt={note.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Likes badge with glow effect */}
        <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md text-white px-3 py-2 rounded-full text-sm flex items-center gap-2 border border-white/20">
          <button 
            onClick={handleLikeToggle}
            disabled={likeLoading}
            className="flex items-center gap-1 transition-all duration-200 hover:scale-110"
          >
            <Heart
              className={`w-4 h-4 transition-all duration-200 ${
                liked 
                  ? "text-red-500 fill-red-500" 
                  : "text-gray-300 hover:text-red-400"
              } ${likeLoading ? 'animate-pulse' : ''}`}
            />
          </button>
          <span className="font-semibold">{likesCount}</span>
        </div>
      </div>

      <div className="p-6 relative">
        <h3 className="font-bold text-xl mb-3 text-gray-900 leading-tight group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text transition-all duration-300">
          {note.title}
        </h3>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-sm">
            <div className="p-2 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-gray-700 font-medium">{note.contentCreater || 'Unknown Creator'}</span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="p-2 bg-gradient-to-br from-green-50 to-teal-50 rounded-lg">
              <Calendar className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-gray-600">{formatDate(note.createdAt)}</span>
          </div>

          {note.channelName && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                <ExternalLink className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-purple-700 font-semibold text-sm">{note.channelName}</span>
            </div>
          )}
        </div>

        {/* Action buttons with enhanced design */}
        <div className="flex gap-3">
          <a
            href={note.youtube_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105 shadow-lg hover:shadow-red-500/25"
          >
            <Play className="w-4 h-4" />
            Watch
          </a>
          <a
            href={`/note/${note.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
          >
            <FileText className="w-4 h-4" />
            Notes
          </a>
        </div>
      </div>
    </div>
  );
}

export default NoteCard;