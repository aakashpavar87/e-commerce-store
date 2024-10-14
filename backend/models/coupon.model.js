import { DataTypes } from "sequelize";
import { sequelize } from "../lib/db.js";
import User from "./user.model.js";

const Coupon = sequelize.define("Coupon", {
    code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    discountPercentage: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0,
            max: 100
        }
    },
    expirationDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    userId: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'id'
        },
        allowNull: false,
        unique: true
    }
});

// Coupon.sync({ alter: true, force: true });
sequelize.sync();
export default Coupon;