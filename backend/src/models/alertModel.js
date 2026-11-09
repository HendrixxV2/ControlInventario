const { query } = require('../config/db');

async function listOpen() {
  return query(`
    SELECT a.*, m.name AS material_name, m.code AS material_code
    FROM alerts a
    JOIN materials m ON m.id = a.material_id
    WHERE a.status = 'open'
    ORDER BY a.created_at DESC`);
}

module.exports = { listOpen };