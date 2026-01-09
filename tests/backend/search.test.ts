import { describe, it, expect, beforeAll } from 'vitest';
import axios from 'axios';

const BASE_URL = 'http://localhost:4000/api/v1';

describe('Search Routes Integration Tests', () => {
    // Credentials (matching seed data)
    const userCreds = { email: 'alice@example.com', password: 'password123' };
    const adminCreds = { email: 'admin@example.com', password: 'adminpass' };

    let userCookie: string | undefined;
    let adminCookie: string | undefined;

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
        } catch (e) { console.error("User login failed", e); }

        // Login Admin
        try {
            const adminRes = await axios.post(`${BASE_URL}/auth/admin/login`, adminCreds);
            adminCookie = getCookie(adminRes);
        } catch (e) { console.error("Admin login failed", e); }
    });

    it('should allow user to search shows by movie title', async () => {
        expect(userCookie).toBeDefined();
        const response = await axios.get(`${BASE_URL}/usersearch`, {
            headers: { Cookie: userCookie },
            params: { title: 'Inception' }
        });
        
        expect(response.status).toBe(200);
        expect(Array.isArray(response.data.data)).toBe(true);
        // If seeded, we expect at least one show for Inception
        if (response.data.data.length > 0) {
            expect(response.data.data[0].movie_title).toContain('Inception');
        }
    });

    it('should allow user to search shows by theatre name', async () => {
        expect(userCookie).toBeDefined();
        const response = await axios.get(`${BASE_URL}/usersearch`, {
            headers: { Cookie: userCookie },
            params: { theatre: 'PVR' }
        });
        
        expect(response.status).toBe(200);
        if (response.data.data.length > 0) {
            expect(response.data.data[0].theatre_name).toContain('PVR');
        }
    });

    it('should allow admin to search shows (using admin route)', async () => {
        expect(adminCookie).toBeDefined();
        const response = await axios.get(`${BASE_URL}/admin/search`, {
            headers: { Cookie: adminCookie },
            params: { genre: 'Sci-Fi' }
        });
        
        expect(response.status).toBe(200);
        expect(Array.isArray(response.data.data)).toBe(true);
    });

    it('should allow unauthenticated access to search', async () => {
        const response = await axios.get(`${BASE_URL}/usersearch?title=Inception`);
        expect(response.status).toBe(200);
        expect(Array.isArray(response.data.data)).toBe(true);
    });

    it('should block user from accessing admin search route', async () => {
        expect(userCookie).toBeDefined();
        try {
            // User tries to access /admin/search
            await axios.get(`${BASE_URL}/admin/search`, {
                headers: { Cookie: userCookie }
            });
            throw new Error('Should have failed');
        } catch (error: any) {
            // Should be 401 because user ID is not in admins table
            expect(error.response?.status).toBe(401);
        }
    });
});
