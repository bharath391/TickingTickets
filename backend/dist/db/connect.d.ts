import { Pool } from "pg";
declare const pool: Pool;
/**
 * @template T The expected type of the rows returned by the query.
 * @param {string} query The SQL query string.
 * @param {any[]} params An array of parameters to be passed to the query.
 * @returns {Promise<QueryResult<T>>} A promise that resolves to the query result.
 * @throws {Error} Throws an error if the query execution fails.
 */
declare const execQueryPool: (query: string, params?: any[]) => Promise<any>;
export { pool, execQueryPool };
//# sourceMappingURL=connect.d.ts.map