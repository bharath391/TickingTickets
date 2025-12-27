# Project Progress - TickingTickets

## Context Summary (December 27, 2025)

### 1. Authentication Module
- **Email Validation**: Implemented regex validation (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`) for email addresses in both `signup` and `login` controllers in `backend/src/auth/auth.controller.ts`.
- **JWT Security**: 
    - Updated `login` to set the JWT as an **HTTP-only cookie** named `jwt`.
    - Cookie options: `httpOnly: true`, `sameSite: true`, and `maxAge` set to 15 days.
    - JWT `expiresIn` updated to `15d`.
- **Admin Auth**: Added `adminLogin` endpoint and fixed `adminAuthMiddleware` to correctly handle JWT payload.

### 2. Admin Module
- **Cleanup**: Removed all "Read" (GET) functionality from `backend/src/admin/admin.controller.ts`.
- **CRUD Operations**: Implemented Create, Update, Delete for Movies, Shows, and Theatres.
- **Integration**: Added a `/search` route to the admin router.

### 3. Search Module
- **New Feature**: Created a dedicated search module in `backend/src/search/`.
- **Controller**: Implemented `searchShows` with SQL queries using `ILIKE` for filtering by Title, Theatre, Genre, Date, etc.
- **Routing**: Mounted at `/api/v1/usersearch` (User) and `/api/v1/admin/search` (Admin).

### 4. Architecture & Booking Flow
- Discussed "Flash Sale" architecture (Redis + BullMQ).
- **Decision**: Use "Two-Stage Locking":
    1.  Hold seat for 30s-1m on click.
    2.  Extend to 5m on checkout start.
- **Pending**: Implementation of this flow in `bookings` module.

### 5. Frontend (Next.js + Tailwind)
- **Tech Stack**: Next.js 16, Tailwind CSS 4, Axios, React 19.
- **Pages**:
    - `/login`: User login page.
    - `/signup`: User signup page.
    - `/`: Home page with Search functionality (calls `/usersearch`).
    - `/admin/dashboard`: Admin dashboard (Create Theatre form).
- **Testing**: Setup Vitest + React Testing Library. Added unit tests for `HomePage` component.

### 6. Technical Verification
- Backend compiles and tests pass (`npm run build`, `pnpm test`).
- Frontend tests pass (`npx vitest run`).

## Critical Instructions
- **Do not assume on your own.** Always ask for clarification on critical business logic decisions like timeouts or workflow steps.