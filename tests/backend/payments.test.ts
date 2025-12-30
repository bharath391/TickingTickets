import { describe, it, expect, beforeAll } from 'vitest';
import axios from 'axios';
import { initializeSeatsForShow } from '../../backend/src/redis/redis.sets';

const BASE_URL = 'http://localhost:4000/api/v1';

describe('Payment Integration Tests', () => {
    // We will use the existing Alice user from seed
    const userCreds = { email: 'alice@example.com', password: 'password123' };
    let userCookie: string | undefined;

    // Helper to extract cookie
    const getCookie = (res: any) => {
        const cookies = res.headers['set-cookie'];
        if (!cookies) return undefined;
        const jwtCookie = cookies.find((c: string) => c.startsWith('jwt='));
        return jwtCookie ? jwtCookie.split(';')[0] : undefined;
    };

    beforeAll(async () => {
        // Login User
        try {
            const userRes = await axios.post(`${BASE_URL}/auth/login`, userCreds);
            userCookie = getCookie(userRes);
            console.log("Logged in as Alice");
        } catch (e: any) {
            console.error("User login failed", e.message);
        }

        // Initialize Redis for Show 1 (Fix for missing seed data)
        try {
            await initializeSeatsForShow("1", 100);
            console.log("Initialized Redis seats for Show 1");
        } catch (e) {
            console.error("Failed to init Redis seats", e);
        }
    });

    let orderData: any;
    const showId = "1"; // Assuming show with ID 1 exists from seed

    it('should initiate payment and create order', async () => {
        expect(userCookie).toBeDefined();

        // 1. Lock random seats to ensure availability (Retry logic)
        let seatsLocked = false;
        let retries = 5;

        while (retries > 0 && !seatsLocked) {
            const randomSeat1 = Math.floor(Math.random() * 50) + 1;
            const randomSeat2 = Math.floor(Math.random() * 50) + 1;
            if (randomSeat1 === randomSeat2) continue; // skip duplicates

            try {
                await axios.post(`${BASE_URL}/bookings/${showId}/lock`, { seats: [randomSeat1, randomSeat2] }, {
                    headers: { Cookie: userCookie }
                });
                seatsLocked = true;
                console.log(`Locked seats: ${randomSeat1}, ${randomSeat2}`);
            } catch (e: any) {
                console.log(`Failed to lock seats ${randomSeat1}, ${randomSeat2}:`, e.response?.data?.message || e.message);
                retries--;
            }
        }

        if (!seatsLocked && retries === 0) {
            console.warn("Could not lock any seats after 5 attempts. Taking a risk and proceeding to pay (might fail if user not in Stage 1).");
        }

        // 2. Initiate Payment
        const response = await axios.post(`${BASE_URL}/bookings/${showId}/pay`, {}, {
            headers: { Cookie: userCookie }
        });

        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toBeDefined();
        expect(response.data.data.orderId).toBeDefined();
        expect(response.data.data.amount).toBe(50000); // 500 INR

        orderData = response.data.data;
    });

    it('should fail confirmation with invalid signature', async () => {
        expect(userCookie).toBeDefined();
        expect(orderData).toBeDefined();

        try {
            await axios.post(`${BASE_URL}/bookings/confirm`, {
                showId: showId,
                paymentId: "fake_payment_id",
                orderId: orderData.orderId,
                signature: "invalid_signature"
            }, {
                headers: { Cookie: userCookie }
            });
            throw new Error("Should have failed");
        } catch (error: any) {
            expect(error.response?.status).toBe(400);
            expect(error.response?.data.message).toContain("Payment verification failed");
        }
    });

    it('should fail without authentication', async () => {
        try {
            await axios.post(`${BASE_URL}/bookings/${showId}/pay`);
            throw new Error("Should have failed");
        } catch (error: any) {
            expect(error.response?.status).toBe(401);
        }
    });
});
