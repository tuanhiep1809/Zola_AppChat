import { get } from "http";
import axiosPrivate from "./axios";
import { use } from "react";

const FriendRequest = {
  getFriendByNumber(number) {
    return axiosPrivate.get(`/user/number/${number}`);
  },

  checkFriend(userID1, userID2) {
    return axiosPrivate.get(`/friendRequest/state`, {
      params: {
        userId1: userID1,
        userId2: userID2,
      },
    });
  },

  addFriend(user, userF) {
    return axiosPrivate.post("/friendRequest/send", {
      senderUserId: user.uid,
      receiverUserId: userF._id,
    });
  },

  getFriendRequestReceived(userId) {
    return axiosPrivate.get(`/friendRequest/received/${userId}`);
  },

  getFriendRequestSend(userId) {
    return axiosPrivate.get(`/friendRequest/sent/${userId}`);
  },

  acceptFriendRequest(id) {
    return axiosPrivate.post(`/friendRequest/accept`, {
      friendRequestId: id,
    });
  },

  declineFriendRequest(id) {
    return axiosPrivate.post(`/friendRequest/decline`, {
      friendRequestId: id,
    });
  },

  cancalRequest(id) {
    return axiosPrivate.post(`/friendRequest/cancel`, {
      friendRequestId: id,
    });
  },
};

export default FriendRequest;
