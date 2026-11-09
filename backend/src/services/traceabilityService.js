const materialModel = require('../models/materialModel');
const movementModel = require('../models/movementModel');
const stockService = require('./stockService');
const ApiError = require('../utils/ApiError');

async function traceability(materialId) {
  const material = await materialModel.findById(materialId);
  if (!material) throw new ApiError(404, 'Material no encontrado');
  const movements = await movementModel.list({ materialId });
  const globalStock = await stockService.globalStock(materialId);
  const byLocation = await stockService.byLocation(materialId);
  return { material, globalStock, byLocation, movements };
}

module.exports = { traceability };