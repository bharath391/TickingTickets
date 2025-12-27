//connect to my postgresql , one to query and one getClient (to execute multiple queries in order , i.e connected to pool and then close (if user dont close , we have to close with in 5 seconds))
import { Pool } from "pg";
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Explicitly load .env from backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: String(process.env.DB_PASSWORD), // Add password, ideally from env var
    database: process.env.DB_NAME, // Specify database name
    port: parseInt(process.env.DB_PORT || '5432', 10), // Default PostgreSQL port
    max: 30, // max 30 clients only
    idleTimeoutMillis: 30000, // client in pool can be idle upto 30 sec , else its deleted
    connectionTimeoutMillis: 2000, // try to connect to my pool , but all 30 consumed , i return no clients or error in 2 seonds (i.e wait for any available clients for 2 seconds)
    maxLifetimeSeconds: 60000, // auto close client in 60 seconds (increased to 1 hour as 60s is very short for max lifetime)
});
/**
 * @template T The expected type of the rows returned by the query.
 * @param {string} query The SQL query string.
 * @param {any[]} params An array of parameters to be passed to the query.
 * @returns {Promise<QueryResult<T>>} A promise that resolves to the query result.
 * @throws {Error} Throws an error if the query execution fails.
 */
const execQueryPool = async (query, params = []) => {
    const client = await pool.connect();
    try {
        const result = await client.query(query, params);
        return result;
    }
    catch (e) {
        console.error("Error in execQuery:", query, params, e);
        throw e; // Re-throw the error so calling code can handle it
    }
    finally {
        client.release();
    }
};
export { pool, execQueryPool };
//# sourceMappingURL=connect.js.map