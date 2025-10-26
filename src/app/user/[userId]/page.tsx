'use client'
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Camera, Heart, Bookmark, Eye, Upload, Award, Link } from 'lucide-react';
import { useQuery, useMutation, useLazyQuery } from '@apollo/client/react';
import gql from 'graphql-tag';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import NoteCard from '@/components/NoteCard';
import NoteLoader from '@/components/ui/NoteLoader';
import axios from 'axios';


// Types
interface ProfileLink {
  id: string;
  linkName: string;
  linkUrl: string;
}
interface UserName{
  name:string;
}

interface UserProfile {
  id:string,
  name: string;
  profilePic: string | null;
  likes: number;
  saves: number;
  views:number;
  ProfileLinks: ProfileLink[];
}

interface Note {
  id: string;
  title: string;
  thumbnail: string;
  contentCreater: string;
  channelName: string;
  youtube_url: string;
  pdf_url: string;
  userId: string;
  likesCount: number;
  savedByMe: boolean;
  likedByMe: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NotesResponse {
  notes: Note[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

type TabType = 'uploads' | 'saved' | 'liked';

// GraphQL Queries
const FETCH_USER_PROFILE = gql`
  query FetchUser($userId: ID!) {
    fetchUser(userId: $userId) {
      name
      profilePic
      likes
      saves
      views
      ProfileLinks {
        id
        linkName
        linkUrl
      }
    }
  }
`;

const DELETE_PROFILE_LINK = gql`
  mutation DeleteUserProfileLinks($id: String!) {
    deleteUserProfileLinks(id: $id)
  }
`;

const GET_NOTES = gql`
  query GetNotes($page: Int, $limit: Int, $sortBy: SortOrder, $userId: ID, $saved: Boolean,$userliked:Boolean) {
    getNotes(page: $page, limit: $limit, sortBy: $sortBy, userId: $userId, saved: $saved,userliked:$userliked) {
      notes {
        id
        title
        youtube_url
        likesCount
        savedByMe
        user{
        profilePic
        }
        viewsCount
        likedByMe
        contentCreater
        channelName
        thumbnail
        pdf_url
        userId
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
    createUserProfilePic(userId: $userId, profileUrl: $profileUrl) {
      profilePic
    }
  }
`;
const CREATE_USER_NAME= gql`
   mutation CreateUserName($userId:ID!,$name:String){
createUserName(userId:$userId,name:$name){
name
}
}`;

const CREATE_USER_PROFILE_LINKS = gql`
  mutation CreateUserProfileLinks($userId: ID!, $linkName: String!, $linkUrl: String!) {
    createUserProfileLinks(userId: $userId, linkName: $linkName, linkUrl: $linkUrl) {
      id
      linkName
      linkUrl
    }
  }
`;


const UserProfile: React.FC = () => {
  console.log("UserProfile rendered");

  const params = useParams();
  const userId = params?.userId as string;
  console.log('userId',userId);
  const {user} = useAuth();
  console.log('userref',user);
  
  // State
  const [activeTab, setActiveTab] = useState<TabType>('uploads');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [userName, setUserName] = useState('');

  const [isEditingName, setIsEditingName] = useState(false);
  const [profileLinks, setProfileLinks] = useState<ProfileLink[]>([]);
  const [newLink, setNewLink] = useState({ linkName: '', linkUrl: '' });
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Queries and Mutations
  const { data: profileData, loading: profileLoading, error: profileError } = useQuery<{
    fetchUser: UserProfile;
  }>(FETCH_USER_PROFILE, {
    variables: { userId },
    skip: !userId,
    fetchPolicy: 'cache-and-network',
  });

  const [getNotes, { data: notesData, loading: notesLoading }] = useLazyQuery<{
    getNotes: NotesResponse;
  }>(GET_NOTES, {
    fetchPolicy: 'cache-and-network',
  });

  const [createProfilePic, { loading: uploadingPic }] = useMutation(CREATE_USER_PROFILE_PIC, {
    onError: (error) => console.error('Error uploading profile picture:', error),
  });

  const [createProfileLinks, { loading: addingLink }] = useMutation<{
    createUserProfileLinks: ProfileLink;
  }>(CREATE_USER_PROFILE_LINKS, {
    onError: (error) => console.error('Error adding profile link:', error),
  });

  const [deleteUserProfileLinks, { loading: deletingLink }] = useMutation<{
    deleteUserProfileLinks: boolean;
  }>(DELETE_PROFILE_LINK, {
    onError: (error) => console.error('Failed to delete link:', error),
  });
  const [createUserName,{loading:updatingName}]=useMutation<{
    createUserName:UserName;

  }>(CREATE_USER_NAME,{
    onError:(error)=>console.error('Failed to update name:', error),
  })

  // Memoized fetch notes function
  const fetchNotes = useCallback(() => {
    if (!userId || !user) return;
    console.log('userId in notes',userId);

    const variables: Record<string, any> = {
      page: 1,
      limit: 9,
         sortBy  :'LIKES_DESC',
      userId,
    };

    if (activeTab === 'saved') {
      variables.saved = true;
    } else if (activeTab === 'liked') {
      variables.userliked = true;
    }

    getNotes({ variables });
  }, [user,userId,  activeTab, getNotes]);

  // Effects
  useEffect(() => {
    if (profileData?.fetchUser) {
      setUserName(profileData.fetchUser.name || '');
      setProfileImage(profileData.fetchUser.profilePic);
      setProfileLinks(profileData.fetchUser.ProfileLinks || []);
    }
  }, [user,profileData]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Track initial load completion
  useEffect(() => {
    if (!profileLoading && !notesLoading && profileData && notesData) {
      setInitialLoadComplete(true);
    }
  }, [profileLoading, notesLoading, profileData, notesData]);

  // Input change handlers
  const handleLinkNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewLink(prev => ({ ...prev, linkName: e.target.value }));
  }, []);

  const handleLinkUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewLink(prev => ({ ...prev, linkUrl: e.target.value }));
  }, []);

