import {type Request,type Response,type NextFunction} from "express";
import jwt from "jsonwebtoken";

const adminAuth = (req:Request,res:Response,next:NextFunction)=>{
    try{
        //validate the admin jwt
        const jwt = req.cookies.jwt;
        if(!jwt.verify(process.env.JWT_SECRET)){
            res.status(401).json({msg:"Unauthorized"});
        }
        const user = jwt.decode(jwt,process.env.JWT_SECRET);
        req.user = user;
        next();
    }catch(e){
        res.status(500).json({msg:"Internal Server Error"});
        console.log("Error in Admin auth middleware");
        console.log(e);
    }
}

export default adminAuth;