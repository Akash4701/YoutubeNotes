'use client'
import React, { useState, useMemo } from 'react';
import { Search, TrendingUp, Clock, Upload, Heart, Calendar, User, ExternalLink, Play, FileText, Sparkles, Filter } from 'lucide-react';
import NoteCard from '@/components/NoteCard';

const YouTubeNotesPage = () => {
  // Mock data based on your Note model
  const mockNotes = [
    {
      id: 1,
      title: "React Hooks Deep Dive",
      youtube_url: "https://youtube.com/watch?v=abc123",
      likes: 245,
      contentCreater: "Tech Guru",
      channelName: "Programming Pro",
      thumbnail: "https://img.youtube.com/vi/abc123/maxresdefault.jpg",
      pdf_url: "https://example.com/notes1.pdf",
      userId: "user1",
      createdAt: "2024-09-05T10:30:00Z",
      updatedAt: "2024-09-05T10:30:00Z"
    },
    {
      id: 2,
      title: "JavaScript ES6 Features Explained",
      youtube_url: "https://youtube.com/watch?v=def456",
      likes: 189,
      contentCreater: "Code Master",
      channelName: "JS Academy",
      thumbnail: "https://img.youtube.com/vi/def456/maxresdefault.jpg",
      pdf_url: "https://example.com/notes2.pdf",
      userId: "user2",
      createdAt: "2024-09-04T15:20:00Z",
      updatedAt: "2024-09-04T15:20:00Z"
    },
    {
      id: 3,
      title: "Database Design Principles",
      youtube_url: "https://youtube.com/watch?v=ghi789",
      likes: 156,
      contentCreater: "Data Expert",
      channelName: "Database Hub",
      thumbnail: "https://img.youtube.com/vi/ghi789/maxresdefault.jpg",
      pdf_url: "https://example.com/notes3.pdf",
      userId: "user3",
      createdAt: "2024-09-03T09:15:00Z",
      updatedAt: "2024-09-03T09:15:00Z"
    },
    {
      id: 4,
      title: "Machine Learning Basics",
      youtube_url: "https://youtube.com/watch?v=jkl012",
      likes: 312,
      contentCreater: "AI Teacher",
      channelName: "ML World",
      thumbnail: "https://img.youtube.com/vi/jkl012/maxresdefault.jpg",
      pdf_url: "https://example.com/notes4.pdf",
      userId: "user4",
      createdAt: "2024-09-06T08:00:00Z",
      updatedAt: "2024-09-06T08:00:00Z"
    },
    {
      id: 5,
      title: "CSS Grid Layout Tutorial",
      youtube_url: "https://youtube.com/watch?v=mno345",
      likes: 98,
      contentCreater: "Design Pro",
      channelName: "CSS Masters",
      thumbnail: "https://img.youtube.com/vi/mno345/maxresdefault.jpg",
      pdf_url: "https://example.com/notes5.pdf",
      userId: "user5",
      createdAt: "2024-09-02T14:45:00Z",
      updatedAt: "2024-09-02T14:45:00Z"
    },
    {
      id: 6,
      title: "Node.js Performance Optimization",
      youtube_url: "https://youtube.com/watch?v=pqr678",
      likes: 267,
      contentCreater: "Backend Expert",
      channelName: "Server Side",
      thumbnail: "https://img.youtube.com/vi/pqr678/maxresdefault.jpg",
      pdf_url: "https://example.com/notes6.pdf",
      userId: "user6",
      createdAt: "2024-09-01T11:30:00Z",
      updatedAt: "2024-09-01T11:30:00Z"
    },
    {
      id: 7,
      title: "Python Data Science Masterclass",
      youtube_url: "https://youtube.com/watch?v=xyz789",
      likes: 423,
      contentCreater: "Data Scientist Pro",
      channelName: "Python Hub",
      thumbnail: "https://img.youtube.com/vi/xyz789/maxresdefault.jpg",
      pdf_url: "https://example.com/notes7.pdf",
      userId: "user7",
      createdAt: "2024-09-07T16:20:00Z",
      updatedAt: "2024-09-07T16:20:00Z"
    },
    {
      id: 8,
      title: "Advanced TypeScript Patterns",
      youtube_url: "https://youtube.com/watch?v=uvw456",
      likes: 178,
      contentCreater: "TS Expert",
      channelName: "TypeScript World",
      thumbnail: "https://img.youtube.com/vi/uvw456/maxresdefault.jpg",
      pdf_url: "https://example.com/notes8.pdf",
      userId: "user8",
      createdAt: "2024-09-06T12:15:00Z",
      updatedAt: "2024-09-06T12:15:00Z"
    }
  ];

  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState('all');
  const [activeSection, setActiveSection] = useState('trending');

  // Enhanced search functionality
  const filteredNotes = useMemo(() => {
    if (!searchTerm) return mockNotes;

    return mockNotes.filter(note => {
      const term = searchTerm.toLowerCase();
      
      switch (searchBy) {
        case 'title':
          return note.title.toLowerCase().includes(term);
        case 'creator':
          return note.contentCreater?.toLowerCase().includes(term);
        case 'channel':
          return note.channelName?.toLowerCase().includes(term);
        case 'url':
          return note.youtube_url.toLowerCase().includes(term);
        case 'all':
        default:
          return (
            note.title.toLowerCase().includes(term) ||
            note.contentCreater?.toLowerCase().includes(term) ||
            note.channelName?.toLowerCase().includes(term) ||
            note.youtube_url.toLowerCase().includes(term)
          );
      }
    });
  }, [searchTerm, searchBy]);

  // Get notes for different sections
  const getTrendingNotes = () => filteredNotes.sort((a, b) => (b.likes || 0) - (a.likes || 0));
  const getNewlyUploadedNotes = () => filteredNotes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const getAllNotes = () => filteredNotes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getCurrentNotes = () => {
    switch (activeSection) {
      case 'trending':
        return getTrendingNotes();
      case 'newly-uploaded':
        return getNewlyUploadedNotes();
      case 'all-notes':
        return getAllNotes();
      default:
        return getTrendingNotes();
    }
  };

 
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-60 h-60 bg-pink-300/10 rounded-full blur-3xl animate-ping delay-500"></div>
      </div>

      {/* Header with glassmorphism effect */}
      <div className="relative bg-white/80 backdrop-blur-xl shadow-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
             
              <p className="text-gray-600 text-lg font-medium">Discover amazing educational content ✨</p>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-2xl shadow-lg">
                <span className="font-bold text-lg">{filteredNotes.length}</span>
                <span className="ml-2 opacity-90">Notes</span>
              </div>
            </div>
          </div>

          {/* Enhanced Search Section */}
          <div className="relative">
            <div className="flex flex-col lg:flex-row gap-6 items-stretch">
              {/* Main search input */}
              <div className="flex-1 relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-focus-within:opacity-40 transition-opacity duration-300"></div>
                <div className="relative bg-white rounded-2xl border border-gray-200 shadow-lg">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                  <input
                    type="text"
                    placeholder="Search your perfect learning content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-lg font-medium"
                  />
                </div>
              </div>
              
              {/* Search filter dropdown */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-teal-500 rounded-2xl blur opacity-25 group-focus-within:opacity-40 transition-opacity duration-300"></div>
                <select
                  value={searchBy}
                  onChange={(e) => setSearchBy(e.target.value)}
                  className="relative bg-white border border-gray-200 px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-semibold text-gray-700 shadow-lg appearance-none cursor-pointer min-w-48"
                >
                  <option value="all">🔍 Search Everything</option>
                  <option value="title">📝 Search by Title</option>
                  <option value="creator">👤 Search by Creator</option>
                  <option value="channel">📺 Search by Channel</option>
                  <option value="url">🔗 Search by URL</option>
                </select>
                <Filter className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Navigation with enhanced design */}
      <div className="relative bg-white/60 backdrop-blur-lg border-b border-white/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-2">
            {[
              { id: 'trending', label: 'Trending', icon: TrendingUp, color: 'from-red-500 to-pink-500' },
              { id: 'newly-uploaded', label: 'Fresh Content', icon: Clock, color: 'from-green-500 to-teal-500' },
              { id: 'all-notes', label: 'All Notes', icon: Upload, color: 'from-blue-500 to-purple-500' }
            ].map(({ id, label, icon: Icon, color }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`flex items-center gap-3 px-6 py-4 rounded-t-2xl font-bold transition-all duration-300 relative overflow-hidden ${
                  activeSection === id
                    ? `bg-gradient-to-r ${color} text-white shadow-lg transform -translate-y-1`
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
                {activeSection === id && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notes Grid with enhanced spacing */}
      <div className="relative max-w-7xl mx-auto px-6 py-12">
        {getCurrentNotes().length === 0 ? (
          <div className="text-center py-20">
            <div className="text-8xl mb-6 animate-bounce">🔍</div>
            <h3 className="text-3xl font-bold text-gray-700 mb-4">No notes found</h3>
            <p className="text-gray-500 text-lg">Try a different search term or filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {getCurrentNotes().map((note, index) => (
              <NoteCard key={note.id} note={note} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default YouTubeNotesPage;