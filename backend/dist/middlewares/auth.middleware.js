import {} from "express";
const userAuthMiddleware = (req, res, next) => {
    try {
        //check user jwt and assign user to incoming req = authReq
        next();
    }
    catch (e) {
        console.log("Error in auth middleware ");
        console.log(e);
    }
};
const adminAuthMiddleware = (req, res, next) => {
    try {
        //check user jwt and assign user to incoming req = authReq
    }
    catch (e) {
        console.log("Error in auth middleware ");
        console.log(e);
    }
};
export { userAuthMiddleware, adminAuthMiddleware };
//# sourceMappingURL=auth.middleware.js.map