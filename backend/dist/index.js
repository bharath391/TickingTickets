import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import v1Router from "./routers/v1.route.js";
import loggerMiddleware from "./middlewares/logger.middleware.js";
dotenv.config();
const app = express();
app.use(cors({
    origin: "http://localhost:3000", // Frontend URL
    credentials: true // Allow cookies
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
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server Listening on port ${PORT}`));
//# sourceMappingURL=index.js.map