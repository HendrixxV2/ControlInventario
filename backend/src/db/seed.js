const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { query, pool } = require('../config/db');
const env = require('../config/env');

async function main() {
  env.validateEnv();
  const email = (process.env.SEED_ADMIN_EMAIL || 'admin@demo.com')
    .trim()
    .toLowerCase();
  let password = process.env.SEED_ADMIN_PASSWORD;

  if (!password && env.NODE_ENV === 'production') {
    throw new Error('Define SEED_ADMIN_PASSWORD para crear el usuario administrador');
  }
  if (!password) password = crypto.randomBytes(24).toString('base64url');
  if (password.length < 12) {
    throw new Error('SEED_ADMIN_PASSWORD debe tener al menos 12 caracteres');
  }

  const users = await query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
  if (!users.length) {
    const hash = await bcrypt.hash(password, 12);
    await query(
      `INSERT INTO users (name, email, password_hash, role, active)
       VALUES (?, ?, ?, 'admin', 1)`,
      ['Administrador', email, hash]
    );
    console.log(`Usuario administrador creado: ${email}`);
    if (!process.env.SEED_ADMIN_PASSWORD) {
      console.log(`Contraseña temporal (guárdala ahora): ${password}`);
    }
  } else {
    console.log(`El usuario administrador ${email} ya existe; no se modificó`);
  }

  const rules = await query(
    'SELECT id FROM duplicate_rules WHERE active = 1 LIMIT 1'
  );
  if (!rules.length) {
    await query(
      `INSERT INTO duplicate_rules
       (quantity_diff_pct, date_window_days, excluded_statuses, active)
       VALUES (10, 7, 'cancelada', 1)`
    );
  }
}

main()
  .catch((error) => {
    console.error('No se pudieron crear los datos iniciales:', error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
