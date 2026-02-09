import { describe, test, expect } from '@jest/globals';
import { createApiClient } from './utils.js';

describe('Search API', () => {
    const api = createApiClient();

    describe('GET /search', () => {
        test('should return search results with default pagination', async () => {
            const response = await api.get('/search');

            expect(response.status).toBe(200);
            expect(response.data.message).toBe('Search results fetched successfully');
            expect(response.data.data).toBeInstanceOf(Array);
            expect(response.data.meta).toHaveProperty('page');
            expect(response.data.meta).toHaveProperty('limit');
            expect(response.data.meta).toHaveProperty('count');
        });

        test('should filter by title', async () => {
            const response = await api.get('/search', {
                params: { title: 'Movie' },
            });

            expect(response.status).toBe(200);
            expect(response.data.meta.filters.title).toBe('Movie');
        });

        test('should filter by genre', async () => {
            const response = await api.get('/search', {
                params: { genre: 'Action' },
            });

            expect(response.status).toBe(200);
            expect(response.data.meta.filters.genre).toBe('Action');
        });

        test('should filter by theatre', async () => {
            const response = await api.get('/search', {
                params: { theatre: 'Theatre' },
            });

            expect(response.status).toBe(200);
            expect(response.data.meta.filters.theatre).toBe('Theatre');
        });

        test('should support pagination with limit and page', async () => {
            const response = await api.get('/search', {
                params: { limit: 5, page: 1 },
            });

            expect(response.status).toBe(200);
            expect(response.data.meta.limit).toBe(5);
            expect(response.data.meta.page).toBe(1);
        });

        test('should filter by date range', async () => {
            const startDate = new Date().toISOString();
            const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

            const response = await api.get('/search', {
                params: { startDate, endDate },
            });

            expect(response.status).toBe(200);
            expect(response.data.meta.filters.startDate).toBe(startDate);
            expect(response.data.meta.filters.endDate).toBe(endDate);
        });

        test('should filter by showId', async () => {
            // Use a random UUID format
            const showId = '00000000-0000-0000-0000-000000000000';

            const response = await api.get('/search', {
                params: { showId },
            });

            expect(response.status).toBe(200);
            expect(response.data.meta.filters.showId).toBe(showId);
            // No results expected for fake UUID
            expect(response.data.data).toBeInstanceOf(Array);
        });

        test('should combine multiple filters', async () => {
            const response = await api.get('/search', {
                params: {
                    title: 'Test',
                    genre: 'Drama',
                    limit: 10,
                    page: 1,
                },
            });

            expect(response.status).toBe(200);
            expect(response.data.meta.filters.title).toBe('Test');
            expect(response.data.meta.filters.genre).toBe('Drama');
        });

        test('should return empty array when no matches', async () => {
            const response = await api.get('/search', {
                params: { title: 'NonExistentMovieXYZ123456789' },
            });

            expect(response.status).toBe(200);
            expect(response.data.data).toEqual([]);
        });
    });
});
