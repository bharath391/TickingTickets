import { createClient, type RedisClientType } from "redis";

// Create Redis client with explicit type
const redisClient: RedisClientType = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6380",
});

redisClient.on("error", (err) => console.error("[Redis] Client Error:", err));
redisClient.on("connect", () => console.log("[Redis] Connected successfully"));
redisClient.on("reconnecting", () => console.log("[Redis] Reconnecting..."));

// Connect with graceful error handling
const connectRedis = async (retries = 5): Promise<void> => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            await redisClient.connect();
            return;
        } catch (error) {
            console.error(`[Redis] Connection attempt ${attempt}/${retries} failed:`, error);
            if (attempt === retries) {
                console.error("[Redis] All connection attempts failed. Exiting...");
                process.exit(1);
            }
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
    }
};

// Initialize connection
await connectRedis();

export default redisClient;
