"use client"
import { useContext, useEffect, useState } from "react";
const { createContext } = require("react")
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import Loading from "@/components/Loading";
import { AuthContext } from "./AuthProvider";
import { io } from "socket.io-client";
export const SocketContext = createContext(); 
const SocketProvider =  ({children}) => {
    const currentUser = useContext(AuthContext);
    const [socket, setSocket] = useState(null);
    useEffect(() => {
        let eventQueue = [];
        (async ()=>{ 
            const token = await auth.currentUser?.getIdToken();
            const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
                transports: ['websocket'],
                query: {token}
            });

            socket.on('connect',() => {
                setSocket(socket);
                socket.emit("addUser", currentUser.uid);
                while (eventQueue.length > 0) {
                    const { event, data } = eventQueue.shift();
                    socket.emit(event, data);
                }
            })

            socket.on('tokenExpired', async () => {
                // Khi token hết hạn, lưu trữ các sự kiện emit vào hàng đợi
                console.log("tokenExipred")
                const newToken = await auth.currentUser?.getIdToken();
                socket.io.opts.query = { token: newToken };
                socket.io.engine.close();
                socket.io.engine.open();
            });
        })()
    }, [currentUser?.uid])
    const emit = (event, data) => {
        try {
            socket.emit(event, data);
        } catch (error) {
            eventQueue.push({ event, data });
            console.log(error);            
        }
    }
    return (
        <SocketContext.Provider value={{socket, emit}}>
            {children}
        </SocketContext.Provider>
    )
}

export default SocketProvider;
export const useSocket = () => useContext(SocketContext);