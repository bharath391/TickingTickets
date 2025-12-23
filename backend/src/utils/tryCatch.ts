import {type Request,type Response,type NextFunction} from "express";

const tryCatch = async (fn:() => Promise<void>,res:Response,controllerName:string) => {
    try{
        await fn();
    }catch(e){
        console.log("Error in ",controllerName," controller");
        console.log("Error : ",e);
        res.status(500).json({msg:"Internal Server Error"});
        return;
    }

};

export default tryCatch;