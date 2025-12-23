# TickingTickets Backend

## Project Overview
This is the backend service for **TickingTickets**, a ticket booking platform. It handles user authentication, theatre/movie management, show scheduling, and ticket bookings. It supports real-time features via Socket.IO and uses PostgreSQL for data persistence.

## Tech Stack
*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Language:** TypeScript
*   **Database:** PostgreSQL (`pg` library)
*   **Real-time:** Socket.IO
*   **Auth:** JWT (HTTP-only cookies) + bcryptjs
*   **Dev Tools:** `nodemon`, `tsx`

## Architecture

### Directory Structure
```
src/
├── auth/           # Authentication logic (Controller, Routes)
├── bookings/       # Booking logic (Controller, Routes)
├── db/             # Database config (Pool) & Schema
├── middleware/     # Auth & Logger middleware
├── payment/        # Payment integration (Placeholder)
├── redis/          # Redis locking/queue (Placeholder)
├── shows/          # Show management (Controller, Routes)
├── utils/          # Helpers (tryCatch wrapper)
├── index.ts        # Application entry point & Server setup
└── v1.route.ts     # Main API router (v1)
```

### Key Components

*   **Database (`src/db/`):**
    *   `db.config.ts`: Manages a PostgreSQL connection pool. Exports `query` for standard operations and `getClient` for transactions.
    *   `schema.sql`: Defines the database schema, including Users, Theatres, Screens (JSON layout), Movies, Shows, and Bookings.
    *   **Ownership Model:** Theatres and Movies are owned by specific users (role: 'owner').
    *   **Screens:** Uses a JSONB column `seat_layout` to store the exact seat grid configuration.

*   **Authentication:**
    *   Uses JWT stored in secure HTTP-only cookies.
    *   `auth.middleware.ts` protects routes by verifying the cookie and attaching `req.user`.

*   **Error Handling:**
    *   `src/utils/tryCatch.ts`: An async wrapper function used in controllers to catch errors centrally and prevent server crashes.

*   **Real-time:**
    *   Socket.IO server is initialized in `index.ts`, sharing the same HTTP port as Express.

## Building and Running

### Prerequisites
*   Node.js installed.
*   PostgreSQL running locally with credentials matching `src/db/db.config.ts` (or `.env` variables).

### Commands
| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the server in development mode with hot-reloading (nodemon + tsx). |
| `npm run build` | Compiles TypeScript to JavaScript (into `dist/`). |
| `npm start` | Runs the compiled production build. |
| `npm run worker1` | Runs a background worker script. |

## Development Conventions

1.  **Async/Await:** All database interactions are async.
2.  **Error Handling:** Wrap all controller logic in `tryCatch(async () => { ... }, res, "ControllerName")`.
3.  **Database Queries:** 
    *   ALWAYS use parameterized queries (`$1, $2`) to prevent SQL injection.
    *   Use `db.query` for single statements.
    *   Use `db.getClient` + `BEGIN/COMMIT/ROLLBACK` for multi-step transactions (e.g., booking a ticket).
4.  **Routing:** 
    *   Routes are modularized by feature (`auth.route.ts`, `bookings.route.ts`, etc.).
    *   Ensure new route modules are mounted in `src/v1.route.ts`.

## Current Status & TODOs
- [x] **Auth:** Signup/Login implemented and secured.
- [x] **Schema:** Comprehensive schema designed (Users, Theatres, Screens, Movies, Shows, Bookings).
- [ ] **DB Migration:** Schema needs to be applied to the database.
- [ ] **Routing:** `bookings` and `shows` routers need to be mounted in `v1.route.ts`.
- [ ] **Feature Logic:** 
    -   Implement CRUD for Theatres/Movies/Shows (checking ownership).
    -   Implement Booking logic with transactions (atomic checks).
    -   Implement Seat Layout parsing/fetching.
