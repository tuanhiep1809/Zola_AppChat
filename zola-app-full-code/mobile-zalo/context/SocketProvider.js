import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useCurrentUser } from "../App";
import {auth} from '../config/firebase'
export const SocketContext = createContext();

const SocketProvider = ({children}) => {
    // const socket = io('https://tamhiep.zola-api.tech', {transports: ['websocket']}); 
    // const socket = io('http://192.168.1.11:8900', {transports: ['websocket']});
    const [socket, setSocket] = useState(null);
    const currentUser =  useCurrentUser().user;
    useEffect(() => {
        let eventQueue = [];
        (async ()=>{ 
            const token = await auth.currentUser?.getIdToken();
            const socket = io('https://tamhiep.zola-api.tech', {
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
                socket.on('emit', (event, data) => {
                  eventQueue.push({ event, data });
                });
          
                const newToken = await auth.currentUser?.getIdToken();
                socket.io.opts.query = { token: newToken };
                socket.io.engine.close();
                socket.io.engine.open();
            });
        })()
    }, [currentUser?.uid])

    return (
        <SocketContext.Provider value={{socket}}>
            {children}
        </SocketContext.Provider>
    )
}

export const useSocket = () => useContext(SocketContext);
export default SocketProvider;