const { query } = require('../config/db');

async function list() {
  return query(`
    SELECT po.*, s.name AS supplier_name, l.name AS destination_name, u.name AS user_name
    FROM purchase_orders po
    JOIN suppliers s ON s.id = po.supplier_id
    JOIN locations l ON l.id = po.destination_location_id
    JOIN users u ON u.id = po.user_id
    ORDER BY po.created_at DESC`);
}

async function findById(id) {
  const rows = await query('SELECT * FROM purchase_orders WHERE id = ?', [id]);
  if (!rows[0]) return null;
  const po = rows[0];
  po.items = await query(
    `SELECT poi.*, m.name AS material_name, m.code AS material_code
     FROM purchase_order_items poi
     JOIN materials m ON m.id = poi.material_id
     WHERE poi.purchase_order_id = ?`,
    [id]
  );
  return po;
}

module.exports = { list, findById };