import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import express from "express";
import { connectDB } from "./lib/db.js";
import { initializeRedis } from "./lib/redis.js";
import authRoutes from "./routes/auth.route.js";
import cartItemRoutes from "./routes/cartItem.route.js";
import couponRoutes from "./routes/coupon.route.js";
import paymentRoutes from "./routes/payment.route.js";
import productRoutes from "./routes/product.route.js";
import analyticsRoutes from "./routes/analytics.route.js";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000
const __dirname = path.resolve();
app.use(express.json({limit: "10mb"}));
app.use(cookieParser())
app.use(cors({
    origin: process.env.CLIENT_URL, // Allow requests from any origin
    credentials: true
  }));
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cartItem", cartItemRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);
if(process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));
  app.get("*", (req, res)=>{
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}
app.listen(PORT, async () => {
    await connectDB()
    initializeRedis()
    console.log('Server is running on https://localhost:' + PORT);
})