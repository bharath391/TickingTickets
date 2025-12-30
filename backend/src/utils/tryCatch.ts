export default async function tryCatch(fn: Function, functionParams: any[], controllerName: string) {
    try {
        return await fn(...functionParams);
    } catch (e) {
        console.log("Error in executing function ", controllerName);
        console.log(e);
    }
}