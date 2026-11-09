const { query } = require('../config/db');

async function getActive() {
  const rows = await query(
    'SELECT * FROM duplicate_rules WHERE active = 1 ORDER BY id DESC LIMIT 1'
  );
  return rows[0] || null;
}

async function update(id, data) {
  await query(
    `UPDATE duplicate_rules SET quantity_diff_pct = ?, date_window_days = ?,
     excluded_statuses = ?, active = ? WHERE id = ?`,
    [
      data.quantity_diff_pct,
      data.date_window_days,
      data.excluded_statuses,
      data.active === false ? 0 : 1,
      id
    ]
  );
}

module.exports = { getActive, update };