'use client'

import { BookOpen } from 'lucide-react'
import React, { useState } from 'react'
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
import UploadNotes from './UploadNotes'
import Link from 'next/link'
import { Bounce, toast } from 'react-toastify'
import { useRouter } from 'next/navigation'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/client/react'



const FETCH_USER = gql`
  query FetchUserNavbarProfile {
    fetchUserNavbarProfile {
      id
      profilePic
    }
  }
`

function Navbar() {
  const { loading } = useAuth()
  const router = useRouter()
  const [openUpload, setOpenUpload] = useState(false) 

  const { data, loading: fetching } = useQuery(FETCH_USER, {
    skip: loading, // Skip query if user is not authenticated
  })

  const user = data?.fetchUserNavbarProfile

  const handleHomeClick = (e: React.MouseEvent) => {
    if (loading) {
      e.preventDefault()
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
    } else {
      router.push('/home')
    }
  }

  const handleUserProfileClick = () => {
    if (user?.id) {
      router.push(`/user/${user.id}`)
    }
  }

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <Link
              href="/"
              className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
            >
              TubeNoter
            </Link>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={handleHomeClick}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Home
            </button>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
              How it Works
            </a>
          </div>

          {/* Auth buttons */}
          {!loading ? (
            <div className="flex items-center space-x-4 flex-row">
              <Dialog open={openUpload} onOpenChange={setOpenUpload}>
                <DialogTrigger
                  asChild
                >
                  <button className="text-gray-600 hover:text-gray-900 transition-colors">
                    Upload Notes
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle></DialogTitle>
                  <UploadNotes />
                </DialogContent>
              </Dialog>
              
              {/* User Profile Icon */}
              <button
                onClick={handleUserProfileClick}
                className="relative group"
                disabled={fetching}
              >
                <div className="w-10 h-10 rounded-full ring-2 ring-purple-600 ring-offset-2 overflow-hidden hover:ring-purple-700 transition-all duration-300 transform hover:scale-105">
                  {user?.profilePic ? (
                    <img
                      src={user.profilePic}
                      alt="User profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white font-semibold">
                      {user?.id?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
              </button>
              
              <SignOut />
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Dialog>
                <DialogTrigger className="text-gray-600 hover:text-gray-900 transition-colors">
                  Sign In
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle>Welcome to </DialogTitle>
                  <SignIn />
                </DialogContent>
              </Dialog>
              <Dialog>
                <DialogTrigger className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
                  Get Started
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle>Welcome to </DialogTitle>
                  <SignUp />
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar