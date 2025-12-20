import express from "express";
import { createServer } from "http";
import { query, getClient } from "./db/db.config.js";
import dotenv from "dotenv";
import { initSocket } from "./ws.js";
dotenv.config();
const app = express();
const httpServer = createServer(app);
// Initialize Socket.IO
initSocket(httpServer);
const res = await query("select * from students", []);
console.log(res);
httpServer.listen(process.env.PORT, () => console.log("Server listening on port ", process.env.PORT));
//# sourceMappingURL=index.js.map