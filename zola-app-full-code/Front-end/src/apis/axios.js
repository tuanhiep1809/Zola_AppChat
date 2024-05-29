import axios from "axios";
import { auth } from "../firebase";
import axiosRetry from "axios-retry";
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5500/api";
const axiosPrivate = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});
// axiosPrivate.defaults.withCredentials = true;

axiosPrivate.interceptors.request.use(
    async (config) => {
        // Do something before request is sent
        const token = await auth.currentUser?.getIdToken();
        // console.log(token)
        config.headers["Authorization"] = `Bearer ${token}`;
        return config;
    },
    (error) => {
        // Do something with request error
        return Promise.reject(error);
    }
);

axiosPrivate.interceptors.response.use(
  (response) => {
    // Do something with response data
    return response.data;
  },
  async (error) => {
    return Promise.reject(error);
  }
);

axiosRetry(axiosPrivate, {
  retries: 2, // number of retries
  retryDelay: (retryCount) => {
    console.log(`retry attempt: ${retryCount}`);
    return retryCount * 1000; // time interval between retries
  },
  retryCondition: (error) => {
    return error.response?.status === 401;
  },
});

export default axiosPrivate;
