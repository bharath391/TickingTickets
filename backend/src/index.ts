import "dotenv/config";
import express from "express";
import http from "http";

import cookieParser from "cookie-parser";
import cors from "cors";
import v1Router from "./routers/v1.route.js";
import loggerMiddleware from "./middlewares/logger.middleware.js";
import { WebSocketServer } from "ws";
import { validateEnv } from "./utils/validateEnv.js";
import { initWebSocket } from "./sockets/websocket.js";


validateEnv();

const app = express()
const httpServer = http.createServer(app);
export const wss = new WebSocketServer({ server: httpServer });
initWebSocket(wss);

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
}));
app.use(loggerMiddleware);
app.use(cookieParser());
app.use(express.json());
app.use("/api/v1", v1Router);

app.get("/", (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ticking Tickets API</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            background: #0f172a; color: #e2e8f0;
            line-height: 1.6; padding: 2rem; max-width: 960px; margin: 0 auto;
        }
        h1 { font-size: 2rem; margin-bottom: 0.25rem; }
        h1 span { color: #f59e0b; }
        .tagline { color: #94a3b8; margin-bottom: 2rem; font-size: 0.95rem; }
        .badge { display: inline-block; background: #1e293b; border: 1px solid #334155; border-radius: 6px; padding: 2px 10px; font-size: 0.75rem; color: #94a3b8; margin: 0 4px 6px 0; }
        h2 { color: #f59e0b; font-size: 1.2rem; margin: 2rem 0 0.75rem; border-bottom: 1px solid #1e293b; padding-bottom: 0.5rem; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; }
        th { text-align: left; padding: 8px 12px; background: #1e293b; color: #f59e0b; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px; }
        td { padding: 8px 12px; border-bottom: 1px solid #1e293b; font-size: 0.88rem; }
        .method { font-weight: 700; border-radius: 4px; padding: 2px 8px; font-size: 0.75rem; }
        .get { color: #22c55e; background: #052e16; }
        .post { color: #3b82f6; background: #0c1e3d; }
        .put { color: #f59e0b; background: #2d1f05; }
        .delete { color: #ef4444; background: #2d0a0a; }
        .auth { font-size: 0.75rem; }
        code { background: #1e293b; padding: 2px 6px; border-radius: 4px; font-size: 0.82rem; color: #7dd3fc; }
        .body-hint { color: #64748b; font-size: 0.78rem; }
        .section-ws { background: #1e293b; border-radius: 8px; padding: 1rem 1.25rem; margin: 1rem 0; border-left: 3px solid #f59e0b; }
        .section-ws code { background: #0f172a; }
        .flow { color: #94a3b8; font-size: 0.85rem; margin: 0.5rem 0; }
        .flow span { color: #f59e0b; }
        footer { margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #1e293b; color: #475569; font-size: 0.8rem; text-align: center; }
        a { color: #3b82f6; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <h1><span>Ticking Tickets</span> API</h1>
    <p class="tagline">Real-time movie ticket booking with seat locking, queue-based payments & WebSocket notifications</p>
    <div>
        <span class="badge">Node.js v20</span>
        <span class="badge">Express v5</span>
        <span class="badge">TypeScript</span>
        <span class="badge">PostgreSQL 15</span>
        <span class="badge">Redis 7</span>
        <span class="badge">BullMQ</span>
        <span class="badge">WebSockets</span>
        <span class="badge">Docker</span>
    </div>

    <h2>Auth &nbsp;<code>/api/v1/auth</code></h2>
    <table>
        <tr><th>Method</th><th>Endpoint</th><th>Body</th><th>Auth</th></tr>
        <tr><td><span class="method post">POST</span></td><td><code>/signup</code></td><td class="body-hint">{ name, email, password }</td><td>No</td></tr>
        <tr><td><span class="method post">POST</span></td><td><code>/login</code></td><td class="body-hint">{ email, password }</td><td>No</td></tr>
        <tr><td><span class="method post">POST</span></td><td><code>/admin/login</code></td><td class="body-hint">{ email, password }</td><td>No</td></tr>
        <tr><td><span class="method get">GET</span></td><td><code>/ticket</code></td><td class="body-hint">—</td><td class="auth">User</td></tr>
    </table>

    <h2>Admin — Movies &nbsp;<code>/api/v1/admin</code></h2>
    <table>
        <tr><th>Method</th><th>Endpoint</th><th>Body</th><th>Auth</th></tr>
        <tr><td><span class="method post">POST</span></td><td><code>/movies</code></td><td class="body-hint">{ title, description, genre, language, duration, price }</td><td class="auth">Admin</td></tr>
        <tr><td><span class="method put">PUT</span></td><td><code>/movies/:id</code></td><td class="body-hint">{ title?, price?, ... }</td><td class="auth">Admin</td></tr>
        <tr><td><span class="method delete">DELETE</span></td><td><code>/movies/:id</code></td><td class="body-hint">—</td><td class="auth">Admin</td></tr>
    </table>

    <h2>Admin — Shows &nbsp;<code>/api/v1/admin</code></h2>
    <table>
        <tr><th>Method</th><th>Endpoint</th><th>Body</th><th>Auth</th></tr>
        <tr><td><span class="method post">POST</span></td><td><code>/shows</code></td><td class="body-hint">{ movieId, theatreId, showType, seatsCount }</td><td class="auth">Admin</td></tr>
        <tr><td><span class="method put">PUT</span></td><td><code>/shows/:id</code></td><td class="body-hint">{ seatsCount?, ... }</td><td class="auth">Admin</td></tr>
        <tr><td><span class="method delete">DELETE</span></td><td><code>/shows/:id</code></td><td class="body-hint">—</td><td class="auth">Admin</td></tr>
        <tr><td><span class="method post">POST</span></td><td><code>/shows/:id/go-live</code></td><td class="body-hint">—</td><td class="auth">Admin</td></tr>
        <tr><td><span class="method post">POST</span></td><td><code>/shows/:id/stop-booking</code></td><td class="body-hint">—</td><td class="auth">Admin</td></tr>
    </table>

    <h2>Admin — Theatres &nbsp;<code>/api/v1/admin</code></h2>
    <table>
        <tr><th>Method</th><th>Endpoint</th><th>Body</th><th>Auth</th></tr>
        <tr><td><span class="method post">POST</span></td><td><code>/theatres</code></td><td class="body-hint">{ name, location }</td><td class="auth">Admin</td></tr>
        <tr><td><span class="method put">PUT</span></td><td><code>/theatres/:id</code></td><td class="body-hint">{ name?, location? }</td><td class="auth">Admin</td></tr>
        <tr><td><span class="method delete">DELETE</span></td><td><code>/theatres/:id</code></td><td class="body-hint">—</td><td class="auth">Admin</td></tr>
    </table>

    <h2>Search &nbsp;<code>/api/v1/search</code></h2>
    <table>
        <tr><th>Method</th><th>Endpoint</th><th>Params</th><th>Auth</th></tr>
        <tr><td><span class="method get">GET</span></td><td><code>/?q=avengers</code></td><td class="body-hint">q (search query)</td><td>No</td></tr>
    </table>

    <h2>Bookings &nbsp;<code>/api/v1/bookings</code></h2>
    <table>
        <tr><th>Method</th><th>Endpoint</th><th>Body</th><th>Auth</th></tr>
        <tr><td><span class="method post">POST</span></td><td><code>/:showId/lock</code></td><td class="body-hint">{ seats: [1, 2, 3] }</td><td class="auth">User</td></tr>
        <tr><td><span class="method post">POST</span></td><td><code>/:showId/pay</code></td><td class="body-hint">—</td><td class="auth">User</td></tr>
        <tr><td><span class="method post">POST</span></td><td><code>/:showId/cancel</code></td><td class="body-hint">—</td><td class="auth">User</td></tr>
        <tr><td><span class="method post">POST</span></td><td><code>/confirm</code></td><td class="body-hint">{ razorpay_order_id, razorpay_payment_id, razorpay_signature }</td><td class="auth">User</td></tr>
    </table>

    <h2>Payments &nbsp;<code>/api/v1/payments</code></h2>
    <table>
        <tr><th>Method</th><th>Endpoint</th><th>Body</th><th>Auth</th></tr>
        <tr><td><span class="method post">POST</span></td><td><code>/initiate</code></td><td class="body-hint">{ showId, seats: [1, 2] }</td><td class="auth">User</td></tr>
        <tr><td><span class="method post">POST</span></td><td><code>/verify</code></td><td class="body-hint">{ razorpay_order_id, razorpay_payment_id, razorpay_signature }</td><td class="auth">User</td></tr>
    </table>

    <h2>WebSocket &nbsp;<code>ws://HOST/ws</code></h2>
    <div class="section-ws">
        <p style="margin-bottom: 0.75rem; color: #e2e8f0; font-weight: 600;">Connection Flow</p>
        <p class="flow"><span>1.</span> <code>GET /api/v1/auth/ticket</code> → get one-time ticket (Redis, 30s TTL)</p>
        <p class="flow"><span>2.</span> Open WebSocket: <code>ws://localhost:4000/ws</code></p>
        <p class="flow"><span>3.</span> Send <code>{ event: "auth", data: { ticket } }</code></p>
        <p class="flow"><span>4.</span> Receive <code>auth-success</code> → Send <code>{ event: "join-show", data: { showId } }</code></p>
        <p class="flow"><span>5.</span> Receive real-time <code>seat-state</code> updates</p>
    </div>
    <table>
        <tr><th>Direction</th><th>Event</th><th>Payload</th></tr>
        <tr><td>Client → Server</td><td><code>auth</code></td><td class="body-hint">{ ticket }</td></tr>
        <tr><td>Client → Server</td><td><code>join-show</code></td><td class="body-hint">{ showId }</td></tr>
        <tr><td>Client → Server</td><td><code>leave-show</code></td><td class="body-hint">{ showId }</td></tr>
        <tr><td>Server → Client</td><td><code>auth-success</code></td><td class="body-hint">{ userId }</td></tr>
        <tr><td>Server → Client</td><td><code>seat-state</code></td><td class="body-hint">{ showId, available, locked }</td></tr>
        <tr><td>Server → Client</td><td><code>your-locked-seats</code></td><td class="body-hint">{ seats }</td></tr>
        <tr><td>Server → Client</td><td><code>show-closed</code></td><td class="body-hint">{ showId, message }</td></tr>
    </table>

    <h2>Health</h2>
    <table>
        <tr><th>Method</th><th>Endpoint</th><th>Description</th></tr>
        <tr><td><span class="method get">GET</span></td><td><code>/health</code></td><td class="body-hint">Server health check</td></tr>
        <tr><td><span class="method get">GET</span></td><td><code>/api/v1/health</code></td><td class="body-hint">API health check</td></tr>
    </table>

    <footer>
        <p>Ticking Tickets — Built with Node.js, Express v5, PostgreSQL, Redis & WebSockets</p>
        <p style="margin-top: 0.4rem;"><a href="https://github.com/bharath391/TickingTickets" target="_blank">GitHub Repository</a></p>
    </footer>
</body>
</html>`);
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

