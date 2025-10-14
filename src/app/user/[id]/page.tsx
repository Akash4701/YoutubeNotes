'use client'
import React, { useState, useRef } from 'react';
import { Camera, Heart, Bookmark, Eye, Link2, Award, Upload, ThumbsUp } from 'lucide-react';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('uploads');
  const [profileImage, setProfileImage] = useState(null);
  const [userName, setUserName] = useState('Alex Johnson');
  const [isEditingName, setIsEditingName] = useState(false);
  const [profileLinks, setProfileLinks] = useState([
    { platform: 'YouTube', url: 'youtube.com/@alexjohnson' },
    { platform: 'Twitter', url: 'twitter.com/alexj' }
  ]);
  const [newLink, setNewLink] = useState({ platform: '', url: '' });
  const [showLinkForm, setShowLinkForm] = useState(false);
  const fileInputRef = useRef(null);

  // Mock data - replace with actual API calls
  const stats = {
    totalLikes: 1247,
    totalSaves: 892,
    totalViews: 15634,
    netRating: 4.7
  };

  const mockNotes = {
    uploads: [
      { id: 1, title: 'Advanced React Patterns', thumbnail: '🎯', likes: 234, saves: 189, views: 1200, price: '$9.99' },
      { id: 2, title: 'Node.js Best Practices', thumbnail: '⚡', likes: 189, saves: 145, views: 980, price: '$7.99' },
      { id: 3, title: 'TypeScript Deep Dive', thumbnail: '🔷', likes: 312, saves: 267, views: 1450, price: '$12.99' }
    ],
    saved: [
      { id: 4, title: 'Web Performance Tips', thumbnail: '🚀', likes: 445, saves: 389, views: 2100, price: '$8.99', author: 'John Doe' },
      { id: 5, title: 'CSS Grid Mastery', thumbnail: '🎨', likes: 298, saves: 234, views: 1560, price: '$6.99', author: 'Jane Smith' }
    ],
    liked: [
      { id: 6, title: 'JavaScript Algorithms', thumbnail: '🧮', likes: 567, saves: 456, views: 2890, price: '$11.99', author: 'Mike Wilson' },
      { id: 7, title: 'React Testing Guide', thumbnail: '✅', likes: 389, saves: 312, views: 1780, price: '$9.99', author: 'Sarah Lee' }
    ]
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addProfileLink = () => {
    if (newLink.platform && newLink.url) {
      setProfileLinks([...profileLinks, newLink]);
      setNewLink({ platform: '', url: '' });
      setShowLinkForm(false);
    }
  };

  const removeLink = (index) => {
    setProfileLinks(profileLinks.filter((_, i) => i !== index));
  };

  const getCurrentNotes = () => {
    switch(activeTab) {
      case 'uploads': return mockNotes.uploads;
      case 'saved': return mockNotes.saved;
      case 'liked': return mockNotes.liked;
      default: return [];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Profile Header */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6 border border-purple-100">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Profile Image */}
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
                  <h1 
                    onClick={() => setIsEditingName(true)}
                    className="text-3xl font-bold text-gray-800 cursor-pointer hover:text-purple-600 transition-colors"
                  >
                    {userName}
                  </h1>
                )}
              </div>

              {/* Net Rating */}
              <div className="flex items-center justify-center md:justify-start gap-2 mb-6">
                <Award className="text-yellow-500" size={24} />
                <span className="text-2xl font-bold text-gray-700">{stats.netRating}</span>
                <span className="text-gray-500">Net Rating</span>
              </div>

              {/* Stats */}
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
                  <div className="text-2xl font-bold text-gray-800">{stats.totalViews.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Views</div>
                </div>
              </div>

              {/* Profile Links */}
              <div className="space-y-3">
                <div className="flex items-center justify-center md:justify-start gap-2 text-gray-700 font-semibold mb-2">
                  <Link2 size={18} />
                  <span>Profile Links</span>
                </div>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {profileLinks.map((link, index) => (
                    <div key={index} className="bg-gray-100 px-4 py-2 rounded-full flex items-center gap-2 group">
                      <span className="text-sm font-medium text-gray-700">{link.platform}:</span>
                      <span className="text-sm text-gray-600">{link.url}</span>
                      <button
                        onClick={() => removeLink(index)}
                        className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {!showLinkForm && (
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
                      placeholder="Platform"
                      value={newLink.platform}
                      onChange={(e) => setNewLink({ ...newLink, platform: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                    <input
                      type="text"
                      placeholder="URL"
                      value={newLink.url}
                      onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                    <button
                      onClick={addProfileLink}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setShowLinkForm(false)}
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

        {/* Tabs */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-purple-100">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('uploads')}
              className={`flex-1 py-4 px-6 font-semibold transition-all ${
                activeTab === 'uploads'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Upload size={20} />
                <span>My Uploads</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex-1 py-4 px-6 font-semibold transition-all ${
                activeTab === 'saved'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Bookmark size={20} />
                <span>Saved Notes</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('liked')}
              className={`flex-1 py-4 px-6 font-semibold transition-all ${
                activeTab === 'liked'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <ThumbsUp size={20} />
                <span>Liked Notes</span>
              </div>
            </button>
          </div>

          {/* Notes Grid */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getCurrentNotes().map((note) => (
                <div
                  key={note.id}
                  className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 border border-gray-100"
                >
                  <div className="text-5xl mb-4 text-center">{note.thumbnail}</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{note.title}</h3>
                  {note.author && (
                    <p className="text-sm text-gray-500 mb-3">by {note.author}</p>
                  )}
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl font-bold text-purple-600">{note.price}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 border-t border-gray-200 pt-4">
                    <div className="flex items-center gap-1">
                      <Heart size={16} className="text-pink-500" />
                      <span>{note.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bookmark size={16} className="text-purple-500" />
                      <span>{note.saves}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye size={16} className="text-blue-500" />
                      <span>{note.views}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;