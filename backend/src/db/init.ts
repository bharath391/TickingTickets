import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { pool } from './connect.js';

// Load environment variables for the pool
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const initDatabase = async () => {
    try {
        const schemaPath = path.resolve(__dirname, 'schema.sql');
        const sql = await fs.readFile(schemaPath, 'utf8');

        console.log("🚀 Starting Database Initialization...");

        // pool.query handles multiple statements in a single string
        await pool.query(sql);

        console.log("✅ Database Schema Applied Successfully!");
    } catch (error) {
        console.error("❌ Error initializing database:", error);
    } finally {
        // Close the pool to allow the process to exit
        await pool.end();
        console.log("👋 Database connection closed.");
    }
};

initDatabase();
