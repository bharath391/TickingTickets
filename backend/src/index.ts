import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import v1Router from "./routers/v1.route.js";
import loggerMiddleware from "./middlewares/logger.middleware.js";

dotenv.config();
const app = express();

app.use(loggerMiddleware);
app.use(cookieParser());
app.use(express.json());
app.use("/api/v1",v1Router);

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.get("/health", (req, res) => {
    res.json({ status: "ok", message: "Server is running" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server Listening on port ${PORT}`));
