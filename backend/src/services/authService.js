const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const userModel = require('../models/userModel');
const ApiError = require('../utils/ApiError');

async function login(email, password) {
  if (typeof email !== 'string' || typeof password !== 'string') {
    throw new ApiError(400, 'Email y contraseña son requeridos');
  }

  const user = await userModel.findByEmail(email.trim().toLowerCase());
  const passwordMatches =
    user && (await bcrypt.compare(password, user.password_hash));

  if (!passwordMatches || Number(user.active) !== 1) {
    throw new ApiError(401, 'Email o contraseña incorrectos');
  }

  const token = jwt.sign(
    { role: user.role },
    env.JWT_SECRET,
    {
      algorithm: 'HS256',
      subject: String(user.id),
      issuer: 'control-inventario-api',
      audience: 'control-inventario-web',
      expiresIn: env.JWT_EXPIRES_IN
    }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
}

module.exports = { login };