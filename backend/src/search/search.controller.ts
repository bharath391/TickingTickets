import type { Request, Response } from "express";
import tryCatch from "../middlewares/tryCatch.js";
import { execQueryPool } from "../db/connect.js";

export const searchShows = async (req: Request, res: Response) => {
    await tryCatch(async (req: Request, res: Response) => {
        const { 
            title, 
            theatre, 
            genre, 
            startDate, 
            endDate, 
            limit,
            page 
        } = req.query;

        const limitNum = Number(limit) || 10;
        const pageNum = Number(page) || 1;
        const offset = (pageNum - 1) * limitNum;

        const query = `
            SELECT 
                s.id AS show_id,
                s.show_time,
                s.seat_count,
                s.show_type,
                m.title AS movie_title,
                m.genres AS movie_genre,
                m.description AS movie_desc,
                m.price AS movie_price,
                t.name AS theatre_name,
                t.location AS theatre_location
            FROM shows s
            JOIN movies m ON s.movie_id = m.id
            JOIN theatres t ON s.theatre_id = t.id
            WHERE 
                ($1::text IS NULL OR m.title ILIKE '%' || $1 || '%') 
                AND ($2::text IS NULL OR t.name ILIKE '%' || $2 || '%') 
                AND ($3::text IS NULL OR m.genres ILIKE '%' || $3 || '%') 
                AND ($4::timestamp IS NULL OR s.show_time >= $4) 
                AND ($5::timestamp IS NULL OR s.show_time <= $5)
                AND ($8::uuid IS NULL OR s.id = $8)
            ORDER BY s.show_time ASC
            LIMIT $6 OFFSET $7;
        `;

        const values = [
            title || null,
            theatre || null,
            genre || null,
            startDate || null,
            endDate || null,
            limitNum,
            offset,
            req.query.showId || null
        ];

        const result = await execQueryPool(query, values);

        res.status(200).json({ 
            message: "Search results fetched successfully", 
            data: result.rows,
            meta: {
                page: pageNum,
                limit: limitNum,
                count: result.rowCount,
                filters: {
                    title, theatre, genre, startDate, endDate, showId: req.query.showId
                }
            }
        });
    }, req, res, "searchShows");
};
