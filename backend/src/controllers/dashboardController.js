const dashboardService = require('../services/dashboardService');

exports.summary = async (req, res) => {
  res.json(await dashboardService.summary());
};