  const handleUserNameChange = useCallback(
  async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setUserName(newName);
    try {
      await createUserName({
        variables: {
          userId,
          name: newName,
        },
      });
    } catch (error) {
      console.error('Error updating name:', error);
    }
  },
  [createUserName, userId]
);


  // Handlers
 const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    // 1️⃣ Prepare form data for Cloudinary
     const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET as string);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`;

  const res = await axios.post(url, formData);
  
  console.log('Cloudinary response:', res);
  console.log('object', res.data);
  console.log('uploaded successfully to Cloudinary')
    const data = await res.data;
    if (!res.data.secure_url) throw new Error("Image upload failed");

    const imageUrl = data.secure_url; // ✅ This is your Cloudinary public URL
    setProfileImage(imageUrl);

    // 3️⃣ Save the URL via GraphQL mutation
    await createProfilePic({
      variables: { userId, profileUrl: imageUrl },
      optimisticResponse: {
        createUserProfilePic: {
          __typename: 'User',
          profilePic: imageUrl,
        },
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    setProfileImage(profileData?.fetchUser?.profilePic || null);
  }
}, [userId, createProfilePic, profileData]);


  const addProfileLink = useCallback(async () => {
    if (!newLink.linkName.trim() || !newLink.linkUrl.trim()) return;

    try {
      const { data } = await createProfileLinks({
        variables: {
          userId,
          linkName: newLink.linkName.trim(),
          linkUrl: newLink.linkUrl.trim(),
        },
      });

      if (data?.createUserProfileLinks) {
        setProfileLinks(prev => [...prev, data.createUserProfileLinks]);
        setNewLink({ linkName: '', linkUrl: '' });
        setShowLinkForm(false);
      }
    } catch (error) {
      // Error handled by mutation onError
    }
  }, [newLink, userId, createProfileLinks]);

  const removeLink = useCallback(async (id: string) => {
    const previousLinks = [...profileLinks];
    
    setProfileLinks(prev => prev.filter(link => link.id !== id));

    try {
      await deleteUserProfileLinks({
        variables: { id },
      });
    } catch (error) {
      setProfileLinks(previousLinks);
    }
  }, [profileLinks, deleteUserProfileLinks]);

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  // Memoized values
  const stats = useMemo(() => ({
    totalLikes: profileData?.fetchUser?.likes || 0,
    totalSaves: profileData?.fetchUser?.saves || 0,
    totalViews: profileData?.fetchUser?.views || 0,
    netRating: 0,
  }), [profileData]);

  const notes = useMemo(() => notesData?.getNotes?.notes || [], [notesData]);

  // Show full screen loading spinner until both profile and notes are loaded
  const isInitialLoading = (profileLoading || notesLoading) && !initialLoadComplete;

  // Render helpers
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

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600" />
          <p className="text-gray-600 text-lg font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6 border border-purple-100">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Profile Image */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-4xl font-bold shadow-lg overflow-hidden">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  userName.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              {user?.uid==userId && (
                  <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPic}
                className="absolute bottom-0 right-0 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-all transform hover:scale-110 disabled:opacity-50"
              >
                <Camera size={18} />
              </button>

              )}
            
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                {(user?.uid===userId && isEditingName) ? (
                  <input
                    type="text"
                    value={userName}
                    onChange={handleUserNameChange}
                    onBlur={() => setIsEditingName(false)}
                    className="text-3xl font-bold text-gray-800 border-b-2 border-purple-400 focus:outline-none bg-transparent"
                    autoFocus
                  />
                ) : (
                  <h1
                    onClick={() => setIsEditingName(true)}
                    className="text-3xl font-bold text-gray-800 cursor-pointer hover:text-purple-600 transition-colors"
                  >
                    {userName || 'User'}
                  </h1>
                )}
              </div>

              <div className="flex items-center justify-center md:justify-start gap-2 mb-6">
                <Award className="text-yellow-500" size={24} />
                <span className="text-2xl font-bold text-gray-700">{stats.netRating || 'N/A'}</span>
                <span className="text-gray-500">Net Rating</span>
              </div>

              {/* Stats Grid */}
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

              {/* Profile Links */}
              <div className="space-y-3">
                <div className="flex items-center justify-center md:justify-start gap-2 text-gray-700 font-semibold mb-2">
                  <Link size={18} />
                  <span>Profile Links</span>
                </div>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {profileLinks.map((link) => (
                    <div key={link.id} className="bg-gray-100 px-4 py-2 rounded-full flex items-center gap-2 group">
                      <span className="text-sm font-medium text-gray-700">{link.linkName}:</span>
                      <a
                        href={link.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {link.linkUrl}
                      </a>
                      {
                        user?.uid===userId && 
                          <button
                        onClick={() => removeLink(link.id)}
                        disabled={deletingLink}
                        className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                      >
                        ×
                      </button>
                      }
                    
                    </div>
                  ))}
                  {user?.uid===userId && !showLinkForm && (
                    <button
                      onClick={() => setShowLinkForm(true)}
                      className="bg-purple-100 text-purple-600 px-4 py-2 rounded-full text-sm font-medium hover:bg-purple-200 transition-colors"
                    >
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
                      onChange={handleLinkNameChange}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                    <input
                      type="url"
                      placeholder="URL"
                      value={newLink.linkUrl}
                      onChange={handleLinkUrlChange}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                    <button
                      onClick={addProfileLink}
                      disabled={addingLink || !newLink.linkName.trim() || !newLink.linkUrl.trim()}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                      {addingLink ? 'Adding...' : 'Add'}
                    </button>
                    <button
                      onClick={() => {
                        setShowLinkForm(false);
                        setNewLink({ linkName: '', linkUrl: '' });
                      }}
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            <TabButton
              active={activeTab === 'uploads'}
              onClick={() => handleTabChange('uploads')}
              icon={Upload}
              label="My Uploads"
            />
            <TabButton
              active={activeTab === 'saved'}
              onClick={() => handleTabChange('saved')}
              icon={Bookmark}
              label="Saved Notes"
            />
            <TabButton
              active={activeTab === 'liked'}
              onClick={() => handleTabChange('liked')}
              icon={Heart}
              label="Liked Notes"
            />
          </div>

          <div className="p-6 bg-gradient-to-br from-gray-50 to-slate-50">
            {notesLoading && initialLoadComplete ? (
             <NoteLoader/>
            ) : notes.length === 0 ? (
              <EmptyState activeTab={activeTab} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.map((note) => (
                  <MemoizedNoteCard key={note.id} note={note} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Extracted Components
const MemoizedNoteCard = React.memo(NoteCard);

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.FC<{ className?: string; size?: number }>;
  label: string;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex-1 min-w-max px-6 py-4 font-bold transition-all ${
      active
        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
        : 'text-gray-600 hover:bg-gray-50'
    }`}
  >
    <Icon className="w-5 h-5 inline mr-2" />
    {label}
  </button>
);

const EmptyState: React.FC<{ activeTab: TabType }> = ({ activeTab }) => {
  const iconMap = {
    uploads: Upload,
    saved: Bookmark,
    liked: Heart,
  };
  
  const messageMap = {
    uploads: 'Start by uploading your first note',
    saved: 'Save notes to access them here',
    liked: 'Like notes to see them here',
  };

  const Icon = iconMap[activeTab];

  return (
    <div className="text-center py-20">
      <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="w-10 h-10 text-gray-400" />
      </div>
      <p className="text-gray-500 text-lg font-medium">No notes found</p>
      <p className="text-gray-400 text-sm mt-2">{messageMap[activeTab]}</p>
    </div>
  );
};

export default UserProfile;