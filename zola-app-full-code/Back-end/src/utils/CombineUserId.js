function CombineUserId(userId, senderId) {
    return userId < senderId ? userId + senderId : senderId + userId;
}

module.exports = CombineUserId;