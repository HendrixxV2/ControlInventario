const { query } = require('../config/db');

async function summary() {
  const totalMaterials = (await query(
    'SELECT COUNT(*) AS n FROM materials WHERE active = 1'
  ))[0].n;
  const totalLocations = (await query(
    'SELECT COUNT(*) AS n FROM locations WHERE active = 1'
  ))[0].n;
  const openAlerts = (await query(
    `SELECT COUNT(*) AS n FROM alerts WHERE status = 'open'`
  ))[0].n;
  const totalPurchaseOrders = (await query(
    'SELECT COUNT(*) AS n FROM purchase_orders'
  ))[0].n;
  const movementsToday = (await query(
    'SELECT COUNT(*) AS n FROM movements WHERE DATE(movement_date) = CURDATE()'
  ))[0].n;

  const lowStockMaterials = await query(`
    SELECT m.id, m.code, m.name, m.unit, m.reorder_point,
           COALESCE(SUM(e.qty),0) AS stock
    FROM materials m
    LEFT JOIN movement_effects e ON e.material_id = m.id
    WHERE m.active = 1
    GROUP BY m.id, m.code, m.name, m.unit, m.reorder_point
    HAVING stock <= m.reorder_point
    ORDER BY stock ASC
    LIMIT 20`);

  const recentMovements = await query(`
    SELECT m.id, m.type, m.quantity, m.movement_date,
           mat.name AS material_name, u.name AS user_name,
           lo.name AS origin_name, ld.name AS destination_name
    FROM movements m
    JOIN materials mat ON mat.id = m.material_id
    JOIN users u ON u.id = m.user_id
    LEFT JOIN locations lo ON lo.id = m.origin_location_id
    LEFT JOIN locations ld ON ld.id = m.destination_location_id
    ORDER BY m.movement_date DESC, m.id DESC
    LIMIT 10`);

  return {
    kpis: {
      totalMaterials,
      totalLocations,
      openAlerts,
      lowStock: lowStockMaterials.length,
      totalPurchaseOrders,
      movementsToday
    },
    lowStockMaterials,
    recentMovements
  };
}

module.exports = { summary };