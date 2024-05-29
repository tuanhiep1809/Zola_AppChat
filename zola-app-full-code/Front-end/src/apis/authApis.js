import { auth } from '@/firebase';
import axiosPrivate from './axios';
const authApis = {
    register (data) {
        axiosPrivate.post('/auth/register', data);
    },
}

export default authApis