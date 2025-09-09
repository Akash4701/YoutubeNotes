
import { getAuth, onAuthStateChanged, User } from 'firebase/auth'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth } from '../firebase/auth'

 type AuthContexttype={
    user:User | null
    loading:boolean,
    token:string | null

   }

    const AuthContext=createContext<AuthContexttype>({
        user:null,
        loading:true,
        token:''
    });
export function AuthProvider({children}: {children:React.ReactNode}) {
  

    const [user,setUser]=useState<User | null>(null);
    const [loading,setLoading]=useState<boolean>(true);
    const [token,setToken]=useState<string |null>('')
    useEffect(()=>{
        const authenticated=auth
        const unsubscribe=onAuthStateChanged(authenticated,async(user)=>{
             const token = user ? await user.getIdToken() : null;
            setToken(token);
  console.log(' token', token);

            console.log('user',user);
            if(user){ 
                setUser(user);
                setLoading(false);
            }else{
                setLoading(true);
                setUser(null);
            }
        })

        return ()=>unsubscribe()
        

    },[user])




  return (
   <AuthContext.Provider value={{user,loading,token}}>
    {children}
   </AuthContext.Provider>
  )
}

export function useAuth(){
   return  useContext(AuthContext);
}