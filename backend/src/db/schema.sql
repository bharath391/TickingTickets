-- DROP TABLES (Cleanup for development)
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS shows CASCADE;
DROP TABLE IF EXISTS movies CASCADE;
DROP TABLE IF EXISTS screens CASCADE;
DROP TABLE IF EXISTS theatres CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user', 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Theatres Table 
CREATE TABLE theatres (
    id SERIAL PRIMARY KEY,
    owner_id INT REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Screens Table 
CREATE TABLE screens (
    id SERIAL PRIMARY KEY,
    theatre_id INT REFERENCES theatres(id) ON DELETE CASCADE,
    screen_number INT NOT NULL,
    seat_layout JSONB NOT NULL, 
    total_capacity INT NOT NULL,
    CONSTRAINT unique_screen_per_theatre UNIQUE (theatre_id, screen_number)
);

-- Movies Table
CREATE TABLE movies (
    id SERIAL PRIMARY KEY,
    owner_id INT REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INT,
    language VARCHAR(50),
    poster_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Shows Table
CREATE TABLE shows (
    id SERIAL PRIMARY KEY,
    movie_id INT REFERENCES movies(id) ON DELETE CASCADE,
    screen_id INT REFERENCES screens(id) ON DELETE CASCADE, 
    start_time TIMESTAMP NOT NULL,
    price_standard DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    price_vip DECIMAL(10, 2) DEFAULT NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_show_time_screen UNIQUE (screen_id, start_time)
);

-- Bookings Table 
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    show_id INT REFERENCES shows(id) ON DELETE CASCADE,
    seat_row VARCHAR(10) NOT NULL, 
    seat_number INT NOT NULL,      
    status VARCHAR(20) DEFAULT 'CONFIRMED', 
    booking_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_seat_per_show UNIQUE (show_id, seat_row, seat_number)
);

-- Indexes
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_show ON bookings(show_id);
CREATE INDEX idx_shows_movie ON shows(movie_id);
CREATE INDEX idx_screens_theatre ON screens(theatre_id);
