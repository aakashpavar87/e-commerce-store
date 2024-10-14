import { createClient } from "redis"
import dotenv from "dotenv"

dotenv.config();
export const redisClient = createClient ({
  url : process.env.UPSTASH_REDIS_URI
});
export const initializeRedis = async () => {
    try {
        await redisClient.connect();
        console.log('Connected to Redis');
    } catch (err) {
        console.error('Redis connection error:', err);
    }
};


// For Local Setup
// client.on("error", function(err) {
//   throw err;
// });

// export const redisClient = redis.createClient({
//     host: '127.0.0.1',
//     port: 6379
// })