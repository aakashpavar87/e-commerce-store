import { Router } from "express";
import {
    getProfile,
    loginController,
    logoutController,
    refreshTokenController,
    signupController
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
const router = Router();
router.post("/signup", signupController);
router.post("/logout", logoutController);
router.post("/login", loginController);
router.post("/refresh-token", refreshTokenController);
router.get("/profile", protectRoute, getProfile);
export default router