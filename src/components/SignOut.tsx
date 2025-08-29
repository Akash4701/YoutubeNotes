import { getAuth, signOut } from 'firebase/auth'
import React from 'react'
import { Button } from './ui/button';

function SignOut() {
    const auth=getAuth();
    const handleLogOut=async()=>{
        try{
        await signOut(auth);
        console.log('User signed out successfully');
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