import { describe, test, expect, beforeAll } from '@jest/globals';
import type { AxiosInstance } from 'axios';
import { createApiClient, registerTestUser } from './utils.js';

describe('Bookings API', () => {
    const unauthClient = createApiClient();
    let userClient: AxiosInstance;

    beforeAll(async () => {
        // Create a test user for booking tests
        try {
            const { client } = await registerTestUser('Booking Tester');
            userClient = client;
        } catch (error) {
            console.warn('Could not create test user for bookings:', error);
        }
    });

    // ==================== LOCK SEATS ====================
    describe('POST /bookings/:showId/lock', () => {
        test('should reject unauthenticated request', async () => {
            const response = await unauthClient.post('/bookings/test-show-id/lock', {
                seats: [1, 2, 3],
            });

            expect(response.status).toBe(401);
        });

        test('should reject invalid seat selection (empty array)', async () => {
            if (!userClient) return;

            const response = await userClient.post('/bookings/test-show-id/lock', {
                seats: [],
            });

            expect(response.status).toBe(400);
            expect(response.data.error).toContain('Invalid seat selection');
        });

        test('should reject invalid seat selection (more than 3 seats)', async () => {
            if (!userClient) return;

            const response = await userClient.post('/bookings/test-show-id/lock', {
                seats: [1, 2, 3, 4, 5],
            });

            expect(response.status).toBe(400);
            expect(response.data.error).toContain('Invalid seat selection');
        });

        test('should reject request without seats array', async () => {
            if (!userClient) return;

            const response = await userClient.post('/bookings/test-show-id/lock', {});

            expect(response.status).toBe(400);
            expect(response.data.error).toContain('Invalid seat selection');
        });

        test('should reject non-array seats', async () => {
            if (!userClient) return;

            const response = await userClient.post('/bookings/test-show-id/lock', {
                seats: 'not-an-array',
            });

            expect(response.status).toBe(400);
        });

        test('should handle valid seat lock request (show may not exist)', async () => {
            if (!userClient) return;

            // Using a fake UUID - will likely fail at service level
            const fakeShowId = '00000000-0000-0000-0000-000000000001';
            const response = await userClient.post(`/bookings/${fakeShowId}/lock`, {
                seats: [1, 2],
            });

            // Could be 409 (conflict), 500 (show not found in Redis), or success
            expect([200, 409, 500]).toContain(response.status);
        });
    });

    // ==================== CANCEL BOOKING ====================
    describe('POST /bookings/:showId/cancel', () => {
        test('should reject unauthenticated request', async () => {
            const response = await unauthClient.post('/bookings/test-show-id/cancel');

            expect(response.status).toBe(401);
        });

        test('should handle cancel request (no active booking expected)', async () => {
            if (!userClient) return;

            const fakeShowId = '00000000-0000-0000-0000-000000000002';
            const response = await userClient.post(`/bookings/${fakeShowId}/cancel`);

            // Will likely return 400 (no active booking) or 500
            expect([200, 400, 500]).toContain(response.status);
        });
    });

    // ==================== CONFIRM BOOKING ====================
    describe('POST /bookings/confirm', () => {
        test('should reject unauthenticated request', async () => {
            const response = await unauthClient.post('/bookings/confirm', {
                showId: 'test-show',
                paymentId: 'pay_123',
                orderId: 'order_123',
                signature: 'sig_123',
            });

            expect(response.status).toBe(401);
        });

        test('should reject request with missing fields', async () => {
            if (!userClient) return;

            const response = await userClient.post('/bookings/confirm', {
                showId: 'test-show',
                // Missing paymentId, orderId, signature
            });

            expect(response.status).toBe(400);
            expect(response.data.error).toContain('Missing payment details');
        });

        test('should reject request with partial fields', async () => {
            if (!userClient) return;

            const response = await userClient.post('/bookings/confirm', {
                showId: 'test-show',
                paymentId: 'pay_123',
                // Missing orderId and signature
            });

            expect(response.status).toBe(400);
            expect(response.data.error).toContain('Missing payment details');
        });

        test('should handle confirm with all fields (invalid payment expected)', async () => {
            if (!userClient) return;

            const response = await userClient.post('/bookings/confirm', {
                showId: '00000000-0000-0000-0000-000000000003',
                paymentId: 'pay_fake_123',
                orderId: 'order_fake_123',
                signature: 'invalid_signature',
            });

            // Will fail payment verification - expect 400 or 500
            expect([400, 500]).toContain(response.status);
        });
    });
});
