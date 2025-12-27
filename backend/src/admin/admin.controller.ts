import type { Request, Response } from "express";
import { execQueryPool } from "../db/connect.js";
import tryCatch from "../middlewares/tryCatch.js";

// ------------------- MOVIES -------------------

export const createMovie = async (req: Request, res: Response) => {
    await tryCatch(async (req: Request, res: Response) => {
        const { title, genres, description, price } = req.body;
        if (!title || !genres || !description || !price) {
            return res.status(400).json({ message: "All fields are required" });
        }
        // TODO: Write SQL query to insert a new movie into the 'movies' table
        // Example: INSERT INTO movies (title, genres, description, price) VALUES ($1, $2, $3, $4) RETURNING *;
        
        res.status(201).json({ message: "Movie created successfully (SQL Implementation Pending)" });
    }, req, res, "createMovie");
};

export const updateMovie = async (req: Request, res: Response) => {
    await tryCatch(async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Movie ID is required" });
        }
        const { title, genres, description, price } = req.body;
        // TODO: Write SQL query to update a movie by ID
        // Example: UPDATE movies SET title = $1, genres = $2, description = $3, price = $4 WHERE id = $5 RETURNING *;
        
        res.status(200).json({ message: "Movie updated successfully (SQL Implementation Pending)" });
    }, req, res, "updateMovie");
};

export const deleteMovie = async (req: Request, res: Response) => {
    await tryCatch(async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Movie ID is required" });
        }
        // TODO: Write SQL query to delete a movie by ID
        // Example: DELETE FROM movies WHERE id = $1 RETURNING *;
        
        res.status(200).json({ message: "Movie deleted successfully (SQL Implementation Pending)" });
    }, req, res, "deleteMovie");
};

// ------------------- SHOWS -------------------

export const createShow = async (req: Request, res: Response) => {
    await tryCatch(async (req: Request, res: Response) => {
        const { movie_id, theatre_id, show_type, show_time, seat_count } = req.body;
        if (!movie_id || !theatre_id || !show_type || !show_time || !seat_count) {
            return res.status(400).json({ message: "All fields are required" });
        }
        // TODO: Write SQL query to insert a new show into the 'shows' table
        
        res.status(201).json({ message: "Show created successfully (SQL Implementation Pending)" });
    }, req, res, "createShow");
};

export const updateShow = async (req: Request, res: Response) => {
    await tryCatch(async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Show ID is required" });
        }
        const { movie_id, theatre_id, show_type, show_time, seat_count } = req.body;
        // TODO: Write SQL query to update a show by ID
        
        res.status(200).json({ message: "Show updated successfully (SQL Implementation Pending)" });
    }, req, res, "updateShow");
};

export const deleteShow = async (req: Request, res: Response) => {
    await tryCatch(async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Show ID is required" });
        }
        // TODO: Write SQL query to delete a show by ID
        
        res.status(200).json({ message: "Show deleted successfully (SQL Implementation Pending)" });
    }, req, res, "deleteShow");
};

// ------------------- THEATRES -------------------

export const createTheatre = async (req: Request, res: Response) => {
    await tryCatch(async (req: Request, res: Response) => {
        const { name, location } = req.body;
        if (!name || !location) {
            return res.status(400).json({ message: "All fields are required" });
        }
        // TODO: Write SQL query to insert a new theatre into the 'theatres' table
        
        res.status(201).json({ message: "Theatre created successfully (SQL Implementation Pending)" });
    }, req, res, "createTheatre");
};

export const updateTheatre = async (req: Request, res: Response) => {
    await tryCatch(async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Theatre ID is required" });
        }
        const { name, location } = req.body;
        // TODO: Write SQL query to update a theatre by ID
        
        res.status(200).json({ message: "Theatre updated successfully (SQL Implementation Pending)" });
    }, req, res, "updateTheatre");
};

export const deleteTheatre = async (req: Request, res: Response) => {
    await tryCatch(async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Theatre ID is required" });
        }
        // TODO: Write SQL query to delete a theatre by ID
        
        res.status(200).json({ message: "Theatre deleted successfully (SQL Implementation Pending)" });
    }, req, res, "deleteTheatre");
};

// ------------------- UPCOMING SHOWS -------------------

export const createUpcomingShow = async (req: Request, res: Response) => {
    await tryCatch(async (req: Request, res: Response) => {
        const { movie_id, theatre_id, show_type, show_time, seat_count } = req.body;
        if (!movie_id || !theatre_id || !show_type || !show_time || !seat_count) {
            return res.status(400).json({ message: "All fields are required" });
        }
        // TODO: Write SQL query to insert a new upcoming show
        
        res.status(201).json({ message: "Upcoming Show created successfully (SQL Implementation Pending)" });
    }, req, res, "createUpcomingShow");
};

export const updateUpcomingShow = async (req: Request, res: Response) => {
    await tryCatch(async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Upcoming Show ID is required" });
        }
        const { movie_id, theatre_id, show_type, show_time, seat_count } = req.body;
        // TODO: Write SQL query to update an upcoming show
        
        res.status(200).json({ message: "Upcoming Show updated successfully (SQL Implementation Pending)" });
    }, req, res, "updateUpcomingShow");
};

export const deleteUpcomingShow = async (req: Request, res: Response) => {
    await tryCatch(async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Upcoming Show ID is required" });
        }
        // TODO: Write SQL query to delete an upcoming show
        
        res.status(200).json({ message: "Upcoming Show deleted successfully (SQL Implementation Pending)" });
    }, req, res, "deleteUpcomingShow");
};
