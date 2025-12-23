import express from "express";
import { createServer } from "http";
import { query, getClient } from "./db/db.config.js";
import "dotenv/config";
import {Server} from "socket.io";
import v1Router from "./v1.route.js";

import cookieParser from "cookie-parser";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

//check for any missing env variables
if (
    !process.env.PORT ||
    !process.env.HASH_SECRET || 
    !process.env.JWT_SECRET ||
    !process.env.NODE_ENV
){
    console.error("Missing env variables");
}

app.use(cookieParser());
app.use(express.json());
app.use("/api/v1",v1Router);

io.on("connection",() => {
    io.on("message",(msg) => {
        console.log("msg from client ",msg);
    });
    io.on("update",() => {
        console.log("alert from one of the client");
    })
});
io.on("disconnect",() => {
    console.log("Client disconnected");
})


httpServer.listen(process.env.PORT,() => console.log("Listening on port ",process.env.PORT))