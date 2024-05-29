import { useState } from "react";
import { useSocket } from "../context/SocketProvider";

export default function FriendRequestForm() {
    const {socket} = useSocket();
    const [friendRequest, setFriendRequest] = useState(null); 
    useEffect(() => {
        if(socket) { 
            console.log("socket.id: ");
            console.log(socket.id);
            socket.on('receiveFriendRequest', (data) => {
                console.log('receiveFriendRequest: '); 
                console.log(data); 
                setFriendRequest(data);
            })
        }
    }, [socket])
    return (
        <View>
            <Text> Nhận lời mời kết bạn từ {friendRequest.senderInfo.name} </Text>
        </View>
    )
}