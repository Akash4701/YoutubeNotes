'use client'
import { Search, Star, BookOpen, DollarSign, Users } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { Bounce, toast } from "react-toastify";
import { redirect } from "next/navigation";


export default function Home() {
  const loading=useAuth().loading

  const handleSearch=()=>{
    if(loading){
       toast.warn('You are not authenticated', {
              position: "top-right",
              autoClose: 1999,
              hideProgressBar: false,
              closeOnClick: false,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "dark",
              transition: Bounce,
            })

    }else{
      redirect('/home')
    }



  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-7 pb-6">
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-800 px-4  rounded-full text-sm font-medium mb-8">
            <Star className="w-4 h-4" />
            <span className="text-lg">The Future of Learning from YouTube</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Notes That Capture What AI Misses: 
            <br />
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
             Diagrams, Formulas & Code
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Discover curated study notes, summaries, and guides for any YouTube video. 
            Learn faster, study smarter, or monetize your expertise by creating notes for others.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
            <div className="flex items-center bg-white rounded-full shadow-lg border border-gray-200 px-6 py-3 w-full sm:w-96">
              <Search className="w-5 h-5 text-gray-400 mr-3" />
              <input 
                type="text" 
                placeholder="Paste any YouTube URL to find notes..."
                className="flex-1 outline-none text-gray-700"
                onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          handleSearch();
        }
      }
    }
              />
            </div>
            <button onClick={handleSearch}className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-full hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 font-medium">
              Search Notes
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl flex items-center justify-center mb-6">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Find Quality Notes</h3>
            <p className="text-gray-600 leading-relaxed">
              Browse thousands of curated study notes, summaries, and guides for YouTube lectures, tutorials, and educational content.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl flex items-center justify-center mb-6">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Monetize Your Knowledge</h3>
            <p className="text-gray-600 leading-relaxed">
              Create and sell your own study notes. Set your price, build your reputation, and earn from your expertise.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-xl flex items-center justify-center mb-6">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Community Driven</h3>
            <p className="text-gray-600 leading-relaxed">
              Rate, review, and discover the best notes through our community-powered ranking system. Quality content rises to the top.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Learning?</h2>
          <p className="text-xl mb-8 opacity-90">Join thousands of learners and creators already using NoteHub</p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button className="bg-white text-purple-600 px-8 py-4 rounded-full font-semibold hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              Start Learning
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-purple-600 transition-all duration-300">
              Become a Creator
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-gray-900 mb-2">10K+</div>
            <div className="text-gray-600">Study Notes</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900 mb-2">5K+</div>
            <div className="text-gray-600">Active Users</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900 mb-2">500+</div>
            <div className="text-gray-600">Creators Earning</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900 mb-2">50K+</div>
            <div className="text-gray-600">Videos Covered</div>
          </div>
        </div>
      </div>
    </div>
  );
}