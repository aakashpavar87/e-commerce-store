import jwt from "jsonwebtoken"
import User from "../models/user.model.js";
import CartItem from "../models/cartItem.model.js";
export const protectRoute = async (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken
        if (!accessToken) return res.status(401).json({ message: "Unauthorised - No Access Token provided." });
        try {
            const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
            const user = await User.findByPk(
                decoded.userId,
                {
                    attributes: {
                        exclude: ['password']
                    },
                    include: CartItem
                }
            )
            if (!user) return res.status(401).json({ message: "Unauthorised - User not found." });
            req.user = user
            next()
        } catch (error) {
            if (error.name === "TokenExpiredError") return res.status(401).json({ message: "Unauthorised - Access Token expired." });
            else throw error
        }
    } catch (error) {
        console.log("======Error From ProtectRoute ====", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
}
export const adminRoute = async (req, res, next) => {
    try {
        if (req.user && req.user.role === "admin") {
            next()
        } else {
            res.status(403).json({ message: "Access Denied - Admin only." });
        }
    } catch (error) {
        console.log("======Error From AdminRoute ====", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
}