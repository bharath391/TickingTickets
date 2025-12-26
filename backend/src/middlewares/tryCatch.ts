import { type NextFunction, type Request, type Response } from "express";

const tryCatch = async (
  fn: (req: Request, res: Response) => Promise<any>,
  req: Request,
  res: Response,
  controllerName: string,
) => {
  try {
    await fn(req, res);
  } catch (e) {
    console.log("Error in", controllerName, "-----");
    console.log(e);

    if (!res.headersSent) {
      res.status(500).json({ msg: "Internal Server Error" });
    }
  }
};

export default tryCatch;