import Coupon from "../models/coupon.model.js";

export const getCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findOne({ where: { userId: req.user.id, isActive: true } })
        res.json(coupon || null);
    } catch (error) {
        console.log("======= Error From Get Coupons Methods =======", error);
        return res.status(500).json({ message: error.message, error: error });
    }
}

export const validateCoupon = async (req, res) => {
    try {
        const { code } = req.body;
        const coupon = await Coupon.findOne({ where: { code, userId: req.user.id, isActive: true } });
        if (!coupon) {
            return res.status(404).json({ message: "Coupon Not Found !!!" });
        }
        if (coupon.expirationDate < new Date()) {
            coupon.isActive = false;
            coupon.save();
            return res.status(404).json({ message: "Coupon Expired !!!" });
        }
        return res.json({
            message: "Valid Coupon",
            code: coupon.code,
            coupon,
            discountPercentage: coupon.discountPercentage
        });
    } catch (error) {
        console.log("======= Error From Validate Coupon Methods =======", error);
        return res.status(500).json({ message: error.message, error: error });
    }
}