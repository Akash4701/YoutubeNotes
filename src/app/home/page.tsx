'use client'
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, TrendingUp, Clock, Upload, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { useQuery, useLazyQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import NoteCard from '@/components/NoteCard';
import { useAuth } from '@/lib/context/AuthContext';
import { Bounce, toast } from 'react-toastify';
import NoteLoader from '@/components/ui/NoteLoader';
import { useRouter } from 'next/navigation';

type User = {
  profilePic?: string;
  // add more user fields if needed
};

type Note = {
  id: string;
  title: string;
  youtube_url?: string;
  likesCount?: number;
  savedByMe?: boolean;
  user?: User;
  viewsCount?: number;
  likedByMe?: boolean;
  contentCreater?: string;
  channelName?: string;
  thumbnail?: string;
  pdf_url?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
};

type NotesResponse = {
  notes: Note[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

// GraphQL Queries with offset pagination
const GET_NOTES = gql`
  query GetNotes($page: Int!, $limit: Int!, $sortBy: SortOrder!) {
    getNotes(page: $page, limit: $limit, sortBy: $sortBy) {
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

const SEARCH_NOTES = gql`
  query SearchNotes($searchTerm: String!, $searchBy: SearchField!, $page: Int!, $limit: Int!) {
    searchNotes(searchTerm: $searchTerm, searchBy: $searchBy, page: $page, limit: $limit) {
      notes {
        id
        title
        youtube_url
        likesCount                                            
        contentCreater
        channelName
        likedByMe
        thumbnail
        pdf_url
        userId
        savedByMe
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

// Custom hook for debouncing
const useDebounce = (value:string, delay:number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const YouTubeNotesPage = () => {
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState('TITLE');
  const [activeSection, setActiveSection] = useState('trending');
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  
  const ITEMS_PER_PAGE = 9;
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const getSortType = useCallback(() => {
    switch (activeSection) {
      case 'trending':
        return 'TREND_DESC';
      case 'newly-uploaded':
        return 'CREATED_AT_DESC';
      case 'all-notes':
        return 'CREATED_AT_ASC';
      default:
        return 'TREND_DESC';
    }
  }, [activeSection]);

  const { user } = useAuth();
  
  const [getNotes, { data: notesData, loading: notesLoading, error: notesError }] = useLazyQuery<{getNotes:NotesResponse}>(GET_NOTES);

  // Function to fetch notes
  const fetchNotes = useCallback((page = currentPage) => {
    if(!user) return;
    
      getNotes({
        variables: {
          page,
          limit: ITEMS_PER_PAGE,
          sortBy: getSortType(),
        },
        
      });
    
  }, [user, currentPage, getNotes, getSortType]);

  // Initial fetch when user is available
  const router=useRouter();
  useEffect(() => {
      if ( user === undefined) return; // wait until it’s set
  if (!user) {
    toast.warn('You are not registered yet! Please register', { 
         position: "top-right",
              autoClose: 1999,
              hideProgressBar: false,
              closeOnClick: false,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "dark",
              transition: Bounce,



     });
     router.push("/")
    return;
  }
    fetchNotes(1);
  }, [user, getSortType()]);

  console.log('notesData:', notesData);

  // Lazy query for searching notes
  const [searchNotes, { data: searchData, loading: searchLoading, error: searchError }] = useLazyQuery<{searchNotes:NotesResponse}>(SEARCH_NOTES);

  // Effect to handle search
  useEffect(() => {
    if (debouncedSearchTerm.trim()) {
      setIsSearching(true);
      setCurrentPage(1);
      
      searchNotes({
        variables: {
          searchTerm: debouncedSearchTerm,
          searchBy,
          page: 1,
          limit: ITEMS_PER_PAGE
        }
      });
    } else {
      setIsSearching(false);
      setCurrentPage(1);
    }
  }, [debouncedSearchTerm, searchBy, searchNotes, user]);

  // Effect to refetch notes when section or page changes (only if not searching)
  useEffect(() => {
    if (!isSearching && user) {
      fetchNotes(currentPage);
    }
  }, [activeSection, currentPage, isSearching, fetchNotes, user]);

  // Effect to handle search pagination
  useEffect(() => {
    if (isSearching && debouncedSearchTerm.trim() && currentPage > 1) {
      searchNotes({
        variables: {
          searchTerm: debouncedSearchTerm,
          searchBy,
          page: currentPage,
          limit: ITEMS_PER_PAGE
        },
        
      });
    }
  }, [currentPage, isSearching, debouncedSearchTerm, searchBy, searchNotes, user]);

  // Get current data and pagination info
  const currentData = isSearching ? searchData?.searchNotes : notesData?.getNotes;
  const currentNotes = currentData?.notes || [];
  const totalCount = currentData?.totalCount || 0;
  const totalPages = currentData?.totalPages || 1;
  const hasNextPage = currentData?.hasNextPage || false;
  const hasPreviousPage = currentData?.hasPreviousPage || false;
  const pageNumber = currentData?.currentPage || currentPage;
  const isLoading = isSearching ? searchLoading : notesLoading;
  const error = isSearching ? searchError : notesError;

  // Handle section change
  const handleSectionChange = useCallback((section:string) => {
    setActiveSection(section);
    setCurrentPage(1);
    if (isSearching) {
      setSearchTerm('');
      setIsSearching(false);
    }
  }, [isSearching]);

  // Handle search term change
  const handleSearchChange = useCallback((e:React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  // Handle search filter change
 const handleSearchByChange = useCallback(
  (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchBy(e.target.value as 'TITLE' | 'CREATOR' | 'CHANNEL' | 'URL');
    setCurrentPage(1);
  },
  []
);

  // Handle page change
  const handlePageChange = useCallback((newPage:number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      // Scroll to top smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [totalPages]);

  // Generate pagination numbers
  const getPaginationNumbers = useMemo(() => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    // Always include first page
    if (totalPages > 0) {
      rangeWithDots.push(1);
    }

    // Calculate range around current page
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    // Add dots and range
    if (currentPage - delta > 2) {
      rangeWithDots.push('...');
    }

    rangeWithDots.push(...range);

    // Add dots and last page
    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...');
    }

    if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    // Remove duplicates
    return rangeWithDots.filter((item, index, arr) => {
      return arr.indexOf(item) === index;
    });
  }, [currentPage, totalPages]);

 

  // Error component
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

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
        <div className="min-w-auto mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                YouTube Notes Hub
              </h1>
              <p className="text-gray-600 text-lg font-medium">Discover amazing educational content ✨</p>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-2xl shadow-lg">
                <span className="font-bold text-lg">{totalCount}</span>
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
                  <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 transition-colors ${
                    isLoading ? 'text-blue-500 animate-spin' : 'text-gray-400'
                  }`} />
                  <input
                    type="text"
                    placeholder="Search your perfect learning content..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full pl-12 pr-6 py-4 bg-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-lg font-medium"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
              
              {/* Search filter dropdown */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-teal-500 rounded-2xl blur opacity-25 group-focus-within:opacity-40 transition-opacity duration-300"></div>
                <select
                  value={searchBy}
                  onChange={handleSearchByChange}
                  className="relative bg-white border border-gray-200 px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-semibold text-gray-700 shadow-lg appearance-none cursor-pointer min-w-48"
                >
                  <option value="TITLE">📝 Search by Title</option>
                  <option value="CREATOR">👤 Search by Creator</option>
                  <option value="CHANNEL">📺 Search by Channel</option>
                  <option value="URL">🔗 Search by URL</option>
                </select>
                <Filter className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Navigation - Hidden during search */}
      {!isSearching && (
  <div className="relative bg-white/60 backdrop-blur-lg border-b border-white/30">
    <div className="w-full  mx-auto px-4">
      <div className="flex justify-between items-center divide-x divide-black/10">
        {[
          { id: 'trending', label: 'Trending', icon: TrendingUp, color: 'from-red-500 to-pink-500' },
          { id: 'newly-uploaded', label: 'Fresh Content', icon: Clock, color: 'from-green-500 to-teal-500' },
          { id: 'all-notes', label: 'All Notes', icon: Upload, color: 'from-blue-500 to-purple-500' }
        ].map(({ id, label, icon: Icon, color }) => (
          <button
            key={id}
            onClick={() => handleSectionChange(id)}
            className={`flex-1 mx-2 flex items-center justify-center gap-3 py-4 rounded-t-2xl font-bold transition-all duration-300 relative overflow-hidden ${
              activeSection === id
                ? `bg-gradient-to-r ${color} text-white shadow-lg transform -translate-y-1`
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
            {activeSection === id && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 rounded-full"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  </div>
)}


      {/* Search Results Header */}
      {isSearching && debouncedSearchTerm && (
        <div className="relative bg-white/60 backdrop-blur-lg border-b border-white/30">
          <div className="min-w-auto mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Search className="w-6 h-6 text-purple-600" />
                <span className="text-lg font-semibold text-gray-700">
                  Search results for "{debouncedSearchTerm}"
                </span>
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                  {totalCount} results
                </span>
              </div>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setIsSearching(false);
                }}
                className="text-gray-500 hover:text-gray-700 font-medium"
              >
                Clear search
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes Grid */}
      <div className="relative min-w-auto mx-auto px-6 py-12">
        {isLoading ? (
          <NoteLoader />
        ) : currentNotes.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-8xl mb-6 animate-bounce">
              {isSearching ? '🔍' : '📚'}
            </div>
            <h3 className="text-3xl font-bold text-gray-700 mb-4">
              {isSearching ? 'No search results found' : 'No notes available'}
            </h3>
            <p className="text-gray-500 text-lg">
              {isSearching ? 'Try a different search term or filter' : 'Check back later for new content'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {currentNotes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !isLoading && (
          <div className="flex justify-center items-center mt-12 gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!hasPreviousPage}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white shadow-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex gap-2">
              {getPaginationNumbers.map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === 'number' && handlePageChange(page)}
                  disabled={page === '...'}
                  className={`w-12 h-12 rounded-xl font-bold transition-all duration-200 ${
                    page === currentPage
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : page === '...'
                      ? 'text-gray-400 cursor-default'
                      : 'bg-white text-gray-700 hover:bg-gray-50 shadow-lg border border-gray-200'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!hasNextPage}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white shadow-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Page info */}
        {totalCount > 0 && !isLoading && (
          <div className="text-center mt-6 text-gray-500">
            <div className="flex items-center justify-center gap-2">
              <span>
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} notes
              </span>
              <span>•</span>
              <span>Page {currentPage} of {totalPages}</span>
            </div>
            {isSearching && (
              <div className="mt-2 text-sm">
                Search results for "{debouncedSearchTerm}" in {searchBy.toLowerCase().replace('_', ' ')}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default YouTubeNotesPage;