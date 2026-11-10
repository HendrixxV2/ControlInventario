process.env.JWT_SECRET = 'test-secret-with-more-than-thirty-two-characters';

const request = require('supertest');
const app = require('./app');

describe('Express API', () => {
  test('serves health checks and security headers', async () => {
    const response = await request(app).get('/api/health').expect(200);
    expect(response.body).toEqual({ ok: true });
    expect(response.headers['x-powered-by']).toBeUndefined();
    expect(response.headers['x-content-type-options']).toBe('nosniff');
  });

  test('returns JSON for unknown API routes', async () => {
    const response = await request(app).get('/api/missing').expect(404);
    expect(response.body.error).toBe('Ruta no encontrada');
  });
});
