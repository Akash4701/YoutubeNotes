'use client'
import { useAuth } from "@/lib/context/AuthContext";
import { Search, Star, BookOpen, DollarSign, ArrowRight,Award, Zap, PlayCircle,  Sparkles } from "lucide-react";
import { redirect } from "next/navigation";
import { Bounce, toast } from "react-toastify";

export default function Home() {
  const {loading,user}=useAuth();

const handleProfile=()=>{
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
      redirect(`/user/${user?.uid}`)
    }

}
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
    <div className="min-h-screen bg-white">
      
      <div className="min-w-auto mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-16">
        
        {/* Hero Section */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 px-6 py-2.5 rounded-full text-sm font-semibold mb-8 border border-purple-200 shadow-sm">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-base">Your YouTube Learning Superpower</span>
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">
            Notes That Capture What
            <br />
            <span className="relative inline-block mt-2">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                AI Can't Understand
              </span>
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-full"></div>
            </span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-gray-700 mb-4  mx-auto leading-relaxed font-medium">
            Diagrams. Formulas. Code snippets. Real insights.
          </p>
          <p className="text-lg text-gray-600 mb-12 max-w-3xl mx-auto">
            Find expert-crafted study notes for any YouTube video, or create and sell your own. 
            <span className="text-purple-600 font-semibold"> Better than AI, made by humans.</span>
          </p>
          
          {/* Enhanced Search Bar */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative flex items-center bg-white rounded-2xl shadow-2xl border-2 border-gray-200 px-6 py-5 w-full sm:flex-1 group hover:border-purple-400 hover:shadow-purple-100 transition-all duration-300">
                <Search className="w-6 h-6 text-gray-400 mr-3 group-hover:text-purple-600 transition-colors" />
                <input 
                  type="text" 
               
                  
                  placeholder="Paste any YouTube URL to discover notes..."
                  className="flex-1 outline-none text-gray-800 text-lg placeholder-gray-400"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSearch();
                    }
                  }}
                />
                <PlayCircle className="w-6 h-6 text-red-500" />
              </div>
              <button 
                onClick={handleSearch}
                className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white px-10 py-5 rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 font-bold text-lg flex items-center space-x-2 group shadow-lg shadow-purple-300 whitespace-nowrap"
              >
                <span>Find Notes</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
            <div className="flex items-center justify-center space-x-6 mt-5 text-sm text-gray-600">
              
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span className="font-medium">Instant Access</span>
              </div>
            </div>
          </div>

         
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-4 mb-5">
          <div className="bg-white rounded-3xl p-10 shadow-xl border-2 border-gray-100 hover:shadow-2xl hover:border-purple-200 transition-all duration-300 transform hover:-translate-y-3 group">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Discover Premium Notes</h3>
            <p className="text-gray-600 leading-relaxed text-base mb-4">
              Access handcrafted study notes with detailed diagrams, mathematical formulas, and code examples for any YouTube video.
            </p>
            <div className="flex items-center text-green-600 font-semibold text-sm group-hover:translate-x-2 transition-transform duration-300">
              <span>Browse notes</span>
             
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-10 shadow-xl border-2 border-purple-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-3 group relative overflow-hidden">
            <div className="absolute top-3 right-3 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold">
              COMING SOON
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Earn From Your Expertise</h3>
            <p className="text-gray-700 leading-relaxed text-base mb-4">
              Transform your study notes into passive income. Set your own prices, build your reputation, and get paid for helping others learn.
            </p>
           
          </div>
          
          <div className="bg-white rounded-3xl p-10 shadow-xl border-2 border-gray-100 hover:shadow-2xl hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-3 group">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Community-Verified Quality</h3>
            <p className="text-gray-600 leading-relaxed text-base mb-4">
              Like, review, and discover the best notes. Our ranking system ensures top quality always rises to the top.
            </p>
            <div className="flex items-center text-orange-600 font-semibold text-sm group-hover:translate-x-2 transition-transform duration-300">
              <span>See top-rated notes</span>
              
            </div>
          </div>
        </div>

       

        {/* CTA Section */}
        
        <div className="mt-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Learning?</h2>
          <p className="text-xl mb-8 opacity-90">Join thousands of learners and creators already using NoteHub</p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button onClick={handleSearch} className="bg-white text-purple-600 px-8 py-4 rounded-full font-semibold hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              Start Learning
            </button>
            <button onClick={handleProfile}className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-purple-600 transition-all duration-300">
              Become a Creator
            </button>
          </div>
        </div>


     
      </div>
    </div>
  );
}