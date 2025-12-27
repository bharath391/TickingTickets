import { describe, it, expect, beforeAll } from 'vitest';
import axios from 'axios';

const BASE_URL = 'http://localhost:4000/api/v1';

describe('Admin Routes Integration Tests', () => {
    // Admin credentials (from seed or created manually)
    const adminUser = {
        email: 'admin@example.com',
        password: 'adminpass'
    };

    let adminTokenCookie: string | undefined;
    let theatreId: string | undefined;

    it('should login as admin and receive an httpOnly cookie', async () => {
        try {
            const response = await axios.post(`${BASE_URL}/auth/admin/login`, adminUser);

            expect(response.status).toBe(200);
            expect(response.data.message).toBe('Admin login successful');

            const setCookieHeaders = response.headers['set-cookie'];
            expect(setCookieHeaders).toBeDefined();

            const jwtCookie = setCookieHeaders?.find(cookie => cookie.startsWith('jwt='));
            expect(jwtCookie).toBeDefined();

            if (jwtCookie) {
                adminTokenCookie = jwtCookie.split(';')[0];
            }
        } catch (error: any) {
            console.error('Admin Login Error:', error.response?.data || error.message);
            // If login fails (e.g., seed data missing), we can't proceed with other tests
            throw error;
        }
    });

    it('should create a new theatre', async () => {
        expect(adminTokenCookie).toBeDefined();

        try {
            const theatreData = {
                name: `Test Theatre ${Date.now()}`,
                location: 'Test Location'
            };

            const response = await axios.post(`${BASE_URL}/admin/theatres`, theatreData, {
                headers: { Cookie: adminTokenCookie }
            });

            expect(response.status).toBe(201);
            expect(response.data.message).toBe('Theatre created successfully');
            expect(response.data.data).toHaveProperty('id');
            expect(response.data.data.name).toBe(theatreData.name);

            theatreId = response.data.data.id;
        } catch (error: any) {
            console.error('Create Theatre Error:', error.response?.data || error.message);
            throw error;
        }
    });

    it('should update the theatre', async () => {
        expect(adminTokenCookie).toBeDefined();
        expect(theatreId).toBeDefined();

        try {
            const updateData = {
                name: `Updated Theatre ${Date.now()}`,
                location: 'Updated Location'
            };

            const response = await axios.put(`${BASE_URL}/admin/theatres/${theatreId}`, updateData, {
                headers: { Cookie: adminTokenCookie }
            });

            expect(response.status).toBe(200);
            expect(response.data.message).toBe('Theatre updated successfully');
            expect(response.data.data.name).toBe(updateData.name);
            expect(response.data.data.location).toBe(updateData.location);
        } catch (error: any) {
            console.error('Update Theatre Error:', error.response?.data || error.message);
            throw error;
        }
    });

    it('should delete the theatre', async () => {
        expect(adminTokenCookie).toBeDefined();
        expect(theatreId).toBeDefined();

        try {
            const response = await axios.delete(`${BASE_URL}/admin/theatres/${theatreId}`, {
                headers: { Cookie: adminTokenCookie }
            });

            expect(response.status).toBe(200);
            expect(response.data.message).toBe('Theatre deleted successfully');
        } catch (error: any) {
            console.error('Delete Theatre Error:', error.response?.data || error.message);
            throw error;
        }
    });
    
    // Test access control (optional but good)
    it('should fail to create theatre without admin cookie', async () => {
         try {
            await axios.post(`${BASE_URL}/admin/theatres`, { name: 'Fail', location: 'Fail' });
            // Should fail
            throw new Error('Should have failed with 401');
        } catch (error: any) {
            expect(error.response?.status).toBe(401);
        }
    });
});
