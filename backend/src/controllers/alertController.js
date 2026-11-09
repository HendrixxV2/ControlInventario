const alertService = require('../services/alertService');

exports.list = async (req, res) => res.json(await alertService.listOpen());
exports.recheck = async (req, res) => res.json(await alertService.recheck());
exports.resolve = async (req, res) => {
  res.json(await alertService.resolve(req.params.id, req.user.id));
};