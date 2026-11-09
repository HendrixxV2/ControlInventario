const locationModel = require('../models/locationModel');
const stockService = require('../services/stockService');

exports.list = async (req, res) => res.json(await locationModel.list());
exports.create = async (req, res) => {
  const id = await locationModel.create(req.body);
  res.status(201).json(await locationModel.findById(id));
};
exports.stock = async (req, res) => {
  res.json(await stockService.locationStock(req.params.id));
};