import type { Request, Response } from "express";
import tryCatch from "../utils/tryCatch.js";
import { query } from "../db/db.config.js";

const getShows = async (req: Request, res: Response) => {
    await tryCatch(async () => {
        // TODO: Logic to fetch all shows
        // const shows = await query("SELECT * FROM shows", []);
        res.status(200).json({ msg: "Get all shows" });
    }, res, "getShows");
};

const getShowById = async (req: Request, res: Response) => {
    await tryCatch(async () => {
        const { id } = req.params;
        // TODO: Logic to fetch single show
        res.status(200).json({ msg: `Get show ${id}` });
    }, res, "getShowById");
};

const createShow = async (req: Request, res: Response) => {
    await tryCatch(async () => {
        const { title, time, seats } = req.body;
        // TODO: Admin check logic?
        // TODO: Insert show logic
        res.status(201).json({ msg: "Show created" });
    }, res, "createShow");
};

export { getShows, getShowById, createShow };
