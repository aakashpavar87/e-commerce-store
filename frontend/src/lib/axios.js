import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: true, // allow us to send cookies in server.
});

export default axiosInstance;