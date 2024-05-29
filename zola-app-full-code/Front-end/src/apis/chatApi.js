import axiosPrivate from "./axios";
import UserConversationApi from "./userConversationApi";

const ChatApi = {

  sendChat(dataChat, emit) {
    emit("sendMessage", dataChat);
    // return axiosPrivate.post(`/chat`, data);
  },

  getChatByConversationId(id, offset=0) {
    return axiosPrivate(`/chat/${id}`, {
      params: {
        offset,
      },
    });
  },

  sendFile(file, type, conversationId, senderId) {
    return axiosPrivate.post(`/chat/files`, file, {
      params: {
        type,
        conversationId,
        senderId,
      },
      headers: {
        "Content-Type": "multipart/form-data",
        Accept: "application/json",
      },
    });
  },

  deleteMessage(messageId) {
    return axiosPrivate.post(`/chat/deleteYourSide/${messageId}`);
  },

  recallMessage(messageId) {
    return axiosPrivate.post(`/chat/delete/${messageId}`);
  },
};

export default ChatApi;
