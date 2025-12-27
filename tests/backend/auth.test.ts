import { describe, it, expect } from 'vitest';
import axios from 'axios';

const BASE_URL = 'http://localhost:4000/api/v1';

describe('Auth Routes Integration Tests', () => {
    // Generate random credentials for this test run
    const randomId = Math.floor(Math.random() * 100000);
    const testUser = {
        name: `Test User ${randomId}`,
        email: `testuser${randomId}@example.com`,
        password: 'password123'
    };

    let authTokenCookie: string | undefined;

    it('should signup a new user', async () => {
        try {
            const response = await axios.post(`${BASE_URL}/auth/signup`, testUser);
            expect(response.status).toBe(201);
            expect(response.data.message).toBe('User created successfully');
            expect(response.data.user).toHaveProperty('email', testUser.email);
        } catch (error: any) {
            console.error('Signup Error:', error.response?.data || error.message);
            throw error;
        }
    });

    it('should login the user and receive an httpOnly cookie', async () => {
        try {
            const response = await axios.post(`${BASE_URL}/auth/login`, {
                email: testUser.email,
                password: testUser.password
            });

            expect(response.status).toBe(200);
            expect(response.data.message).toBe('Login successful');

            // --- MANUAL COOKIE EXTRACTION (Method 1) ---
            const setCookieHeaders = response.headers['set-cookie'];
            expect(setCookieHeaders).toBeDefined();
            expect(Array.isArray(setCookieHeaders)).toBe(true);

            // Find the 'jwt' cookie
            const jwtCookie = setCookieHeaders?.find(cookie => cookie.startsWith('jwt='));
            expect(jwtCookie).toBeDefined();

            if (jwtCookie) {
                // Check cookie attributes
                expect(jwtCookie).toContain('HttpOnly'); // Note: Case sensitivity depends on server, usually HttpOnly
                // expect(jwtCookie).toContain('SameSite=Strict'); // or whatever was set

                // Extract the cookie value for the next test
                // Format: "jwt=value; Path=/; HttpOnly; ..."
                // We typically need to send back "jwt=value"
                authTokenCookie = jwtCookie.split(';')[0];
            }

        } catch (error: any) {
            console.error('Login Error:', error.response?.data || error.message);
            throw error;
        }
    });
});
