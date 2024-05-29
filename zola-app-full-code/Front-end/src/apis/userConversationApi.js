import axiosPrivate from "./axios";

const path = '/userConversations'
const UserConversationApi={
    importUserConversation(newUserConversation){
        return axiosPrivate.post(`${path}`,newUserConversation)
    },

    getUserConversationByUserId(userId){
        return axiosPrivate.get(`${path}/${userId}`)
    },

    addConversation(userId,newConversation){
        return axiosPrivate.patch(`${path}/add-conversation/${userId}`,newConversation)
    },

    update(userId,conversationId,lastMess){
        return axiosPrivate.patch(`${path}/${userId}/${conversationId}`,lastMess)
    }
}

export default UserConversationApi