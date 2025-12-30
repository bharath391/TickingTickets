import express from "express";
import { WebSocketServer } from "ws";
import http from "http";
import { createClient } from "redis";

const app = express();
const httpServer = http.createServer(app);
const wss = new WebSocketServer({ server: httpServer });

// ROOM INDEX: map['room-name'] = Set of client sockets
const rooms = new Map<string, Set<any>>();

// Helper functions for Room Indexing
function joinRoom(roomName: string, ws: any) {
  if (!rooms.has(roomName)) {
    rooms.set(roomName, new Set());
  }
  rooms.get(roomName)?.add(ws);
  ws.room = roomName;
}

function leaveRoom(ws: any) {
  if (ws.room && rooms.has(ws.room)) {
    rooms.get(ws.room)?.delete(ws);
    if (rooms.get(ws.room)?.size === 0) {
      rooms.delete(ws.room);
    }
  }
}

// REDIS SETUP (Scaling)
const pubClient = createClient();
const subClient = pubClient.duplicate();

async function initRedis() {
  await pubClient.connect();
  await subClient.connect();

  // Listen for global messages
  await subClient.subscribe("GLOBAL_CHANNEL", (message) => {
    const data = JSON.parse(message);
    const { room, payload } = data;

    // Send to LOCAL users in this room
    const localClients = rooms.get(room);
    if (localClients) {
      localClients.forEach(client => {
        if (client.readyState === 1 && client.isAuthenticated) {
          client.send(JSON.stringify(payload));
        }
      });
    }
  });
}

initRedis().catch(console.error);

app.use(express.json({ limit: '5mb' }));
app.get('/', (req, res) => res.status(200).json({ msg: "Hello" }));

wss.on("connection", (ws: any) => {
  console.log("Someone Trying to connect");
  ws.isAuthenticated = false;
  ws.isAlive = true;
  joinRoom("general", ws);

  ws.on("pong", () => {
    ws.isAlive = true;
  });

  ws.on("message", (msg: Buffer) => {
    try {
      const incomingJson = JSON.parse(msg.toString());

      if (incomingJson.type === "auth") {
        ws.isAuthenticated = true;
        ws.send(JSON.stringify({ type: "auth", status: "success" }));
        return;
      }

      if (!ws.isAuthenticated) {
        ws.send(JSON.stringify({ error: "Unauthorized" }));
        ws.terminate();
        return;
      }

      if (incomingJson.type === "join") {
        leaveRoom(ws);
        joinRoom(incomingJson.room, ws);
        ws.send(JSON.stringify({ type: "room_update", room: ws.room }));
        return;
      }

      // BROADCASTING (via Redis)
      const messagePayload = {
        type: "BROADCAST",
        from: "someone",
        room: ws.room,
        message: incomingJson.message || incomingJson
      };

      pubClient.publish("GLOBAL_CHANNEL", JSON.stringify({
        room: ws.room,
        payload: messagePayload
      }));

    } catch (e) {
      ws.send(JSON.stringify({ error: "Invalid JSON format" }));
    }
  })

  ws.on("close", (code: number) => {
    leaveRoom(ws);
    console.log("client disconnected. Code:", code);
  })
})

// HEARTBEAT CHECK
const interval = setInterval(() => {
  wss.clients.forEach((ws: any) => {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on('close', () => clearInterval(interval));

httpServer.listen(3000, () => console.log("http server and socket listening on port 3k"));