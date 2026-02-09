import axios, { type AxiosInstance, type AxiosResponse } from 'axios';

export const BASE_URL = process.env.API_URL || 'http://localhost:3000/api/v1';

// Generate unique email for each test run
export const uniqueEmail = (prefix: string) =>
    `${prefix}_${Date.now()}_${Math.random().toString(36).substring(7)}@test.com`;

// Strong password that meets policy requirements
export const STRONG_PASSWORD = 'TestPass123!';

// Test user credentials (pre-seeded in database)
export const TEST_USER = {
    email: 'testuser@test.com',
    password: 'Test@123',
};

// Test admin credentials (pre-seeded in database)
export const TEST_ADMIN = {
    email: 'admin@test.com',
    password: 'Admin@123',
};

/**
 * Create axios instance with cookie support
 */
export const createApiClient = (): AxiosInstance => {
    return axios.create({
        baseURL: BASE_URL,
        withCredentials: true,
        validateStatus: () => true, // Don't throw on non-2xx
    });
};

/**
 * Extract cookie from response headers
 */
export const extractCookie = (response: AxiosResponse): string | undefined => {
    const setCookie = response.headers['set-cookie'];
    if (setCookie && setCookie.length > 0) {
        return setCookie[0].split(';')[0];
    }
    return undefined;
};

/**
 * Create authenticated axios client for a user
 */
export const createAuthenticatedClient = async (
    email: string,
    password: string
): Promise<{ client: AxiosInstance; cookie: string }> => {
    const client = createApiClient();

    const response = await client.post('/auth/login', { email, password });
    const cookie = extractCookie(response);

    if (!cookie) {
        throw new Error(`Failed to authenticate: ${JSON.stringify(response.data)}`);
    }

    // Create new client with cookie header
    const authenticatedClient = axios.create({
        baseURL: BASE_URL,
        withCredentials: true,
        headers: { Cookie: cookie },
        validateStatus: () => true,
    });

    return { client: authenticatedClient, cookie };
};

/**
 * Create authenticated axios client for admin
 */
export const createAdminClient = async (): Promise<{ client: AxiosInstance; cookie: string }> => {
    const client = createApiClient();

    const response = await client.post('/auth/admin/login', {
        email: TEST_ADMIN.email,
        password: TEST_ADMIN.password,
    });
    const cookie = extractCookie(response);

    if (!cookie) {
        throw new Error(`Failed to authenticate admin: ${JSON.stringify(response.data)}`);
    }

    const authenticatedClient = axios.create({
        baseURL: BASE_URL,
        withCredentials: true,
        headers: { Cookie: cookie },
        validateStatus: () => true,
    });

    return { client: authenticatedClient, cookie };
};

/**
 * Register a new test user and return authenticated client
 */
export const registerTestUser = async (
    name: string = 'Test User',
    email?: string,
    password: string = STRONG_PASSWORD
): Promise<{ client: AxiosInstance; cookie: string; email: string }> => {
    const userEmail = email || uniqueEmail('user');
    const client = createApiClient();

    // Register
    const signupResponse = await client.post('/auth/signup', {
        name,
        email: userEmail,
        password,
    });

    if (signupResponse.status !== 201) {
        throw new Error(`Registration failed: ${JSON.stringify(signupResponse.data)}`);
    }

    // Login to get cookie
    const loginResponse = await client.post('/auth/login', {
        email: userEmail,
        password,
    });

    const cookie = extractCookie(loginResponse);
    if (!cookie) {
        throw new Error(`Login after registration failed: ${JSON.stringify(loginResponse.data)}`);
    }

    const authenticatedClient = axios.create({
        baseURL: BASE_URL,
        withCredentials: true,
        headers: { Cookie: cookie },
        validateStatus: () => true,
    });

    return { client: authenticatedClient, cookie, email: userEmail };
};
