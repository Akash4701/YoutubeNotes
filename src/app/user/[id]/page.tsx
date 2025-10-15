'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Camera, Heart, Bookmark, Eye, Upload, X, ExternalLink, Play, FileText, User, Sparkles, Calendar, RefreshCw, Youtube, BookmarkPlus, Award, Link } from 'lucide-react';
import { useQuery,useMutation } from '@apollo/client/react';
import gql from 'graphql-tag';
import { useParams } from 'next/navigation';

const FETCH_USER_PROFILE = gql`
  query FetchUser($userId: ID!) {
    fetchUser(UserId: $userId) {
      name
      profilePic
      likes
      saves
      ProfileLinks {
        linkName
        linkUrl
      }
    }
  }
`;

const GET_NOTES = gql`
  query GetNotes($page: Int, $limit: Int, $sortBy: SortOrder, $userId: ID, $saved: Boolean) {
    getNotes(page: $page, limit: $limit, sortBy: $sortBy, userId: $userId, saved: $saved) {
      notes {
        id
        title
        thumbnail
        contentCreater
        channelName
        youtube_url
        pdf_url
        userId
        likesCount
        savedByMe
        likedByMe
        createdAt
        updatedAt
      }
      totalCount
      totalPages
      currentPage
      hasNextPage
      hasPreviousPage
    }
  }
`;

const CREATE_USER_PROFILE_PIC = gql`
  mutation CreateUserProfilePic($userId: ID!, $profileUrl: String) {
    createUserProfilePic(userId: $userId, userProfilePic: $profileUrl) {
      profilePic
    }
  }
`;

const CREATE_USER_PROFILE_LINKS = gql`
  mutation CreateUserProfileLinks($userId: ID!, $links: ProfileLinksInput!) {
    createUserProfileLinks(UserId: $userId, links: $links) {
      linkName
      linkUrl
    }
  }
`;

