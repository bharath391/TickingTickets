//user enters show room --> start websocket --> show real time data , thats it !

import { Router, type Router as RouterType } from "express";

const router: RouterType = Router();

router.post("/enter-show", (req, res) => {
    //now users give me his userId , token , showId    
    //make this user join the show room
    //update him/her with real time seats availability

});
