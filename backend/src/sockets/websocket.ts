import { wss } from "../index.js";
import jwt from "jsonwebtoken";
import { createSocketTicket, validateSocketTicket } from "../redis/redis.tickets.js";
import { addToRoom, userInRoom, removeFromRoom, getLockedSeats } from "../redis/redis.sets.js";

wss.on("connection", (ws: any) => {
    console.log("Client connected");
    //handle authentication , i.e from the token
    ws.userId = undefined;
    ws.on("message", async (message: Buffer) => {
        try {
            console.log("Received message:", message);
            //authenticate uesr
            const msg = JSON.parse(message.toString());
            if (msg.type == "auth") {
                //user authentication
                const token = msg.token;
                if (!token) return;
                const userId = await validateSocketTicket(token);
                if (!userId) return;
                const inRoom = await userInRoom(userId);
                if (inRoom) {
                    return; //user cannot join multiple rooms
                }
                ws.userId = userId;
                //add this user to a room
                await addToRoom(userId);
            }
            if (!ws.userId) return;
            //user auth successfull , check weather user is in any other room
            //broadcast locked seats to this user
            const lockedSeats = await getLockedSeats(ws.userId);
            ws.send(JSON.stringify({ type: "lockedSeats", data: lockedSeats }));
        }
        catch (e) {
            console.log(e);
        }
    });

    //broadcast any message belonging to the room
});


wss.on("close", (ws: any) => {
    console.log("Client disconnected ", Date.now());
});


//make sure no zombie clients
