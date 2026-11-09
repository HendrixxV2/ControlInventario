const { query } = require('../config/db');

async function list(f = {}) {
  const where = [];
  const params = [];
  if (f.materialId) {
    where.push('m.material_id = ?');
    params.push(f.materialId);
  }
  if (f.locationId) {
    where.push('(m.origin_location_id = ? OR m.destination_location_id = ?)');
    params.push(f.locationId, f.locationId);
  }
  if (f.type) {
    where.push('m.type = ?');
    params.push(f.type);
  }
  if (f.from) {
    where.push('m.movement_date >= ?');
    params.push(f.from);
  }
  if (f.to) {
    where.push('m.movement_date <= ?');
    params.push(f.to);
  }
  const sql = `
    SELECT m.*, mat.name AS material_name, mat.code AS material_code,
           u.name AS user_name,
           lo.name AS origin_name, ld.name AS destination_name
    FROM movements m
    JOIN materials mat ON mat.id = m.material_id
    JOIN users u ON u.id = m.user_id
    LEFT JOIN locations lo ON lo.id = m.origin_location_id
    LEFT JOIN locations ld ON ld.id = m.destination_location_id
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    ORDER BY m.movement_date DESC, m.id DESC
    LIMIT 500`;
  return query(sql, params);
}

module.exports = { list };