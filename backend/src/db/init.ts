import "dotenv/config";
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './connect.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const initDatabase = async () => {
    try {
        const schemaPath = path.resolve(__dirname, 'schema.sql');
        const sql = await fs.readFile(schemaPath, 'utf8');

        console.log("Starting Database Initialization...");

        await pool.query(sql);

        console.log("Database Schema Applied Successfully!");
    } catch (error) {
        console.error("Error initializing database:", error);
    } finally {
        await pool.end();
        console.log("Database connection closed.");
    }
};

initDatabase();
