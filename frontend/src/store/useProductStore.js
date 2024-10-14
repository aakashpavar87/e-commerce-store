import { create } from "zustand";
import axios from "../lib/axios";
import toast from "react-hot-toast";

const useProductStore = create((set) => ({
    products: [],
    loading: false,

    setProducts: (products) => set({ products }),
    createProduct: async (productData) => {
        set({ loading: true })
        try {
            console.log("===Testing===", productData);
            const res = await axios.post("/products", productData);
            console.log(res.data);
            set((prevState) => ({
                products: [...prevState.products, res.data],
                loading: false
            }));
            toast.success("Product created successfully !!!");
        } catch (error) {
            console.log("=====Error From User Product Store=====", error)
            toast.error(error.response?.data?.message || "An Error Occurred While Processing Request!");
        } finally {
            set({ loading: false })
        }
    },
    deleteProduct: async (id) => {
        set({ loading: true });
        try {
            await axios.delete(`/products/${id}`);
            set((prevProducts) => ({
                products: prevProducts.products.filter(product => product.id !== id),
                loading: false
            }));
        } catch (error) {
            console.log("======Error From Delete Product=======", error);
            toast.error(error.response?.data?.message || "Unable to delete product");
        } finally {
            set({ loading: false });
        }
    },
    toggleFeaturedProduct: async (productId) => {
        set({ loading: true });
        try {
            const res = await axios.patch(`/products/${productId}`);
            set((prevProducts) => ({
                products: prevProducts.products.map(product =>
                    product.id === productId ? { ...product, isFeatured: res.data.isFeatured } : product
                ),
                loading: false
            }));
        } catch (error) {
            console.log("======Error From Toggle IsFeatured Product=======", error);
            toast.error(error.response?.data?.message || "Unable to set Featured Product");
        } finally {
            set({ loading: false });
        }
    },
    fetchAllProducts: async () => {
        set({ loading: true })
        try {
            const res = await axios.get("/products");
            set({ products: res.data.products, loading: false });
        } catch (error) {
            console.log("=====Error From User Product Store=====", error)
            toast.error(error.response?.data?.message || "Unable to fetch products");
        } finally {
            set({ loading: false })
        }
    },
    getProductsByCategory: async (category) => {
        set({ loading: true });
        try {
            const res = await axios.get(`/products/category/${category}`);
            set({ products: res.data});
        } catch (error) {
            console.log("=====Error From User Product Store=====", error);
            toast.error(error.response?.data?.message || "Unable to fetch category of products");
        } finally {
            set({ loading: false });
        }
    },
    getRecommendedProducts: async () => {
        set({ loading: true });
        try {
            const res = await axios.get("/products/recommendation");
            console.log(res.data);
            return res.data;
        } catch (error) {
            console.log("======Error From Get Recommendation=======", error);
            toast.error(error.response?.data?.message || "Unable to get Recommendation");
        } finally {
            set({ loading: false });
        }
    },
    getFeaturedProducts: async () => {
        set({loading: true})
        try {
            const res = await axios.get("/products/featured");
            set({products: JSON.parse(res.data.featuredProducts), loading: false})
        } catch (error) {
            console.log("====Error From Featured Product Fetch Function====", error);
            set({loading: false})
        }
    }
}));

export default useProductStore;