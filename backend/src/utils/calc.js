function safetyStock(m) {
  return (
    (Number(m.max_daily_demand) - Number(m.avg_daily_demand)) *
    Number(m.lead_time_days)
  );
}

function reorderPoint(m) {
  return (
    Number(m.avg_daily_demand) * Number(m.lead_time_days) + safetyStock(m)
  );
}

module.exports = { safetyStock, reorderPoint };