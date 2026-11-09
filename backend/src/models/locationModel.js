const { query } = require('../config/db');

async function list() {
  return query('SELECT * FROM locations ORDER BY name');
}
async function findById(id) {
  const rows = await query('SELECT * FROM locations WHERE id = ?', [id]);
  return rows[0] || null;
}
async function create(data) {
  const r = await query(
    `INSERT INTO locations (name, type, code, active) VALUES (?,?,?,?)`,
    [data.name, data.type, data.code, data.active === false ? 0 : 1]
  );
  return r.insertId;
}

module.exports = { list, findById, create };