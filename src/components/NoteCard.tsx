'use client'
import { useMutation } from '@apollo/client/react';
import gql from 'graphql-tag';
import { Calendar, ExternalLink, FileText, Heart, Play, Save, Sparkles, User, Clock, RefreshCw, Youtube, BookmarkPlus, Eye } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'

const LIKE_NOTE = gql`
   mutation LikeNote($noteId:ID!,$liked:Boolean){
     likeNotes(noteId:$noteId,liked:$liked)
   }
  `

const SAVE_NOTE = gql`
  mutation SaveNote($noteId:ID!,$saved:Boolean){
  saveNote(noteId:$noteId,saved:$saved)
  }
  `

const VIEW_NOTE = gql`
  mutation ViewNote($noteId:ID!,$userId:ID!){
  viewNote(noteId:$noteId,userId:$userId)
  }`

function NoteCard({ note }: { note: any; }) {
  const [liked, setLiked] = useState<boolean>(note.likedByMe);
  const [likesCount, setLikesCount] = useState<number>(note.likesCount || 0);
  const [saved, setSaved] = useState<boolean>(note.savedByMe || false);
  const [viewsCount, setViewCount] = useState<number>(note.viewsCount || 0);
  console.log('likesCount', likesCount, note.title)

  const [likeNoteMutation, { loading: likeLoading }] = useMutation(LIKE_NOTE);
  const [saveNoteMutation, { loading: saveLoading }] = useMutation(SAVE_NOTE);
  const [viewNoteMutation, { loading: viewloading }] = useMutation(VIEW_NOTE);
  
  useEffect(() => {
    setLiked(note.likedByMe);
    setSaved(note.savedByMe);
    setLikesCount(note.likesCount || 0);
    setViewCount(note.viewsCount || 0);
  }, [note.likedByMe, note.likesCount, note.savedByMe, note.viewsCount]);

  const handleSaveToggle = async () => {
    const newSavedState = !saved;
    setSaved(newSavedState);
    try {
      await saveNoteMutation({
        variables: {
          noteId: note.id,
          saved: newSavedState
        },
        optimisticResponse: {
          saveNote: newSavedState
        }
      })
      console.log('Save operation is successful');
    } catch (err: any) {
      console.log('saved operation is not successful', err.message);
      setSaved(!newSavedState);
    }
  }

  const router = useRouter();

  const handleView = () => {
    router.push(`/note/${note.id}`)
    
    if (!note.id && !note.userId) return;
    const timer = setTimeout(async () => {
      try {
        console.log('fetching views')
      
        const res = await viewNoteMutation({
          variables: {
            userId: note.userId,
            noteId: note.id
          }
        })
        const result = res.data.viewNote;
        console.log('result views', result);
        if (!result) {
          console.log("✅ View recorded or already exists");
          setViewCount(note.viewsCount + 1);
        } 
        return () => clearTimeout(timer)
      } catch (err: any) {
        console.log('Error creating views', err.message)
      }
    }, 4000);
  }

  const handleUserClick = () => {
    if (note.userId) {
      router.push(`/user/${note.userId}`);
    }
  }

  const handleLikeToggle = async () => {
    const newLikedState = !liked;
    const previousLiked = liked;
    const previousLikesCount = likesCount;
    setLiked(newLikedState);
    setLikesCount(prev => {
      if (newLikedState && !previousLiked) {
        return prev + 1;
      } else if (!newLikedState && previousLiked) {
        return Math.max(0, prev - 1);
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
    } catch (err: any) {
      console.log('Like mutation failed:', err.message);
      setLiked(previousLiked);
      setLikesCount(previousLikesCount);
    }
  };

  const formatDate = (dateString: any) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: any) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString: any) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    return `${Math.floor(days / 365)}y ago`;
  };

  return (
    <div className="group relative bg-gradient-to-br from-white via-white to-gray-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-gray-200 hover:border-purple-300">
      {/* Thumbnail Section */}
      <div className="relative overflow-hidden bg-gray-900">
        <div className="w-full h-56 relative group/thumb overflow-hidden">
          <img
            src={note.thumbnail || '/placeholder.jpg'}
            alt={note.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover/thumb:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Top Action Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          {/* Like Badge */}
          <div className="bg-black/80 backdrop-blur-md text-white px-3 py-2 rounded-full text-sm flex items-center gap-2 border border-white/20 shadow-xl">
            <button 
              onClick={handleLikeToggle}
              disabled={likeLoading}
              className="flex items-center gap-1.5 transition-all duration-200 hover:scale-110 disabled:opacity-50"
              aria-label={liked ? "Unlike" : "Like"}
            >
              <Heart
                className={`w-4 h-4 transition-all duration-200 ${
                  liked 
                    ? "text-red-500 fill-red-500 animate-pulse" 
                    : "text-white hover:text-red-400"
                } ${likeLoading ? 'animate-spin' : ''}`}
              />
              <span className="font-semibold">{likesCount}</span>
            </button>
          </div>

          <button 
            onClick={handleSaveToggle}
            disabled={saveLoading}
            className="bg-black/80 backdrop-blur-md text-white p-2.5 rounded-full border border-white/20 shadow-xl transition-all duration-200 hover:scale-110 disabled:opacity-50"
            aria-label={saved ? "Unsave" : "Save"}
          >
            <BookmarkPlus
              className={`w-4 h-4 transition-all duration-200 ${
                saved 
                  ? "text-yellow-400 fill-yellow-400" 
                  : "text-white hover:text-yellow-400"
              } ${saveLoading ? 'animate-spin' : ''}`}
            />
          </button>
        </div>

        {/* User Profile Picture - Bottom Left */}
        <div className="absolute bottom-3 left-3">
          <button
            onClick={handleUserClick}
            className="group/profile relative transition-all duration-200 hover:scale-110"
            aria-label="View user profile"
          >
            <div className="w-12 h-12 rounded-full border-3 border-white shadow-xl overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400">
              {note.user?.profilePic ? (
                <img
                  src={note.user.profilePic}
                  alt={note.user.name || 'User'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
              )}
            </div>
            <div className="absolute inset-0 rounded-full bg-white/0 group-hover/profile:bg-white/20 transition-colors duration-200" />
          </button>
        </div>

        {/* View Count Badge - Bottom Right */}
        <div className="absolute bottom-3 right-3">
          <div className="bg-black/80 backdrop-blur-md text-white px-3 py-2 rounded-full text-sm flex items-center gap-2 border border-white/20 shadow-xl">
            <Eye className="w-4 h-4" />
            <span className="font-semibold">{viewsCount}</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 space-y-4">
        {/* Title */}
        <h3 className="font-bold text-xl leading-tight text-gray-900 line-clamp-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:via-pink-600 group-hover:to-red-600 group-hover:bg-clip-text transition-all duration-300">
          {note.title}
        </h3>

        {/* Creator & Channel Info */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 p-2 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Creator</p>
              <p className="text-sm text-gray-800 font-semibold truncate">{note.contentCreater || 'Unknown'}</p>
            </div>
          </div>

          {note.channelName && (
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 p-2 bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl">
                <Sparkles className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Channel</p>
                <p className="text-sm text-purple-700 font-semibold truncate">{note.channelName}</p>
              </div>
            </div>
          )}
        </div>

        {/* Timestamps Grid */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-gray-500">
              <Calendar className="w-3.5 h-3.5" />
              <span className="text-xs font-medium uppercase tracking-wide">Created</span>
            </div>
            <p className="text-xs text-gray-700 font-semibold">{formatDate(note.createdAt)}</p>
            <p className="text-xs text-gray-500">{getTimeAgo(note.createdAt)}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-gray-500">
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="text-xs font-medium uppercase tracking-wide">Updated</span>
            </div>
            <p className="text-xs text-gray-700 font-semibold">{formatDate(note.updatedAt)}</p>
            <p className="text-xs text-gray-500">{getTimeAgo(note.updatedAt)}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2.5 pt-2">
          <a
            href={note.youtube_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105 shadow-lg hover:shadow-red-500/30"
          >
            <Play className="w-4 h-4" />
            <span className="text-sm">Watch</span>
          </a>

          <button
            onClick={handleView}
            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105 shadow-lg hover:shadow-blue-500/30"
          >
            <FileText className="w-4 h-4" />
            <span className="text-sm">Notes</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default NoteCard;