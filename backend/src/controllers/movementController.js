const movementModel = require('../models/movementModel');
const movementService = require('../services/movementService');

exports.list = async (req, res) => {
  const f = {
    materialId: req.query.materialId,
    locationId: req.query.locationId,
    type: req.query.type,
    from: req.query.from,
    to: req.query.to
  };
  res.json(await movementModel.list(f));
};

exports.create = async (req, res) => {
  const result = await movementService.create(req.body, req.user.id);
  res.status(201).json(result);
};