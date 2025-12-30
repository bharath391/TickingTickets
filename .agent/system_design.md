# System Design: Distributed TickingTickets Architecture

## Problem Statement
We need to design a scalable architecture for a ticket booking system in India with the following characteristics:
*   **Scale**: 15 Node.js servers.
*   **Geography**: Servers distributed across India (large geographic area).
*   **Goal**: Efficient queue synchronization and preventing double bookings (consistency is critical).
*   **Proposal**: Group 5 servers per Redis instance (3 groups), then sync the Redis instances.

## Core Challenge: Consistency vs. Latency
In a ticket booking system, **consistency is non-negotiable**. If two users (one in Delhi, one in Bangalore) try to book "Seat A1" for the same movie at the same time, only one must succeed.

### Analysis of User's Proposal (Hierarchical Redis)
*   **Structure**: 3 clusters (North, South, etc.), each with its own local Redis.
*   **Risk**: If Cluster A locks Seat A1 locally, and Cluster B locks Seat A1 locally *before* they sync, we have a double booking.
*   **Synchronization Complexity**: syncing active "locks" or "queues" bidirectionally in real-time is extremely complex and race-condition prone.

## Recommended Architecture: "Data Locality with Read Caching"

Instead of trying to keep 3 writable Redis masters in sync, we should shard data based on the **Location of the Theatre**.

### 1. The Strategy: Sharding by Region
A show strictly belongs to a physical theatre.
*   **Region North (e.g., Delhi)**: Holds the *Master* Redis & DB for all theatres in North India.
*   **Region South (e.g., Bangalore)**: Holds the *Master* Redis & DB for all theatres in South India.

### 2. Architecture Components

#### A. Node.js Servers (The 15 App Servers)
*   Distributed across regions (e.g., 5 in North, 5 in South, 5 in West).
*   **Smart Routing**: Any server can accept a request.
    *   If a user connects to a **North Server** to book a show in **Bangalore**:
    *   The North Server acts as a proxy (or connects directly) to the **South Redis Master**.

#### B. Caching (Read Heavy)
*   **Scenario**: 10,000 users refreshing the seat map.
*   **Mechanism**: Use standard Redis replication or local caching.
*   **Implementation**:
    *   Each cluster of 5 servers has a **Read-Only Redis Replica** or a simple local cache.
    *   They subscribe to the "Master" for updates (Pub/Sub).
    *   *Result*: Users see seat availability instantly (ms latency).

#### C. Booking (Write Critical)
*   **Scenario**: User clicks "Pay/Book".
*   **Mechanism**: The Write **MUST** go to the Authority Redis for that specific show.
*   **Flow**:
    1.  User in Delhi acts on Show in Mumbai.
    2.  Delhi Node server sends command to Mumbai Redis Master (via Redis Cluster or direct connection).
    3.  Latency: ~30-50ms (negligible for a "Booking" action which takes seconds to process payment anyway).
    4.  **Consistency**: Guaranteed. Only one Redis instance controls the locks for that show.

### 3. Queue Synchronization (BullMQ)
For background tasks (generating PDFs, sending emails, analytics):
*   These can be local!
*   If a booking is confirmed in Mumbai, the "Send Email" job can be pushed to the Mumbai Redis Queue.
*   Any worker connected to Mumbai Redis can pick it up.
*   **No need to sync queues globally** unless you need one specific centralized analytics server.

## Summary of Proposed Topology

| Component | Role | Location | Sync Strategy |
| :--- | :--- | :--- | :--- |
| **Redis Master A** | Authority for Theatres in Region A | Mumbai | Master for Region A data |
| **Redis Master B** | Authority for Theatres in Region B | Bangalore | Master for Region B data |
| **Redis Master C** | Authority for Theatres in Region C | Delhi | Master for Region C data |
| **Node Servers** | Application Logic | Distributed | Connects to specific Redis Master based on `theatre_id` |
| **Queues** | Async Jobs | Local to Master | Processed by workers in the same region |

### Why this is better?
1.  **Zero Double Bookings**: Lock logic is atomic on a single node.
2.  **Simplified Sync**: No need to handle conflict resolution between 3 masters.
3.  **Low Latency Reads**: Seat maps are cached locally.
4.  **Acceptable Latency Writes**: Crossing India (~40ms) is fine for a transactional button click.

---

## Action Plan
1.  **Define Routing Logic**: How do we know which Redis to talk to? (Hash map `theatre_id` -> `redis_url`).
2.  **Redis Pub/Sub**: Use for invalidating local caches when a seat is booked.
3.  **Queues**: Use standard queues attached to the regional master.
