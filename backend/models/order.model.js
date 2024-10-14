import { DataTypes } from "sequelize";
import { sequelize } from "../lib/db.js";
import Product from "./product.model.js";
import User from "./user.model.js";

export const OrderProductItem = sequelize.define("OrderProductItem", {
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Product,
            key: "id"
        }
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
            min: 0
        }
    },
    orderId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
})

const Order = sequelize.define("Order", {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: "id"
        }
    },
    totalAmount: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
            min: 0
        }
    },
    stripeSessionId: {
        type: DataTypes.STRING,
        unique: true
    }
});

// Product.belongsToMany(Order, { through: OrderProductItem });
Order.hasMany(OrderProductItem, {foreignKey: 'orderId'});
OrderProductItem.belongsTo(Order, {foreignKey: 'orderId'});

// OrderProductItem.sync({ alter: true });
// Order.sync({ alter: true });
sequelize.sync();
export default Order;


