const { query } = require('../config/db');
const materialModel = require('../models/materialModel');
const stockService = require('./stockService');
const alertModel = require('../models/alertModel');

async function evaluateMaterial(materialId) {
  const material = await materialModel.findById(materialId);
  if (!material || !material.active) return;
  const stock = await stockService.globalStock(materialId);
  const pr = Number(material.reorder_point);
  if (stock <= pr) {
    const open = await query(
      `SELECT id FROM alerts WHERE material_id = ? AND status = 'open' AND type = 'reorder' LIMIT 1`,
      [materialId]
    );
    if (!open.length) {
      await query(
        `INSERT INTO alerts (material_id, type, current_stock, reorder_point, status)
         VALUES (?, 'reorder', ?, ?, 'open')`,
        [materialId, stock, pr]
      );
    }
  }
}

async function recheck() {
  const materials = await query('SELECT id FROM materials WHERE active = 1');
  for (const m of materials) await evaluateMaterial(m.id);

  const openAlerts = await query(
    `SELECT a.id, a.material_id, m.reorder_point
     FROM alerts a JOIN materials m ON m.id = a.material_id
     WHERE a.status = 'open'`
  );
  for (const a of openAlerts) {
    const stock = await stockService.globalStock(a.material_id);
    if (stock > Number(a.reorder_point)) {
      await query(
        `UPDATE alerts SET status = 'resolved', resolved_at = NOW() WHERE id = ?`,
        [a.id]
      );
    }
  }
  return alertModel.listOpen();
}

async function resolve(id, userId) {
  await query(
    `UPDATE alerts SET status = 'resolved', resolved_at = NOW(), resolved_by = ?
     WHERE id = ? AND status = 'open'`,
    [userId, id]
  );
  return alertModel.listOpen();
}

module.exports = { evaluateMaterial, recheck, resolve, listOpen: alertModel.listOpen };