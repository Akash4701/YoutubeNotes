import { getAuth, signOut } from 'firebase/auth'
import React from 'react'
import { Button } from './ui/button';
import { Bounce, toast } from 'react-toastify';

function SignOut() {
    const auth=getAuth();
    const handleLogOut=async()=>{
        try{
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
        ;
        }catch(error){
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