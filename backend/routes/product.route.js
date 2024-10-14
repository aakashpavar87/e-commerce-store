import express from 'express';
import {
    createProduct,
    deleteProduct,
    geFeaturedProducts,
    getAllProducts,
    getProductByCategory,
    getRecommendationProduct,
    toggleIsFeaturedProduct
} from '../controllers/product.controller.js';
import { adminRoute, protectRoute } from '../middleware/auth.middleware.js';
const router = express.Router();
router.get("/", protectRoute, adminRoute, getAllProducts);
router.post("/", protectRoute, adminRoute, createProduct);
router.delete("/:id", protectRoute, adminRoute, deleteProduct);
router.patch("/:id", protectRoute, adminRoute, toggleIsFeaturedProduct);
router.get("/featured", geFeaturedProducts);
router.get("/recommendation", getRecommendationProduct);
router.get("/category/:category", getProductByCategory);
export default router;