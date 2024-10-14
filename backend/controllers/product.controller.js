import cloudinary from "../lib/cloudinary.js";
import { sequelize } from "../lib/db.js";
import { redisClient } from "../lib/redis.js";
import Product from "../models/product.model.js";

const updateFeaturedProductsCache = async ()=> {
    try {
        const featuredProducts = await Product.findAll({ where: { isFeatured: true }, raw: true });
        await redisClient.set("featured_products", JSON.stringify(featuredProducts));
    } catch (error) {
        console.log("======== Error In UpdateCache in REDIS method=========", error);
    }
}

export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.findAll({});
        res.json({ products });
    } catch (error) {
        console.log("=======Error From Product Controller=======", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
}

export const geFeaturedProducts = async (req, res) => {
    try {
        let featuredProducts = await redisClient.get("featured_products");
        if (featuredProducts) {
            return res.json({ featuredProducts })
        }
        featuredProducts = await Product.findAll({ where: { isFeatured: true }, raw: true });
        // Adding products to redis for future quick access
        if (!featuredProducts) return res.status(404).json({ message: "No Featured Products Found" });
        await redisClient.set("featured_products", JSON.stringify(featuredProducts));
        res.json({ featuredProducts });
    } catch (error) {
        console.log("=======Error From Product Controller=======", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
}

export const createProduct = async (req, res) => {
    try {
        const { name, description, category, price, image } = req.body;
        let cloudinaryResponse = null;
        if (image) {
            cloudinaryResponse = await cloudinary.uploader.upload(image, { folder: "products" });
        }
        const product = await Product.create({
            name,
            description,
            category,
            price,
            image: cloudinaryResponse?.secure_url ? cloudinaryResponse.secure_url : ""
        })
        res.status(201).json({ product });
    } catch (error) {
        console.log("=======Error From Create Product=======", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
}

export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: "Product Not Found." });
        if (product.image) {
            const publicId = product.image.split("/").pop().split(".")[0]
            try {
                await cloudinary.uploader.destroy(`products/${publicId}`)
            } catch (error) {
                console.log("=========== Error deleting image from cloudinary ", error);
            }
        }
        await Product.destroy({ where: { id: req.params.id } });
        return res.json({ message: "Product Deleted Successfully !!!" })
    } catch (error) {
        console.log("=======Error From Delete Product=======", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
}

export const getRecommendationProduct = async (req, res) => {
    try {
        const products = await Product.findAll({
            order: sequelize.literal('RANDOM()'), // Use RANDOM() for PostgreSQL
            limit: 3
        });
        return res.json(products)
    } catch (error) {
        console.log("=======Error From Get Recommendation =======", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
}

export const getProductByCategory = async (req, res) => {
    try {
        const products = await Product.findAll({ where: { category: req.params.category } });
        return res.json(products)
    } catch (error) {
        console.log("=======Error From Get Recommendation =======", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
}

export const toggleIsFeaturedProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: "Product Not Found." });
        product.isFeatured = !product.isFeatured;
        const updatedProduct = await product.save();
        // update cache in redis
        await updateFeaturedProductsCache();
        return res.json(updatedProduct)
    } catch (error) {
        console.log("=======Error From Get Recommendation =======", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
}