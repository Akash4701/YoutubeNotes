import { Calendar, ExternalLink, FileText, Heart, Play, Sparkles, User } from 'lucide-react';
import React from 'react'

function NoteCard ({ note, index }: { note: any; index: number }){
     const getGradientClass = (index: number) => {
    const gradients = [
      'from-purple-600 via-pink-600 to-blue-600',
      'from-green-500 via-teal-500 to-blue-500',
      'from-orange-500 via-red-500 to-pink-500',
      'from-blue-600 via-purple-600 to-indigo-600',
      'from-yellow-500 via-orange-500 to-red-500',
      'from-teal-500 via-cyan-500 to-blue-500'
    ];
}

    const formatDate = (dateString: any) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };


    return(
    <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-gray-100">
      {/* Animated background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getGradientClass(index)} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
      
      {/* Thumbnail with overlay */}
      <div className="relative overflow-hidden">
        <div className={`w-full h-56 bg-gradient-to-br ${getGradientClass(index)} flex items-center justify-center relative`}>
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/30 animate-pulse"></div>
            <div className="absolute top-8 right-8 w-6 h-6 rounded-full bg-white/20 animate-bounce delay-100"></div>
            <div className="absolute bottom-6 left-8 w-4 h-4 rounded-full bg-white/25 animate-ping delay-300"></div>
          </div>
          
          {/* Video icon with animation */}
          <div className="relative z-10 transform group-hover:scale-110 transition-transform duration-300">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
              <Play className="w-8 h-8 text-white ml-1" />
            </div>
          </div>
          
          {/* Floating sparkles */}
          <Sparkles className="absolute top-6 right-6 w-6 h-6 text-white/60 animate-pulse" />
        </div>
        
        {/* Likes badge with glow effect */}
        <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md text-white px-3 py-2 rounded-full text-sm flex items-center gap-2 border border-white/20">
          <Heart className="w-4 h-4 text-red-400" />
          <span className="font-semibold">{note.likes || 0}</span>
        </div>
        
        {/* Play button overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-6 h-6 text-gray-800" />
          </div>
        </div>
      </div>

      {/* Content */}
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
            href={note.pdf_url}
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