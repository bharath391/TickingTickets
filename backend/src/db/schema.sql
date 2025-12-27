-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Reset Schema (Drop tables in reverse dependency order)
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS shows CASCADE;
DROP TABLE IF EXISTS theatres CASCADE;
DROP TABLE IF EXISTS movies CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS admins CASCADE;

-- 1. Movies
CREATE TABLE IF NOT EXISTS movies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    genres VARCHAR(255),
    description TEXT,
    price INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    -- booking_status: prevents booking multiple tickets at the same time
    booking_status BOOLEAN DEFAULT FALSE,
    -- show_id: stores the ID of the show currently being booked (null if not booking)
    show_id UUID, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Admins
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Theatres
CREATE TABLE IF NOT EXISTS theatres (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Shows
CREATE TABLE IF NOT EXISTS shows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
    theatre_id UUID REFERENCES theatres(id) ON DELETE CASCADE,
    seat_count INTEGER DEFAULT 0,
    show_type VARCHAR(50) NOT NULL,
    show_time TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Bookings
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    show_id UUID REFERENCES shows(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_movies_title ON movies(title);
CREATE INDEX IF NOT EXISTS idx_theatres_name ON theatres(name);
CREATE INDEX IF NOT EXISTS idx_shows_theatre ON shows(theatre_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
