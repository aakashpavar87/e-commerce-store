import Product from "../models/product.model.js";
import CartItem from "../models/cartItem.model.js";

export const addToCart = async (req, res) => {
    try {
        const { productId } = req.body;
        const user = req.user;
        console.log("======From Add TO Cart Function=====", user);
        const existingCartItem = user.CartItems.find(
            (cartItem) => cartItem.dataValues.productId === productId
        );

        if (existingCartItem) {
            existingCartItem.quantity++;
            await existingCartItem.save();
        } else {
            await CartItem.create({ userId: user.id, productId, quantity: 1 });
        }
        return res.status(201).json({ message: 'Added to cart successfully !!!' });
    } catch (error) {
        console.log("======Error From Add To Cart ========", error);
        return res.status(500).json({ message: error.message, error: error })
    }
}
export const getCartProducts = async (req, res) => {
    try {
        // const products = await Product.findAll()
        const cartItems = await CartItem.findAll(
            { where: { userId: req.user.id } }
        );
        const newCartItems = await Promise.all(
            cartItems.map(async cartItem => {
                const product = await Product.findOne(
                    {
                        where: { id: cartItem.dataValues.productId }
                    }
                );
                return {
                    ...product.dataValues,
                    quantity: cartItem.dataValues.quantity
                }
            })
        );
        return res.json(newCartItems);
    } catch (error) {
        return res.status(500).json({ message: error.message, error: error });
    }
}
export const removeAllFromCart = async (req, res) => {
    try {
        const { productId } = req.body;
        console.log("========Request Body=====",req.body);
        console.log("=========Product Id:==========", productId);
        const user = req.user;
        if (productId) {
            const cartItem = await CartItem.findOne({
                where: {
                    userId: user.id,
                    productId
                },
            });
            if (cartItem) {
                await cartItem.destroy();
                res.json({ message: "Product removed from cart successfully." });
            } else {
                res.status(404).json({ message: "Product not found in cart." });
            }
        } else {
            await CartItem.destroy({
                where: {
                    userId: user.id,
                },
            });
            res.json({ message: "All products removed from cart successfully." });
        }
    } catch (error) {
        console.log("======Error From Add To Cart ========", error);
        return res.status(500).json({ message: error.message, error: error });
    }
}
export const updateQuantity = async (req, res) => {
    try {
        const { id: productId } = req.params;
        const { quantity } = req.body;
        const user = req.user;
        const existingProduct = await Product.findByPk(productId);
        if (existingProduct) {
            if (quantity === 0) {
                await CartItem.destroy({
                    where: {
                        userId: user.id,
                        productId: productId
                    }
                })
            } else {
                await CartItem.update({ quantity }, { where: { userId: user.id, productId } });
            }
            const cartItems = await CartItem.findAll({ where: { userId: user.id } })
            const newCartItems = await Promise.all(
                cartItems.map(async cartItem => {
                    const product = await Product.findOne(
                        {
                            where: { id: cartItem.dataValues.productId }
                        }
                    );
                    return {
                        ...product.dataValues,
                        quantity: cartItem.dataValues.quantity
                    }
                })
            );
            return res.json(newCartItems)
        } else {
            return res.status(404).json({ message: "Product Not Found to update qunatity !!!" });
        }
    } catch (error) {
        console.log("==============Error From Update Quantity =========", error);
        return res.status(500).json({ message: error.message, error: error });
    }
}