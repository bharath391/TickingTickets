import express from "express";
import { createServer } from "http";
import { query, getClient } from "./db/db.config.js";
import "dotenv/config";
import { Server } from "socket.io";
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
io.on("connection", () => {
    io.on("message", (msg) => {
        console.log("msg from client ", msg);
    });
    io.on("update", () => {
        console.log("alert from one of the client");
    });
});
io.on("disconnect", () => {
    console.log("Client disconnected");
});
httpServer.listen(process.env.PORT, () => console.log("Listening on port ", process.env.PORT));
//# sourceMappingURL=index.js.map