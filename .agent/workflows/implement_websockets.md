---
description: How to implement Real-time Seat Updates with Socket.io
---

# WebSocket Implementation Plan

This workflow outlines how to add real-time features to TickingTickets using Socket.io.

## 1. Setup Socket.io Server
- [ ] Install `socket.io`:
  ```bash
  npm install socket.io
  ```
- [ ] Initialize Socket.io in `src/index.ts`. It requires attaching to the HTTP server, not just the Express app.
  ```typescript
  import { createServer } from "http";
  import { Server } from "socket.io";
  
  const httpServer = createServer(app);
  const io = new Server(httpServer, { cors: { origin: "*" } });
  
  // Replace app.listen with httpServer.listen
  ```

## 2. Broadcast Events from Redis/Service
- [ ] Create a `socket.ts` utility to export the `io` instance.
- [ ] In `bookings.service.ts`, emit events when seats change state:
  ```typescript
  // When seats are locked
  io.to(showId).emit("seats:locked", { seatIds: [1, 2] });
  
  // When seats are sold
  io.to(showId).emit("seats:sold", { seatIds: [1, 2] });
  ```

## 3. Frontend Integration (Future)
- [ ] Connect client to show room: `socket.emit('join', showId)`.
- [ ] Listen for updates: `socket.on('seats:locked', updateUI)`.
