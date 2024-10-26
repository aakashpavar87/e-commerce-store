import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "https://e-commerce-store-1-dbnp.onrender.com/api",
    withCredentials: true, // allow us to send cookies in server.
});

export default axiosInstance;