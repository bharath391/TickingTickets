import express from "express";
import http from "http";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import v1Router from "./routers/v1.route.js";
import loggerMiddleware from "./middlewares/logger.middleware.js";
import { WebSocketServer } from "ws";
import { validateEnv } from "./utils/validateEnv.js";

dotenv.config();
validateEnv();

const app = express()
const httpServer = http.createServer(app);
export const wss = new WebSocketServer({ server: httpServer });

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
}));
app.use(loggerMiddleware);
app.use(cookieParser());
app.use(express.json());
app.use("/api/v1", v1Router);

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.get("/health", (req, res) => {
    res.json({ status: "ok", message: "Server is running" });
});

// Graceful shutdown handler
const gracefulShutdown = async (signal: string) => {
    console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);

    // 1. Stop accepting new connections
    httpServer.close(() => {
        console.log("[Server] HTTP server closed");
    });

    // 2. Close WebSocket server
    wss.close(() => {
        console.log("[WebSocket] Server closed");
    });

    try {
        // 3. Close Redis client
        const redisClient = (await import("./redis/redis.client.js")).default;
        await redisClient.quit();
        console.log("[Redis] Connection closed");

        // 4. Close Bull queues
        const { stage1Queue, stage2Queue } = await import("./redis/redis.queues.js");
        await stage1Queue.close();
        await stage2Queue.close();
        console.log("[Queues] Closed");

        // 5. Close DB pool
        const { pool } = await import("./db/connect.js");
        await pool.end();
        console.log("[DB] Pool closed");
    } catch (err) {
        console.error("[Shutdown] Error during cleanup:", err);
    }

    console.log("[Server] Graceful shutdown complete");
    process.exit(0);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => console.log(`Server Listening on port ${PORT}`));

