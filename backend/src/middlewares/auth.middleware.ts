import {type Response,type NextFunction} from "express";
import type {authReq} from "../types/types.js";

const userAuthMiddleware = (req:authReq,res:Response,next:NextFunction) => {
    try{
        //check user jwt and assign user to incoming req = authReq
    }catch(e){
        console.log("Error in auth middleware ");
        console.log(e);
    }
    
}
const adminAuthMiddleware = (req:authReq,res:Response,next:NextFunction) => {
    try{
        //check user jwt and assign user to incoming req = authReq
    }catch(e){
        console.log("Error in auth middleware ");
        console.log(e);
    }
    
}

export {userAuthMiddleware,adminAuthMiddleware};