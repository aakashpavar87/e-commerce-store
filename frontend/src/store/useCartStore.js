import { create } from "zustand";
import axios from "../lib/axios";
import toast from "react-hot-toast";
import { useUserStore } from "./useUserStore";

const useCartStore = create((set, get) => ({
    coupon: null,
    cart: [],
    total: 0,
    subtotal: 0,
    isCouponApplied: false,

    getCoupons: async () => {
        try {
            const res = await axios.get("/coupons");
            set({ coupon: res.data });
        } catch (error) {
            console.log("=======Error From Get Coupons=======", error);
            toast.error(error?.response?.data?.message || "Error occured while fetching coupons");
        }
    },
    validateCoupons: async (couponCode) => {
        try {
            const res = await axios.post("/coupons/validate", {code: couponCode});
            set({coupon: res.data.coupon, isCouponApplied: true});
            get().calculateTotals();
            toast.success(res.data.message);
        } catch (error) {
            console.log("=======Error From Validate Coupons=======", error);
            toast.error(error?.response?.data?.message || "Failed to apply coupon.");
        }
    },
    removeCoupon: () => {
        set({coupon: null, isCouponApplied: false});
        get().calculateTotals();
        toast.success("Coupon removed.");
    },
    getCartItems: async () => {
        const { user } = useUserStore.getState();
        try {
            const res = await axios.get("/cartItem");
            set({ cart: res.data });
            get().calculateTotals();
        } catch (error) {
            set({ cart: [] })
            console.log("=====Error From User Cart Store=====", error);
            if (user) toast.error(error.response?.data?.message || "Unable to fetch cart items");
        }
    },
    addToCartProduct: async (product) => {
        set({ loading: true })
        try {
            const res = await axios.post("/cartItem/", { productId: product.id });
            set((prevCartItems) => {
                const existingCartItem = prevCartItems.cart.find(cartItem => cartItem.id === product.id)
                const newCartItems = existingCartItem ?
                    prevCartItems.cart.map(item => item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item)
                    : [...prevCartItems.cart, { ...product, quantity: 1 }];
                return { cart: newCartItems };
            });
            get().calculateTotals();
            toast.success(res.data.message);
        } catch (error) {
            console.log("=====Error From Add to cart=======", error);
            toast.error(error?.response?.data?.message || "Error occured while Adding to Cart")
        } finally {
            set({ loading: false })
        }
    },
    removeProductFromCart: async (productId) => {
        try {
            const res = await axios.delete("/cartItem/", { data: { productId } });
            set((prevCartItems) => {
                const newCartItems = prevCartItems.cart.filter(cartItem => cartItem.id !== productId);
                return { cart: newCartItems };
            });
            get().calculateTotals();
            toast.success(res.data.message);
        } catch (error) {
            console.log("=====Error From Remove from cart=======", error);
            toast.error(error?.response?.data?.message || "Error occured while removing from Cart")

        }
    },
    updateQuantityOfProduct: async (productId, quantity) => {
        try {
            const res = await axios.put(`/cartItem/${productId}`, { quantity });
            set({ cart: res.data })
            get().calculateTotals();
        } catch (error) {
            set({ cart: [] })
            console.log("=====Error From Update quantity of cart=======", error);
            toast.error(error?.response?.data?.message || "Error occured while updating quantity of Cart Product")
        }
    },
    clearCart: async () => {
        try {
            await axios.delete("/cartItem");
            set({ cart: [], total: 0, subtotal: 0 });
        } catch (error) {
            console.log("=====Error From Clear cart=======", error);
            toast.error(error?.response?.data?.message || "Error occured while clearing cart")
        }
    },
    calculateTotals: () => {
        const { coupon, cart } = get();
        const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        let total = subtotal
        if (coupon) {
            const discount = subtotal * coupon.discountPercentage / 100
            total = subtotal - discount
        }
        set({ total, subtotal });
    },
}));

export default useCartStore;