import express from "express";
import dotenv from "dotenv";
import v1Router from "./routers/v1.route.js";
import loggerMiddleware from "./middlewares/logger.middleware.js";
dotenv.config();
const app = express();
app.use(loggerMiddleware);
app.use(express.json());
app.use("/v1", v1Router);
app.listen(process.env.PORT, () => console.log("Server Listening on port ", process.env.PORT));
//# sourceMappingURL=index.js.map