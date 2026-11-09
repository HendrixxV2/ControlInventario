const supplierModel = require('../models/supplierModel');

exports.list = async (req, res) => res.json(await supplierModel.list());
exports.create = async (req, res) => {
  const id = await supplierModel.create(req.body);
  res.status(201).json(await supplierModel.findById(id));
};