import { DataTypes } from "sequelize";
import { sequelize } from "../lib/db.js";

const CartItem = sequelize.define('CartItem', {
    quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});
sequelize.sync();
export default CartItem;
