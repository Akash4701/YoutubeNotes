'use client'

import { BookOpen } from 'lucide-react'
import React, { useEffect } from 'react'
import {
  Dialog,
  DialogContent,
 
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import SignUp from './SignUp'
import SignIn from './SignIn'
import { useAuth } from '@/lib/context/AuthContext'
import SignOut from './SignOut'
import { Button } from './ui/button'
import UploadNotes from './UploadNotes'

function navbar() {
  const loader=useAuth().loading;

 
  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                NoteHub
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Browse</a>
              <Button  className="text-gray-600 hover:text-gray-900 transition-colors">Upload Notes</Button>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">How it Works</a>
            </div>
             {!loader ? ( 
              <div className='flex items-center space-x-4 flex-row'>
              <Dialog>
  <DialogTrigger className="text-gray-600 hover:text-gray-900 transition-colors" >
    Upload Notes</DialogTrigger>
  <DialogContent>
    <DialogTitle>Welcome to </DialogTitle>
   <UploadNotes/>
  </DialogContent>
</Dialog>
              <SignOut/>
              </div>

             ):(
               <div className="flex items-center space-x-4">
             
              
             <Dialog>
  <DialogTrigger className="text-gray-600 hover:text-gray-900 transition-colors" >
    Sign In</DialogTrigger>
  <DialogContent>
    <DialogTitle>Welcome to </DialogTitle>
   <SignIn/>
  </DialogContent>
</Dialog>
              <Dialog>
  <DialogTrigger className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5" >
    Get Started</DialogTrigger>
  <DialogContent>
    <DialogTitle>Welcome to </DialogTitle>
   <SignUp/>
  </DialogContent>
</Dialog>
            </div>
                
              )}
           
          </div>
        </div>
      </nav>
  )
}

export default navbar