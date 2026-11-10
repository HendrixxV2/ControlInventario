process.env.JWT_SECRET = 'test-secret-with-more-than-thirty-two-characters';

const express = require('express');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const env = require('../config/env');
const auth = require('./auth');

const app = express();
app.get('/private', auth(['admin']), (req, res) => {
  res.json({ id: req.user.id, role: req.user.role });
});

function createToken(role = 'admin') {
  return jwt.sign({ role }, env.JWT_SECRET, {
    subject: '7',
    issuer: 'control-inventario-api',
    audience: 'control-inventario-web',
    expiresIn: '1h'
  });
}

describe('JWT authorization middleware', () => {
  test('requires a valid token and enforces roles', async () => {
    await request(app).get('/private').expect(401);
    await request(app)
      .get('/private')
      .set('Authorization', `Bearer ${createToken('almacen')}`)
      .expect(403);
    await request(app)
      .get('/private')
      .set('Authorization', `Bearer ${createToken()}`)
      .expect(200, { id: 7, role: 'admin' });
  });
});
