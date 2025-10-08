import { getAuth, signOut } from 'firebase/auth'
import React from 'react'
import { Button } from './ui/button';
import { Bounce, toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

function SignOut() {
  const router = useRouter();
  const auth = getAuth();
  const handleLogOut = async () => {
    try {
      await signOut(auth);

      toast.success('User signed out successfully', {
        position: "top-right",
        autoClose: 1999,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
      });

      router.push('/'); 

    } catch (error) {
      console.error('Error signing out:', error);
    }
  }
  return (

    <div>
        <Button onClick={handleLogOut}>
        Sign Out

        </Button>
    </div>
  )
}

export default SignOut