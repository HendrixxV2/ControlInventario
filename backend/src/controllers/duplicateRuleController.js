const duplicateRuleModel = require('../models/duplicateRuleModel');

exports.getActive = async (req, res) => {
  res.json(await duplicateRuleModel.getActive());
};
exports.update = async (req, res) => {
  await duplicateRuleModel.update(req.params.id, req.body);
  res.json(await duplicateRuleModel.getActive());
};