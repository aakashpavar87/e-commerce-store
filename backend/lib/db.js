import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();
// export const sequelize = new Sequelize('e-commerce-store', 'postgres', 'root', {
//     host: 'localhost',
//     dialect: 'postgres'
// });

// Use the connection URI directly
export const sequelize = new Sequelize(process.env.POSTGRES_DB_URI, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false // You may need this if the SSL certificate is self-signed
        }
    }
});

export const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log("Database connected successfully");
    } catch (error) {
        console.log("Can not connect to database because of this error: ", error);
        process.exit(1);
    }
};
