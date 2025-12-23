import {Router} from "express";
import authRouter from "./auth/auth.route.js";

const v1Router = Router();


v1Router.get("/",(req,res) => {
    return res.status(200).json({msg:"Hello there"});
});
v1Router.use("/auth",authRouter);



export default v1Router;