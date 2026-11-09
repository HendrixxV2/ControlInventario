const { query } = require('../config/db');

async function list(filters = {}) {
  const where = [];
  const params = [];
  if (filters.active !== undefined) {
    where.push('active = ?');
    params.push(filters.active === 'false' ? 0 : 1);
  }
  if (filters.q) {
    where.push('(name LIKE ? OR code LIKE ?)');
    params.push(`%${filters.q}%`, `%${filters.q}%`);
  }
  if (filters.category) {
    where.push('category = ?');
    params.push(filters.category);
  }
  const sql = `SELECT * FROM materials ${
    where.length ? 'WHERE ' + where.join(' AND ') : ''
  } ORDER BY name`;
  return query(sql, params);
}

async function findById(id) {
  const rows = await query('SELECT * FROM materials WHERE id = ?', [id]);
  return rows[0] || null;
}

async function create(data) {
  const r = await query(
    `INSERT INTO materials
      (code, name, description, unit, min_stock, max_stock,
       avg_daily_demand, max_daily_demand, lead_time_days,
       category, subcategory, active)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      data.code,
      data.name,
      data.description || null,
      data.unit,
      data.min_stock || 0,
      data.max_stock || 0,
      data.avg_daily_demand || 0,
      data.max_daily_demand || 0,
      data.lead_time_days || 0,
      data.category || null,
      data.subcategory || null,
      data.active === false ? 0 : 1
    ]
  );
  return r.insertId;
}

async function update(id, data) {
  await query(
    `UPDATE materials SET
      code = ?, name = ?, description = ?, unit = ?, min_stock = ?, max_stock = ?,
      avg_daily_demand = ?, max_daily_demand = ?, lead_time_days = ?,
      category = ?, subcategory = ?, active = ?
     WHERE id = ?`,
    [
      data.code,
      data.name,
      data.description || null,
      data.unit,
      data.min_stock || 0,
      data.max_stock || 0,
      data.avg_daily_demand || 0,
      data.max_daily_demand || 0,
      data.lead_time_days || 0,
      data.category || null,
      data.subcategory || null,
      data.active === false ? 0 : 1,
      id
    ]
  );
}

module.exports = { list, findById, create, update };