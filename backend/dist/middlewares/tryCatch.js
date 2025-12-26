import {} from "express";
const tryCatch = async (fn, req, res, controllerName) => {
    try {
        await fn(req, res);
    }
    catch (e) {
        console.log("Error in", controllerName, "-----");
        console.log(e);
        if (!res.headersSent) {
            res.status(500).json({ msg: "Internal Server Error" });
        }
    }
};
export default tryCatch;
//# sourceMappingURL=tryCatch.js.map