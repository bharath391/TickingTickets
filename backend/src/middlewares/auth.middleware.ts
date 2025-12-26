import {type Response,type NextFunction} from "express";
import type {authReq} from "../types/types.js";

const authMiddleware = (req:authReq,res:Response,next:NextFunction) => {
    try{
                
    }catch(e){
        console.log("Error in auth middleware ");
        console.log(e);
    }
    
}

export default authMiddleware;