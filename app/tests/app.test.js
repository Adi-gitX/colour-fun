import request from 'supertest';
import express from 'express';

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


});
