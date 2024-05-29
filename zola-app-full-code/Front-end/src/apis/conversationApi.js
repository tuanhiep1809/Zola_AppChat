import axiosPrivate from './axios'
const ConversationApi = {
    importConversation(newConversation){
        return axiosPrivate.post('/conversation',newConversation)
    },

    getConversationById(conversationId){
        return axiosPrivate.get(`/conversation/${conversationId}`)
    },

    addMemBerById(conversationId,member){
        return axiosPrivate.patch(`/conversation/add-member/${conversationId}`,member)
    },

    deleteConversationById(conversationId){
        return axiosPrivate.delete(`/conversation/${conversationId}`)
    }
}

export default ConversationApi