const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const env = {
  PORT: Number(process.env.PORT || 4000),
  HOST: process.env.HOST || '127.0.0.1',
  DB_HOST: process.env.DB_HOST || '127.0.0.1',
  DB_PORT: Number(process.env.DB_PORT || 3306),
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || 'inventory_db',
  JWT_SECRET: process.env.JWT_SECRET || '',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '8h',
  ALERTS_CRON_SCHEDULE: process.env.ALERTS_CRON_SCHEDULE || '*/5 * * * *',
  CORS_ORIGINS: (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  NODE_ENV: process.env.NODE_ENV || 'development'
};

function validateEnv() {
  if (!Number.isInteger(env.PORT) || env.PORT < 1 || env.PORT > 65535) {
    throw new Error('PORT debe ser un puerto válido entre 1 y 65535');
  }
  if (!Number.isInteger(env.DB_PORT) || env.DB_PORT < 1 || env.DB_PORT > 65535) {
    throw new Error('DB_PORT debe ser un puerto válido entre 1 y 65535');
  }
  if (!/^[a-zA-Z0-9_]+$/.test(env.DB_NAME)) {
    throw new Error('DB_NAME solo puede contener letras, números y guiones bajos');
  }
  if (!env.JWT_SECRET || env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET es obligatorio y debe tener al menos 32 caracteres');
  }
  if (
    env.NODE_ENV === 'production' &&
    /change|dev-only|replace|cambia/i.test(env.JWT_SECRET)
  ) {
    throw new Error('Configura un JWT_SECRET único antes de iniciar en producción');
  }
}

module.exports = { ...env, validateEnv };