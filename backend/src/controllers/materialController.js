const materialService = require('../services/materialService');
const stockService = require('../services/stockService');
const traceabilityService = require('../services/traceabilityService');

exports.list = async (req, res) => res.json(await materialService.list(req.query));
exports.get = async (req, res) => res.json(await materialService.get(req.params.id));
exports.create = async (req, res) => {
  const id = await materialService.create(req.body);
  res.status(201).json(await materialService.get(id));
};
exports.update = async (req, res) => {
  res.json(await materialService.update(req.params.id, req.body));
};
exports.stock = async (req, res) => {
  const id = req.params.id;
  res.json({
    materialId: Number(id),
    global: await stockService.globalStock(id),
    byLocation: await stockService.byLocation(id)
  });
};
exports.traceability = async (req, res) => {
  res.json(await traceabilityService.traceability(req.params.id));
};