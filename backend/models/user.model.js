import bcrypt from "bcryptjs";
import { DataTypes } from "sequelize";
import { sequelize } from "../lib/db.js";
import CartItem from "./cartItem.model.js";

const User = sequelize.define('User', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isLowercase: {
                message: 'Email must be in lowercase'
            }
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: {
                message: 'Password Must be six characters long',
                args: [6, 14]
            }
        }
    },
    role: {
        type: DataTypes.ENUM,
        values: ['customer', 'admin'],
        defaultValue: 'customer'
    }
},
    {
        hooks: {
            beforeCreate: async function (user) {
                console.log(user);
                try {
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(user.password, salt);
                } catch (error) {
                    throw new Error(error);
                }
            }
        }
    }
);
User.prototype.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};
User.hasMany(CartItem, {foreignKey: 'userId'});
CartItem.belongsTo(User, {foreignKey: 'userId'});
sequelize.sync();
export default User;