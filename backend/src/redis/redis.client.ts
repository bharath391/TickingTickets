import { createClient, type RedisClientType } from "redis";

// Create Redis client with explicit type
const redisClient: RedisClientType = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => console.error("[Redis] Client Error:", err));
redisClient.on("connect", () => console.log("[Redis] Connected successfully"));

// Connect on import
await redisClient.connect();

export default redisClient;
