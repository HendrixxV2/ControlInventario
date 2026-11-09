const { query } = require('../config/db');
const duplicateRuleModel = require('../models/duplicateRuleModel');

async function findDuplicates() {
  const rule = (await duplicateRuleModel.getActive()) || {
    quantity_diff_pct: 10,
    date_window_days: 7,
    excluded_statuses: 'cancelada'
  };

  const excluded = String(rule.excluded_statuses || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const params = [];
  let statusCond = '';
  if (excluded.length) {
    const ph = excluded.map(() => '?').join(',');
    statusCond = `AND po_a.status NOT IN (${ph}) AND po_b.status NOT IN (${ph})`;
    params.push(...excluded, ...excluded);
  }

  const sql = `
    SELECT a.id AS item_a, b.id AS item_b,
           a.material_id, m.name AS material_name, m.code AS material_code,
           po_a.supplier_id, s.name AS supplier_name,
           po_a.id AS order_a_id, po_a.order_number AS order_a,
           po_a.created_at AS date_a, a.quantity AS qty_a,
           po_b.id AS order_b_id, po_b.order_number AS order_b,
           po_b.created_at AS date_b, b.quantity AS qty_b,
           ABS(a.quantity - b.quantity) / GREATEST(a.quantity, b.quantity) * 100 AS diff_pct,
           ABS(DATEDIFF(po_b.created_at, po_a.created_at)) AS days_diff
    FROM purchase_order_items a
    JOIN purchase_orders po_a ON po_a.id = a.purchase_order_id
    JOIN purchase_order_items b
      ON b.material_id = a.material_id AND b.id > a.id
    JOIN purchase_orders po_b
      ON po_b.id = b.purchase_order_id AND po_b.supplier_id = po_a.supplier_id
    JOIN materials m ON m.id = a.material_id
    JOIN suppliers s ON s.id = po_a.supplier_id
    WHERE 1=1
      ${statusCond}
      AND ABS(DATEDIFF(po_b.created_at, po_a.created_at)) <= ?
      AND ABS(a.quantity - b.quantity) / GREATEST(a.quantity, b.quantity) * 100 <= ?
    ORDER BY days_diff, diff_pct
    LIMIT 200`;

  params.push(rule.date_window_days, rule.quantity_diff_pct);
  const duplicates = await query(sql, params);
  return { rule, duplicates };
}

module.exports = { findDuplicates };