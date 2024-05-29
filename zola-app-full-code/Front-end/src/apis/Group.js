import axiosPrivate from "./axios";

const Group = {
  async create(newGroup) {
    return axiosPrivate.post("/group", newGroup);
  },
  async delete(conversationId) {
    return axiosPrivate.delete(`/group/dissolution/${conversationId}`);
  },
  async update(conversationId, newUpdate) {
    return axiosPrivate.patch(`/group/updateInfo/${conversationId}`, newUpdate);
  },
  async getMembers(conversationId) {
    return axiosPrivate.get(`/group/getMembers/${conversationId}`);
  },
  async addMember(conversationId, newMember) {
    return axiosPrivate.post(`/group/addMember/${conversationId}`, newMember);
  },
  async transferAdmin(conversationId, userId) {
    return axiosPrivate.patch(`/group/transferAdmin/${conversationId}`, userId);
  },
  async deleteMember(conversationId, userId) {
    return axiosPrivate.delete(
      `/group/removeMember/${conversationId}?userId=${userId}`,
      userId
    );
  },
  async addDeputy(conversationId, userId) {
    return axiosPrivate.patch(`/group/addDeputy/${conversationId}`, userId);
  },
  async memberOutGroup(conversationId) {
    return axiosPrivate.patch(`/group/outGroup/${conversationId}`);
  },
};

export default Group;
