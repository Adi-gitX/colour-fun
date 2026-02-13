const request = require('supertest');
const express = require('express');

// Mock backend app
const app = express();
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

describe('GET /api/health', () => {
    it('should return 200 and status ok', async () => {
        const res = await request(app).get('/api/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('status', 'ok');
    });

    it('should pass if node version is not 18 (demo failure)', () => {
        const version = process.version;
        // Fails on Node 18 to demonstrate matrix failure
        if (version.startsWith('v18')) {
            throw new Error('This test is designed to fail on Node 18 for demo purposes');
        }
    });
});
