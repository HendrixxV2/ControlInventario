process.env.JWT_SECRET = 'test-secret-with-more-than-thirty-two-characters';

jest.mock('../models/userModel', () => ({
  findByEmail: jest.fn()
}));

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const userModel = require('../models/userModel');
const authService = require('./authService');

describe('authService.login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns a signed token and excludes the password hash', async () => {
    const passwordHash = await bcrypt.hash('correct-password', 4);
    userModel.findByEmail.mockResolvedValue({
      id: 7,
      name: 'Test Admin',
      email: 'admin@example.test',
      password_hash: passwordHash,
      role: 'admin',
      active: 1
    });

    const result = await authService.login(' ADMIN@EXAMPLE.TEST ', 'correct-password');
    const payload = jwt.verify(result.token, env.JWT_SECRET, {
      issuer: 'control-inventario-api',
      audience: 'control-inventario-web'
    });

    expect(userModel.findByEmail).toHaveBeenCalledWith('admin@example.test');
    expect(payload.sub).toBe('7');
    expect(payload.role).toBe('admin');
    expect(result.user).not.toHaveProperty('password_hash');
  });

  test('rejects invalid credentials and inactive users', async () => {
    userModel.findByEmail.mockResolvedValue(null);
    await expect(authService.login('missing@example.test', 'wrong')).rejects.toMatchObject({
      status: 401
    });

    userModel.findByEmail.mockResolvedValue({
      id: 7,
      password_hash: await bcrypt.hash('correct-password', 4),
      active: 0
    });
    await expect(authService.login('admin@example.test', 'correct-password')).rejects.toMatchObject({
      status: 401
    });
  });
});
