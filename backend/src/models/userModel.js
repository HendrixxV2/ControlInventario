const { query } = require('../config/db');

async function findByEmail(email) {
  const rows = await query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
  return rows[0] || null;
}
async function findById(id) {
  const rows = await query(
    'SELECT id, name, email, role, active FROM users WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}
async function list() {
  return query('SELECT id, name, email, role, active FROM users ORDER BY id');
}

module.exports = { findByEmail, findById, list };