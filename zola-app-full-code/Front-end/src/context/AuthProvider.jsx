"use client"
import { useContext, useEffect, useState } from "react";
const { createContext } = require("react")
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import Loading from "@/components/Loading";

export const AuthContext = createContext(); 
const AuthProvider = ({children}) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => { 
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        })
        return () => {
            unsubscribe();
        }
    }, [])
        
    if(loading) 
        return <Loading/>
    return (
        <AuthContext.Provider value={currentUser}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider;
export const useCurrentUser = () => { 
    return useContext(AuthContext);
}