const UserProfile = () => {
  const params = useParams();
  const userId = params?.userId as string;
  
  const [activeTab, setActiveTab] = useState('uploads');
  const [profileImage, setProfileImage] = useState(null);
  const [userName, setUserName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [profileLinks, setProfileLinks] = useState([]);
  const [newLink, setNewLink] = useState({ linkName: '', linkUrl: '' });
  const [showLinkForm, setShowLinkForm] = useState(false);
  const fileInputRef = useRef(null);

  const { data: profileData, loading: profileLoading, error: profileError } = useQuery(FETCH_USER_PROFILE, {
    variables: { userId },
    skip: !userId,
  });

  const { data: notesData, loading: notesLoading, refetch: refetchNotes } = useQuery(GET_NOTES, {
    variables: {
      page: 1,
      limit: 12,
      sortBy: 'CREATED_AT_DESC',
      userId: activeTab === 'uploads' ? userId : undefined,
      saved: activeTab === 'saved' ? true : undefined,
    },
    skip: !userId,
  });

  const [createProfilePic] = useMutation(CREATE_USER_PROFILE_PIC);
  const [createProfileLinks] = useMutation(CREATE_USER_PROFILE_LINKS);

  useEffect(() => {
    if (profileData?.fetchUser) {
      console.log('profileData',profileData);
      setUserName(profileData.fetchUser.name || '');
      setProfileImage(profileData.fetchUser.profilePic);
      setProfileLinks(profileData.fetchUser.ProfileLinks || []);
    }
  }, [profileData]);

  useEffect(() => {
    if (userId) {
      refetchNotes({
        page: 1,
        limit: 12,
        sortBy: 'CREATED_AT_DESC',
        userId: activeTab === 'uploads' ? userId : undefined,
        saved: activeTab === 'saved' ? true : undefined,
      });
    }
  }, [activeTab, userId, refetchNotes]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result;
        setProfileImage(base64String);
        
        try {
          await createProfilePic({
            variables: { userId, profileUrl: base64String },
          });
        } catch (error) {
          console.error('Error uploading profile picture:', error);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const addProfileLink = async () => {
    if (newLink.linkName && newLink.linkUrl) {
      try {
        await createProfileLinks({
          variables: { userId, links: newLink },
        });
        
        setProfileLinks([...profileLinks, newLink]);
        setNewLink({ linkName: '', linkUrl: '' });
        setShowLinkForm(false);
      } catch (error) {
        console.error('Error adding profile link:', error);
      }
    }
  };

  const removeLink = (index) => {
    setProfileLinks(profileLinks.filter((_, i) => i !== index));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTimeAgo = (dateString) => {
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

  const stats = {
    totalLikes: profileData?.fetchUser?.likes || 0,
    totalSaves: profileData?.fetchUser?.saves || 0,
    totalViews: 0,
    netRating: 0,
  };

  const notes = notesData?.getNotes?.notes || [];
  const loading = notesLoading || profileLoading;

  if (profileError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg font-semibold">Error loading profile</p>
          <p className="text-gray-600 mt-2">{profileError.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6 border border-purple-100">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-4xl font-bold shadow-lg overflow-hidden">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  userName.charAt(0).toUpperCase()
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-all transform hover:scale-110"
              >
                <Camera size={18} />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                {isEditingName ? (
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    onBlur={() => setIsEditingName(false)}
                    className="text-3xl font-bold text-gray-800 border-b-2 border-purple-400 focus:outline-none bg-transparent"
                    autoFocus
                  />
                ) : (
                  <h1 onClick={() => setIsEditingName(true)} className="text-3xl font-bold text-gray-800 cursor-pointer hover:text-purple-600 transition-colors">
                    {userName || 'User'}
                  </h1>
                )}
              </div>

              <div className="flex items-center justify-center md:justify-start gap-2 mb-6">
                <Award className="text-yellow-500" size={24} />
                <span className="text-2xl font-bold text-gray-700">{stats.netRating || 'N/A'}</span>
                <span className="text-gray-500">Net Rating</span>
              </div>

              <div className="grid grid-cols-3 gap-6 mb-6">
                <div className="bg-gradient-to-br from-pink-100 to-pink-50 p-4 rounded-2xl text-center transform hover:scale-105 transition-transform">
                  <Heart className="mx-auto mb-2 text-pink-600" size={24} />
                  <div className="text-2xl font-bold text-gray-800">{stats.totalLikes.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Likes</div>
                </div>
                <div className="bg-gradient-to-br from-purple-100 to-purple-50 p-4 rounded-2xl text-center transform hover:scale-105 transition-transform">
                  <Bookmark className="mx-auto mb-2 text-purple-600" size={24} />
                  <div className="text-2xl font-bold text-gray-800">{stats.totalSaves.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Saves</div>
                </div>
                <div className="bg-gradient-to-br from-blue-100 to-blue-50 p-4 rounded-2xl text-center transform hover:scale-105 transition-transform">
                  <Eye className="mx-auto mb-2 text-blue-600" size={24} />
                  <div className="text-2xl font-bold text-gray-800">{stats.totalViews > 0 ? stats.totalViews.toLocaleString() : 'N/A'}</div>
                  <div className="text-sm text-gray-600">Total Views</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-center md:justify-start gap-2 text-gray-700 font-semibold mb-2">
                  <Link size={18} />
                  <span>Profile Links</span>
                </div>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {profileLinks.map((link, index) => (
                    <div key={index} className="bg-gray-100 px-4 py-2 rounded-full flex items-center gap-2 group">
                      <span className="text-sm font-medium text-gray-700">{link.linkName}:</span>
                      <span className="text-sm text-gray-600">{link.linkUrl}</span>
                      <button onClick={() => removeLink(index)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                    </div>
                  ))}
                  {!showLinkForm && (
                    <button onClick={() => setShowLinkForm(true)} className="bg-purple-100 text-purple-600 px-4 py-2 rounded-full text-sm font-medium hover:bg-purple-200 transition-colors">
                      + Add Link
                    </button>
                  )}
                </div>
                {showLinkForm && (
                  <div className="flex flex-col sm:flex-row gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="Platform (e.g., YouTube)"
                      value={newLink.linkName}
                      onChange={(e) => setNewLink({ ...newLink, linkName: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                    <input
                      type="text"
                      placeholder="URL"
                      value={newLink.linkUrl}
                      onChange={(e) => setNewLink({ ...newLink, linkUrl: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                    <button onClick={addProfileLink} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                      Add
                    </button>
                    <button onClick={() => setShowLinkForm(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors">
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab('uploads')}
              className={`flex-1 min-w-max px-6 py-4 font-bold transition-all ${
                activeTab === 'uploads' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Upload className="w-5 h-5 inline mr-2" />
              My Uploads
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex-1 min-w-max px-6 py-4 font-bold transition-all ${
                activeTab === 'saved' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Bookmark className="w-5 h-5 inline mr-2" />
              Saved Notes
            </button>
            <button
              onClick={() => setActiveTab('liked')}
              className={`flex-1 min-w-max px-6 py-4 font-bold transition-all ${
                activeTab === 'liked' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Heart className="w-5 h-5 inline mr-2" />
              Liked Notes
            </button>
          </div>

          <div className="p-6 bg-gradient-to-br from-gray-50 to-slate-50">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : notes.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  {activeTab === 'uploads' && <Upload className="w-10 h-10 text-gray-400" />}
                  {activeTab === 'saved' && <Bookmark className="w-10 h-10 text-gray-400" />}
                  {activeTab === 'liked' && <Heart className="w-10 h-10 text-gray-400" />}
                </div>
                <p className="text-gray-500 text-lg font-medium">No notes found</p>
                <p className="text-gray-400 text-sm mt-2">
                  {activeTab === 'uploads' && 'Start by uploading your first note'}
                  {activeTab === 'saved' && 'Save notes to access them here'}
                  {activeTab === 'liked' && 'Like notes to see them here'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.map((note) => (
                  <div key={note.id} className="group relative bg-gradient-to-br from-white via-white to-gray-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-gray-200 hover:border-blue-300">
                    <div className="relative overflow-hidden bg-gray-900">
                      <div className="w-full h-56 relative group/thumb overflow-hidden">
                        <img
                          src={note.thumbnail}
                          alt={note.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover/thumb:scale-110"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="225"%3E%3Crect fill="%23374151" width="400" height="225"/%3E%3Ctext fill="%23fff" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="20"%3EThumbnail%3C/text%3E%3C/svg%3E';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-300" />
                        
                        <div className="absolute bottom-3 left-3 bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-lg">
                          <Youtube className="w-3.5 h-3.5" />
                          VIDEO
                        </div>
                      </div>

                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                        <div className="bg-black/80 backdrop-blur-md text-white px-3 py-2 rounded-full text-sm flex items-center gap-2 border border-white/20 shadow-xl">
                          <Heart className={`w-4 h-4 ${note.likedByMe ? 'text-red-500 fill-red-500' : 'text-white'}`} />
                          <span className="font-semibold">{note.likesCount}</span>
                        </div>
                        {note.savedByMe && (
                          <div className="bg-black/80 backdrop-blur-md text-white p-2.5 rounded-full border border-white/20 shadow-xl">
                            <BookmarkPlus className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-5 space-y-4">
                      <h3 className="font-bold text-xl leading-tight text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
                        {note.title}
                      </h3>

                      <div className="space-y-2.5">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 p-2 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Creator</p>
                            <p className="text-sm text-gray-800 font-semibold truncate">{note.contentCreater}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 p-2 bg-gradient-to-br from-indigo-50 to-blue-100 rounded-xl">
                            <Sparkles className="w-4 h-4 text-indigo-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Channel</p>
                            <p className="text-sm text-indigo-700 font-semibold truncate">{note.channelName}</p>
                          </div>
                        </div>
                      </div>

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

                      <div className="pt-2">
                        <div className="inline-flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-xs text-gray-600 font-mono">ID: {note.userId.slice(0, 8)}...</span>
                        </div>
                      </div>

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

                        <a
                          href={`/note/${note.id}`}
                          className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105 shadow-lg hover:shadow-blue-500/30"
                        >
                          <FileText className="w-4 h-4" />
                          <span className="text-sm">Notes</span>
                        </a>

                        <a
                          href={note.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white p-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center transform hover:scale-105 shadow-lg hover:shadow-green-500/30"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>

                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-blue-500/10" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;