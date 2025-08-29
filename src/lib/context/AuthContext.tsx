
import { getAuth, onAuthStateChanged, User } from 'firebase/auth'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth } from '../firebase/auth'

 type AuthContexttype={
    user:User | null
    loading:boolean

   }

    const AuthContext=createContext<AuthContexttype>({
        user:null,
        loading:true
    });
export function AuthProvider({children}: {children:React.ReactNode}) {
  

    const [user,setUser]=useState<User | null>(null);
    const [loading,setLoading]=useState<boolean>(true);
    useEffect(()=>{
        const authenticated=auth
        const unsubscribe=onAuthStateChanged(authenticated,(user)=>{
            if(user){
                setUser(user);
                setLoading(false);
            }else{
                setLoading(true);
                setUser(null);
            }
        })

        return ()=>unsubscribe()
        

    },[user,loading])




  return (
   <AuthContext.Provider value={{user,loading}}>
    {children}
   </AuthContext.Provider>
  )
}

export function useAuth(){
   return  useContext(AuthContext);
}