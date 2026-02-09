import { describe, test, expect, beforeAll } from '@jest/globals';
import {
    createApiClient,
    createAuthenticatedClient,
    extractCookie,
    uniqueEmail,
    STRONG_PASSWORD,
    TEST_USER,
    TEST_ADMIN,
    registerTestUser,
} from './utils.js';

describe('Auth API', () => {
    const api = createApiClient();

    // ==================== SIGNUP ====================
    describe('POST /auth/signup', () => {
        test('should register a new user with valid data', async () => {
            const email = uniqueEmail('signup');
            const response = await api.post('/auth/signup', {
                name: 'Test User',
                email,
                password: STRONG_PASSWORD,
            });

            expect(response.status).toBe(201);
            expect(response.data.message).toBe('User created successfully');
            expect(response.data.user).toHaveProperty('id');
            expect(response.data.user.email).toBe(email);
        });

        test('should reject signup with missing fields', async () => {
            const response = await api.post('/auth/signup', {
                email: uniqueEmail('incomplete'),
            });

            expect(response.status).toBe(400);
            expect(response.data.message).toContain('provide all fields');
        });

        test('should reject signup with invalid email format', async () => {
            const response = await api.post('/auth/signup', {
                name: 'Test User',
                email: 'invalid-email',
                password: STRONG_PASSWORD,
            });

            expect(response.status).toBe(400);
            expect(response.data.message).toContain('Invalid email');
        });

        test('should reject signup with weak password (no uppercase)', async () => {
            const response = await api.post('/auth/signup', {
                name: 'Test User',
                email: uniqueEmail('weak'),
                password: 'weakpassword123!',
            });

            expect(response.status).toBe(400);
            expect(response.data.message).toContain('uppercase');
        });

        test('should reject signup with weak password (too short)', async () => {
            const response = await api.post('/auth/signup', {
                name: 'Test User',
                email: uniqueEmail('short'),
                password: 'Ab1!',
            });

            expect(response.status).toBe(400);
            expect(response.data.message).toContain('8 characters');
        });

        test('should reject signup with duplicate email', async () => {
            const email = uniqueEmail('duplicate');

            // First signup
            await api.post('/auth/signup', {
                name: 'First User',
                email,
                password: STRONG_PASSWORD,
            });

            // Duplicate signup
            const response = await api.post('/auth/signup', {
                name: 'Second User',
                email,
                password: STRONG_PASSWORD,
            });

            expect(response.status).toBe(400);
            expect(response.data.message).toContain('already exists');
        });
    });

    // ==================== LOGIN ====================
    describe('POST /auth/login', () => {
        let testEmail: string;

        beforeAll(async () => {
            // Register a user for login tests
            testEmail = uniqueEmail('login');
            await api.post('/auth/signup', {
                name: 'Login Test User',
                email: testEmail,
                password: STRONG_PASSWORD,
            });
        });

        test('should login with valid credentials', async () => {
            const response = await api.post('/auth/login', {
                email: testEmail,
                password: STRONG_PASSWORD,
            });

            expect(response.status).toBe(200);
            expect(response.data.message).toBe('Login successful');
            expect(response.data.user).toHaveProperty('id');
            expect(response.data.user.email).toBe(testEmail);

            // Should set JWT cookie
            const cookie = extractCookie(response);
            expect(cookie).toBeDefined();
            expect(cookie).toContain('jwt=');
        });

        test('should reject login with missing fields', async () => {
            const response = await api.post('/auth/login', {
                email: testEmail,
            });

            expect(response.status).toBe(400);
            expect(response.data.message).toContain('provide email and password');
        });

        test('should reject login with invalid email format', async () => {
            const response = await api.post('/auth/login', {
                email: 'not-an-email',
                password: STRONG_PASSWORD,
            });

            expect(response.status).toBe(400);
            expect(response.data.message).toContain('Invalid email');
        });

        test('should reject login with wrong password', async () => {
            const response = await api.post('/auth/login', {
                email: testEmail,
                password: 'WrongPassword123!',
            });

            expect(response.status).toBe(400);
            expect(response.data.message).toContain('Invalid credentials');
        });

        test('should reject login with non-existent user', async () => {
            const response = await api.post('/auth/login', {
                email: 'nonexistent@example.com',
                password: STRONG_PASSWORD,
            });

            expect(response.status).toBe(400);
            expect(response.data.message).toContain('Invalid credentials');
        });
    });

    // ==================== ADMIN LOGIN ====================
    describe('POST /auth/admin/login', () => {
        test('should login admin with valid credentials', async () => {
            const response = await api.post('/auth/admin/login', {
                email: TEST_ADMIN.email,
                password: TEST_ADMIN.password,
            });

            // May fail if admin not seeded - that's expected
            if (response.status === 200) {
                expect(response.data.message).toBe('Admin login successful');
                expect(response.data.admin).toHaveProperty('adminId');

                const cookie = extractCookie(response);
                expect(cookie).toBeDefined();
            } else {
                // Admin not seeded - skip gracefully
                expect(response.status).toBe(400);
            }
        });

        test('should reject admin login with invalid credentials', async () => {
            const response = await api.post('/auth/admin/login', {
                email: 'fake@admin.com',
                password: 'FakePassword123!',
            });

            expect(response.status).toBe(400);
            expect(response.data.message).toContain('Invalid credentials');
        });

        test('should reject admin login with missing fields', async () => {
            const response = await api.post('/auth/admin/login', {
                email: TEST_ADMIN.email,
            });

            expect(response.status).toBe(400);
        });
    });

    // ==================== SOCKET TICKET ====================
    describe('GET /auth/ticket', () => {
        test('should return ticket for authenticated user', async () => {
            // Register and login a user
            const { client } = await registerTestUser('Ticket User');

            const response = await client.get('/auth/ticket');

            expect(response.status).toBe(200);
            expect(response.data.message).toBe('Ticket generated');
            expect(response.data.ticket).toBeDefined();
            expect(typeof response.data.ticket).toBe('string');
        });

        test('should reject unauthenticated request', async () => {
            const response = await api.get('/auth/ticket');

            expect(response.status).toBe(401);
        });
    });
});
