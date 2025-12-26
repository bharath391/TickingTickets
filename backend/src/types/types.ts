interface authReq extends Request{
    user?:{
        id:string,
        email:string
    }
}




export type {authReq};