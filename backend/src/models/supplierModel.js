const { query } = require('../config/db');

async function list() {
  return query('SELECT * FROM suppliers ORDER BY name');
}
async function findById(id) {
  const rows = await query('SELECT * FROM suppliers WHERE id = ?', [id]);
  return rows[0] || null;
}
async function create(data) {
  const r = await query(
    `INSERT INTO suppliers (name, tax_id, contact, phone, email, active)
     VALUES (?,?,?,?,?,?)`,
    [data.name, data.tax_id || null, data.contact || null, data.phone || null, data.email || null, data.active === false ? 0 : 1]
  );
  return r.insertId;
}

module.exports = { list, findById, create };