import { create } from "zustand";
import axios from "../lib/axios";
import toast from "react-hot-toast";

export const useUserStore = create((set) => ({
    user: null, // Initially set user to null
    loading: false,
    checkingAuth: false,
    signup: async ({ name, email, password, confirmPassword }) => {
        set({ loading: true });
        if (password !== confirmPassword) {
            set({ loading: false });
            return toast.error("Passwords Don't Match!");
        }

        try {
            const res = await axios.post("/auth/signup", { name, email, password });
            set({ user: res.data, loading: false });
            toast.success("Sign Up Successful!"); // Add success notification
        } catch (error) {
            set({ loading: false });
            toast.error(
                error.response?.data?.message || "An Error Occurred While Processing Request!"
            );
        }
    },
    login: async ({ email, password }) => {
        set({ loading: true });
        try {
            const res = await axios.post("/auth/login", { email, password });
            set({ user: res.data, loading: false });
            toast.success("Login Successful!"); // Add success notification
        } catch (error) {
            set({ loading: false });
            toast.error(
                error.response?.data?.message || "An Error Occurred While Processing Request!"
            );
        }
    },
    checkAuth: async () => {
        set({ checkingAuth: true });
        try {
            const response = await axios.get("/auth/profile");
            set({ user: response.data, checkingAuth: false });
        } catch (error) {
            console.log(error.message);
            set({ checkingAuth: false, user: null });
        }
    },
    logout: async () => {
        set({ loading: true });
        try {
            await axios.post("/auth/logout");
            set({ user: null, loading: false });
            toast.success("Logout Successful!");
        } catch (error) {
            set({ loading: false });
            toast.error(error.response?.data?.message || "An Error Occurred While Processing Request!");
        }
    },
    refreshToken: async () => {
        // prevent unnecessary refresh token calls
        if (get().checkingAuth()) return;

        set({checkingAuth: true})
        try {
            const res = await axios.post("/auth/refresh-token");
            return res.data;
        } catch (error) {
            set({user: null})
            throw error;
        } finally {
            set({checkingAuth: false})
        }
    }
}));
// TODO: Implement Refresh Token on every 15 minutes using Interceptors Concept.

let refreshPromise = null;

axios.interceptors.response.use(
    (res) => res,
    async (err) => {
        const originalRequest = err.config;
        if(err.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                // if there is already promise in que , wait for it to complete
                if(refreshPromise) {
                    await refreshPromise;
                    return axios(originalRequest);
                }

                // start refresh token process
                refreshPromise = useUserStore.getState().refreshToken();
                await refreshPromise;
                refreshPromise = null;

                return axios(originalRequest);
            } catch (error) {
                useUserStore.get().logout();
                return Promise.reject(error);
            }
        }
        return Promise.reject(err)
    }
);