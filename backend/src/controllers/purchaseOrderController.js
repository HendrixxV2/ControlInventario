const purchaseOrderService = require('../services/purchaseOrderService');
const duplicateService = require('../services/duplicateService');

exports.list = async (req, res) => res.json(await purchaseOrderService.list());
exports.get = async (req, res) => res.json(await purchaseOrderService.get(req.params.id));
exports.create = async (req, res) => {
  res.status(201).json(await purchaseOrderService.create(req.body, req.user.id));
};
exports.receive = async (req, res) => {
  res.json(await purchaseOrderService.receive(req.params.id, req.user.id));
};
exports.duplicates = async (req, res) => {
  res.json(await duplicateService.findDuplicates());
};