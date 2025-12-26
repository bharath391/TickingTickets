import tryCatch from "../middlewares/tryCatch.js";
const singup = async (req, res) => {
    await tryCatch({
    //use raw sql query to singup , //industry standard checks (email regix and other must be checked)
    //login using email and password , email unique 
    }, req, res, "singup");
};
const login = async (req, res) => {
    await tryCatch({
    //valid user , provide jwt (cookies) req.cookies("token") , expire 15 days
    }, req, res, "login");
};
export { singup, login };
//# sourceMappingURL=auth.controller.js.map