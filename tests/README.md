# TickingTickets API Tests

## Prerequisites

Before running tests, you must have the following running:
1.  **Test Database** (Postgres)
2.  **Test Redis**
3.  **Backend Server** running in test mode

## Local Setup Instructions

1.  **Initial Setup**:
    Ensure you have a `.env.test` or set environment variables to point to your test database.
    
    ```bash
    # Example .env.test
    DB_PORT=5434
    REDIS_URL=redis://localhost:6381
    PORT=3001
    ```

2.  **Spin up Dependencies (Docker)**:
    ```bash
    # Run a dedicated test postgres container
    docker run -d --name ticking-tickets-test-db -p 5434:5432 -e POSTGRES_PASSWORD=postgres postgres:15

    # Run a dedicated test redis container
    docker run -d --name ticking-tickets-test-redis -p 6381:6379 redis:7
    ```

3.  **Initialize Database**:
    You need to create the schema and seed data manually.
    ```bash
    # Set env vars equal to your test DB config
    export DB_PORT=5434
    export REDIS_URL=redis://localhost:6381
    
    # Run init and seed
    pnpm db:init
    pnpm db:seed
    ```

4.  **Run Tests**:
    ```bash
    # Start the backend in a separate terminal
    export PORT=3001
    pnpm dev
    
    # In another terminal, run tests
    export API_URL=http://localhost:3001/api/v1
    pnpm test
    ```

## CI/CD
Tests run automatically in GitHub Actions using ephemeral containers.
