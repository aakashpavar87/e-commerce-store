import jwt from "jsonwebtoken";
import { redisClient } from "../lib/redis.js";
import User from "../models/user.model.js";

const generateTokens = (userId) => {
    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

    return { accessToken, refreshToken };
}
const storeRefreshTokenInRedis = async (userId, refreshToken) => {
    try {
        await redisClient.set(`refresh_token:${userId}`, String(refreshToken), 'EX', 7 * 24 * 60 * 60); // 7 days expiration
    } catch (err) {
        console.error('Redis error:', err);
        throw new Error('Failed to store refresh token in Redis');
    }
}
const setCookies = (res, accessToken, refreshToken) => {
    res.cookie("accessToken", accessToken, {
        httpOnly: true, // prevent XSS attacks
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict", // prevent CSRF attacks
        maxAge: 15 * 60 * 1000 // 15 Minutes
    })
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })
}
export const signupController = async (req, res) => {
    const { name, email, password } = req.body;
    console.log(name, email, password);
    try {
        const userExists = await User.findOne({ where: { email } })
        if (userExists) {
            res.status(400).json({ message: 'Email with this user is already exists !!!' })
            return
        }
        const user = await User.create({ name, email, password })
        //authenticate user
        const { refreshToken, accessToken } = generateTokens(user.id);
        //storing refreshToken to redis
        await storeRefreshTokenInRedis(refreshToken)
        //setting tokens in cookies
        setCookies(res, accessToken, refreshToken);
        res.status(201).json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        })
    } catch (error) {
        console.log("Error from Sign Up Controller ", error);
        res.status(500).json({ message: `User Creation Error : ${error.message}` })
    }
}
export const loginController = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ where: { email } })
        if (!user) {
            res.status(401).json({ message: 'User Does not Exist with this email' })
            return
        }
        const result = await user.comparePassword(password)
        if (user && result) {
            const { refreshToken, accessToken } = generateTokens(user.id);
            await storeRefreshTokenInRedis(user.id, refreshToken);
            setCookies(res, accessToken, refreshToken);
            res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            })
        } else res.status(400).json({ message: "Invalid Credentials ..." })
    } catch (error) {
        console.log("Error from Log In Controller ", error);
        res.status(500).json({ message: `Error From Login Controller : ${error.message}` });
    }
}
export const logoutController = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            // Deleting refreshToken from Redis
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            await redisClient.del(`refresh_token:${decoded.userId}`);
        }
        // Clearing tokens from cookies
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.log("Error from Log Out Controller ", error);
        res.status(500).json({ message: error.message });
    }
};

// refresh the access token with the help of refresh token
export const refreshTokenController = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) return res.status(401).json({ message: 'No refresh token' });
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const storedToken = await redisClient.get(`refresh_token:${decoded.userId}`)
        if (refreshToken !== storedToken) return res.status(401).json({ message: 'Invalid refresh token !!!' })
        const accessToken = jwt.sign({ userId: decoded.userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
        res.cookie("accessToken", accessToken, {
            httpOnly: true, // prevent XSS attacks
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict", // prevent CSRF attacks
            maxAge: 15 * 60 * 1000 // 15 Minutes
        })
        res.status(200).json({ message: 'Token refreshed Successfully !!!' })
    } catch (error) {
        console.log("Error from Refresh Token Controller ", error);
        res.status(500).json({ message: error.message });
    }
}

// TODO: Create getProfile controller
export const getProfile = async (req, res) => {
    try {
        return res.json(req.user);
    } catch (error) {
        console.log("Error from Get Profile Controller ", error);
        res.status(500).json({ message: error.message });
    }
}