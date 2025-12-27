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
        const query = "INSERT INTO movies (title, genres, description, price) VALUES ($1, $2, $3, $4) RETURNING *;";
        const values = [title, genres, description, price];
        const result = await execQueryPool(query, values);
        if (result.rowCount === 0){
            res.status(500).json({ message: "Error creating movie" });
            return;
        } 
        res.status(201).json({ message: "Movie created successfully" });
    }, req, res, "createMovie");
};

export const updateMovie = async (req: Request, res: Response) => {
    await tryCatch(async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Movie ID is required" });
        }
        const { title, genres, description, price } = req.body;
        const beforeValues  = await execQueryPool("SELECT * FROM movies WHERE id = $1;", [id]);
        if (beforeValues.rowCount === 0){
            res.status(404).json({ message: "Movie not found" });
            return;
        }
        const query = "UPDATE movies SET title = $1, genres = $2, description = $3, price = $4 WHERE id = $5 RETURNING *;";

        const values = [title || beforeValues.rows[0].title, genres || beforeValues.rows[0].genres, description || beforeValues.rows[0].description, price || beforeValues.rows[0].price, id];
        const result = await execQueryPool(query, values);
        if (result.rowCount === 0){
            res.status(500).json({ message: "Error updating movie" });
            return;
        }
        res.status(200).json({ message: "Movie updated successfully" });
    }, req, res, "updateMovie");
};

export const deleteMovie = async (req: Request, res: Response) => {
    await tryCatch(async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Movie ID is required" });
        }
        
        const query = "DELETE FROM movies WHERE id = $1 RETURNING *;";
        const values = [id];
        const result = await execQueryPool(query, values);
        if (result.rowCount === 0){
            res.status(404).json({ message: "Movie not found or already deleted" });
            return;
        }  
        res.status(200).json({ message: "Movie deleted successfully" });
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
        const query = "INSERT INTO shows (movie_id, theatre_id, show_type, show_time, seat_count) VALUES ($1, $2, $3, $4, $5) RETURNING *;";
        const values = [movie_id, theatre_id, show_type, show_time, seat_count];
        const result = await execQueryPool(query, values);
        if (result.rowCount === 0){
            res.status(500).json({ message: "Error creating show" });
            return;
        }
        res.status(201).json({ message: "Show created successfully" });
    }, req, res, "createShow");
};

export const updateShow = async (req: Request, res: Response) => {
    await tryCatch(async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Show ID is required" });
        }
        const { movie_id, theatre_id, show_type, show_time, seat_count } = req.body;
        
        const result = await execQueryPool("SELECT * FROM shows WHERE id = $1", [id]);
        if (result.rowCount == 0) {
            return res.status(404).json({ msg: "Show not found" });
        }
        
        const query = "UPDATE shows SET movie_id = $1, theatre_id = $2, show_type = $3, show_time = $4, seat_count = $5 WHERE id = $6 RETURNING *";
        const values = [
            movie_id || result.rows[0].movie_id,
            theatre_id || result.rows[0].theatre_id,
            show_type || result.rows[0].show_type,
            show_time || result.rows[0].show_time,
            seat_count || result.rows[0].seat_count,
            id
        ];
        
        const updated = await execQueryPool(query, values);
        res.status(200).json({ message: "Show updated successfully", data: updated.rows[0] });
    }, req, res, "updateShow");
};

export const deleteShow = async (req: Request, res: Response) => {
    await tryCatch(async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Show ID is required" });
        }
        
        const query = "DELETE FROM shows WHERE id = $1 RETURNING *";
        const values = [id];
        const result = await execQueryPool(query, values);
        
        if (result.rowCount == 0) {
            return res.status(404).json({ msg: "Show not found" });
        }
        res.status(200).json({ message: "Show deleted successfully" });
    }, req, res, "deleteShow");
};

// ------------------- THEATRES -------------------

export const createTheatre = async (req: Request, res: Response) => {
    await tryCatch(async (req: Request, res: Response) => {
        const { name, location } = req.body;
        if (!name || !location) {
            return res.status(400).json({ message: "All fields are required" });
        }
        
        const query = "INSERT INTO theatres (name, location) VALUES ($1, $2) RETURNING *;";
        const values = [name, location];
        const result = await execQueryPool(query, values);
        
        if (result.rowCount === 0) {
            return res.status(500).json({ message: "Error creating theatre" });
        }
        
        res.status(201).json({ message: "Theatre created successfully", data: result.rows[0] });
    }, req, res, "createTheatre");
};

export const updateTheatre = async (req: Request, res: Response) => {
    await tryCatch(async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Theatre ID is required" });
        }
        const { name, location } = req.body;
        
        const beforeValues = await execQueryPool("SELECT * FROM theatres WHERE id = $1;", [id]);
        if (beforeValues.rowCount === 0) {
            return res.status(404).json({ message: "Theatre not found" });
        }

        const query = "UPDATE theatres SET name = $1, location = $2 WHERE id = $3 RETURNING *;";
        const values = [name || beforeValues.rows[0].name, location || beforeValues.rows[0].location, id];
        const result = await execQueryPool(query, values);

        if (result.rowCount === 0) {
            return res.status(500).json({ message: "Error updating theatre" });
        }

        res.status(200).json({ message: "Theatre updated successfully", data: result.rows[0] });
    }, req, res, "updateTheatre");
};

export const deleteTheatre = async (req: Request, res: Response) => {
    await tryCatch(async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Theatre ID is required" });
        }
        
        const query = "DELETE FROM theatres WHERE id = $1 RETURNING *;";
        const values = [id];
        const result = await execQueryPool(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Theatre not found or already deleted" });
        }

        res.status(200).json({ message: "Theatre deleted successfully" });
    }, req, res, "deleteTheatre");
};

