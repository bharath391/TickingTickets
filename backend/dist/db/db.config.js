import { Pool } from 'pg';
const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: 'bharathm',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    maxLifetimeSeconds: 60
});
export const query = async (text, params) => {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('executed query', { text, duration, rows: res.rowCount });
    return res;
};
export const getClient = async () => {
    // We must force-cast it because the default pool.connect() doesn't know about 'lastQuery'.
    const client = await pool.connect();
    const query = client.query;
    const release = client.release;
    const timeout = setTimeout(() => {
        console.error('A client has been checked out for more than 5 seconds!');
        console.error(`The last executed query on this client was: ${JSON.stringify(client.lastQuery)}`);
    }, 5000);
    // Monkey patch
    client.query = ((...args) => {
        client.lastQuery = args;
        return query.apply(client, args);
    });
    client.release = () => {
        clearTimeout(timeout);
        client.query = query;
        client.release = release;
        return release.apply(client);
    };
    return client;
};
//# sourceMappingURL=db.config.js.map