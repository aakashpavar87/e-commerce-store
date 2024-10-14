import stripe from "../lib/stripe.js";
import Coupon from "../models/coupon.model.js";
import Order, { OrderProductItem } from "../models/order.model.js";

export const createCheckoutSession = async (req, res) => {
    try {
        const { products, couponCode } = req.body;
        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).send("Invalid products or products is empty !!!");
        }
        let totalAmount = 0;
        const lineItems = products.map(product => {
            const amount = Math.round(product.price * 100);
            totalAmount += amount * product.quantity;
            return {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: product.name,
                        images: [product.image]
                    },
                    unit_amount: amount,
                },
                quantity: product.quantity || 1
            }
        });
        let coupon = null;
        if (couponCode) {
            coupon = await Coupon.findOne({ where: { code: couponCode, userId: req.user.id, isActive: true } });
            totalAmount -= Math.round(totalAmount * (coupon.discountPercentage / 100));
        }
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
            discounts: coupon ? [
                {
                    coupon: await createStripeCoupon(coupon.discountPercentage)
                }
            ] : [],
            metadata: {
                userId: req.user.id,
                couponCode: couponCode || "",
                products: JSON.stringify(products.map(p => {
                    return {
                        id: p.id,
                        quantity: p.quantity,
                        price: p.price
                    }
                }))
            }
        });
        if (totalAmount >= 20000) {
            await createNewCoupon(req.user.id);
        }
        console.log("=====Session Id=======",session.id);
        res.status(200).json({ id: session.id, totalAmount: totalAmount / 100 });
    } catch (error) {
        console.log("====== Error From Create Checkout Session ======", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const checkoutSuccess = async (req, res) => {
    try {
        const { sessionId } = req.body;
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_status === "paid") {
            if (session.metadata.couponCode) {
                await Coupon.update({ isActive: false }, {
                    where: {
                        code: session.metadata.couponCode,
                        userId: req.user.id,
                    }
                });
            }
            // create a new order
            const products = JSON.parse(session.metadata.products);
            const newOrder = await Order.create({
                userId: session.metadata.userId,
                totalAmount: session.amount_total / 100, // converting dollar from cents
                stripeSessionId: sessionId
            })
            const orderProductItems = products.map((product) => ({
                orderId: newOrder.id,
                productId: product.id,
                quantity: product.quantity,
                price: product.price
            }));
            await OrderProductItem.bulkCreate(orderProductItems);
            return res.status(200).json({
                message: "Order created successfully and coupon is deactivated if used.",
                success: true,
                orderId: newOrder.id
            })
        }
    } catch (error) {
        console.log("=======Error From Checkout Success Route=======", error);
        res.status(500).json({ message: error.message, error: error });
    }
};

async function createStripeCoupon(discountPercentage) {
    const coupon = await stripe.coupons.create({
        percent_off: discountPercentage,
        duration: "once"
    });
    return coupon.id;
}

async function createNewCoupon(userId) {
    await Coupon.destroy({ where: { userId } });
    const newCoupon = await Coupon.create({
        userId: userId,
        code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 Days from current date
        discountPercentage: 10,
    });
    return newCoupon;
}