const { query } = require('../config/db');

async function globalStock(materialId) {
  const rows = await query(
    'SELECT COALESCE(SUM(qty),0) AS quantity FROM movement_effects WHERE material_id = ?',
    [materialId]
  );
  return Number(rows[0].quantity);
}

async function byLocation(materialId) {
  return query(
    `SELECT l.id AS location_id, l.name, l.type, l.code,
            COALESCE(SUM(e.qty),0) AS quantity
     FROM locations l
     LEFT JOIN movement_effects e
       ON e.location_id = l.id AND e.material_id = ?
     GROUP BY l.id, l.name, l.type, l.code
     ORDER BY l.name`,
    [materialId]
  );
}

async function atLocation(materialId, locationId, executor = null) {
  const sql =
    'SELECT COALESCE(SUM(qty),0) AS qty FROM movement_effects WHERE material_id = ? AND location_id = ?';
  if (executor) {
    const [rows] = await executor.execute(sql, [materialId, locationId]);
    return Number(rows[0].qty);
  }
  const rows = await query(sql, [materialId, locationId]);
  return Number(rows[0].qty);
}

async function locationStock(locationId) {
  return query(
    `SELECT m.id AS material_id, m.code, m.name, m.unit,
            COALESCE(SUM(e.qty),0) AS quantity
     FROM materials m
     LEFT JOIN movement_effects e
       ON e.material_id = m.id AND e.location_id = ?
     WHERE m.active = 1
     GROUP BY m.id, m.code, m.name, m.unit
     ORDER BY m.name`,
    [locationId]
  );
}

module.exports = { globalStock, byLocation, atLocation, locationStock };