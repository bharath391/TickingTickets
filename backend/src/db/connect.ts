import { Pool, type QueryResult } from "pg";
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: String(process.env.DB_PASSWORD),
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    max: 30,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    maxLifetimeSeconds: 60000,
});

const execQueryPool = async (query: string, params: any[] = []): Promise<any> => {
    const client = await pool.connect();
    try {
        const result: QueryResult<any> = await client.query(query, params);
        return result;
    } catch (e) {
        console.error("Error in execQuery:", query, params, e);
        throw e; // Re-throw the error so calling code can handle it
    } finally {
        client.release();
    }
};

export { pool, execQueryPool };