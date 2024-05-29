import axiosPrivate from "./axios";

const FriendApi = {
  getUserPhoneBook(userId) {
    return axiosPrivate.get(`/friends/phoneBook/${userId}`);
  },

  getFriends(userId) {
    return axiosPrivate.get(`/friends/${userId}`);
  }
};

export default FriendApi;
