type role = "user" | "admin";
interface authReq extends Request{
    user?:{
        id:string,
        email:string,
        role:role
    }
}




export type {authReq};