import { DataTypes } from "sequelize";
import { sequelize } from "../lib/db.js";

const Product = sequelize.define("Product", {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
            min: 0
        }
    },
    image: {
        type: DataTypes.STRING,
        allowNull: false
    },
    isFeatured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});
sequelize.sync();
export default Product;