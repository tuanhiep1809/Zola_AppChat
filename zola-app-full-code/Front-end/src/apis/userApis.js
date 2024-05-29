import axiosPrivate from "./axios";

const userApis = {
    async getAllUsers () { 
        const users = await axiosPrivate("/user");
        return users;
    },
    async getUserById (id) { 
        const user = await axiosPrivate(`/user/${id}`);
        return user; 
    },
    async updateAnUserById (id, data) {
        axiosPrivate.patch(`/user/${id}`, data);
    },
    async deleteUserById (id) {
        axiosPrivate.delete(`/user/${id}`);
    },

    async updateAvatar (id, file) {
        await axiosPrivate.patch(`/user/${id}/updateAvatar`, file, {
            headers: {
                "Content-Type": "multipart/form-data",
                "Accept": 'application/json',
            },
        });
    },

    async getShortInfoUser (id) {
        const user = await axiosPrivate(`/user/short-info/${id}`);
        return user; 
    }
}

export default userApis;