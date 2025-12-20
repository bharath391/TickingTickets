import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
let io;
export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });
    io.on("connection", (socket) => {
        console.log("Client connected to Socket.IO:", socket.id);
        socket.on("message", (msg) => {
            console.log("Receive msg : ", msg);
            // Echo back for compatibility with previous minimal implementation
            socket.emit("message", "Server : " + msg);
        });
        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id);
        });
    });
    return io;
};
export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};
//# sourceMappingURL=ws.js.map