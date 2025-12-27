import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly point to the .env file in the backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { pool } from './connect.js';

const seedDatabase = async () => {
    try {
        console.log("🌱 Starting Database Seed...");

        // 1. Clear existing data (Optional, but good for resetting)
        await pool.query('TRUNCATE TABLE bookings, shows, theatres, movies, users, admins CASCADE');

        // 2. Create Users
        const users = await pool.query(`
            INSERT INTO users (name, email, password) VALUES 
            ('Alice User', 'alice@example.com', 'password123'),
            ('Bob User', 'bob@example.com', 'password123')
            RETURNING id;
        `);
        console.log(`✅ Created ${users.rowCount} Users`);

        // 3. Create Admin
        await pool.query(`
            INSERT INTO admins (name, email, password) VALUES 
            ('Super Admin', 'admin@example.com', 'adminpass')
        `);
        console.log(`✅ Created Admin`);

        // 4. Create Movies
        const movies = await pool.query(`
            INSERT INTO movies (title, description, genres, price) VALUES 
            ('Inception', 'A thief who steals corporate secrets through the use of dream-sharing technology.', 'Sci-Fi, Action', 250),
            ('Interstellar', 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity''s survival.', 'Sci-Fi, Adventure', 300),
            ('The Dark Knight', 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham.', 'Action, Crime', 200),
            ('Avengers: Endgame', 'After the devastating events of Infinity War, the universe is in ruins.', 'Action, Adventure', 350),
            ('Parasite', 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.', 'Drama, Thriller', 180)
            RETURNING id, title;
        `);
        console.log(`✅ Created ${movies.rowCount} Movies`);

        // 5. Create Theatres
        const theatres = await pool.query(`
            INSERT INTO theatres (name, location) VALUES 
            ('PVR Cinemas', 'Downtown Mall'),
            ('IMAX Theatre', 'Tech Park')
            RETURNING id, name;
        `);
        console.log(`✅ Created ${theatres.rowCount} Theatres`);

        // 6. Create Shows
        // Mix and match movies and theatres
        const showValues = [];
        const showTypes = ['Morning', 'Matinee', 'Evening', 'Late Night'];
        
        // Helper to pick random item
        const random = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

        for (const theatre of theatres.rows) {
            for (const movie of movies.rows) {
                // Create 2 shows for every movie at every theatre
                for (let i = 0; i < 2; i++) {
                    const showType = random(showTypes);
                    const seatCount = Math.floor(Math.random() * 50) + 50; // 50-100 seats
                    
                    // Set show time to tomorrow + random hours
                    const showTime = new Date();
                    showTime.setDate(showTime.getDate() + 1);
                    showTime.setHours(10 + Math.floor(Math.random() * 10), 0, 0);

                    // We need to use parameterized query in the loop or build a massive string
                    // For simplicity in seeding, I'll execute one by one
                    await pool.query(`
                        INSERT INTO shows (movie_id, theatre_id, seat_count, show_type, show_time)
                        VALUES ($1, $2, $3, $4, $5)
                    `, [movie.id, theatre.id, seatCount, showType, showTime]);
                }
            }
        }
        console.log(`✅ Created Shows for all movies/theatres`);

        console.log("🎉 Database Seeded Successfully!");

    } catch (error) {
        console.error("❌ Error seeding database:", error);
    } finally {
        await pool.end();
    }
};

seedDatabase();
