const materialModel = require('../models/materialModel');
const ApiError = require('../utils/ApiError');

async function list(filters) {
  return materialModel.list(filters);
}
async function get(id) {
  const m = await materialModel.findById(id);
  if (!m) throw new ApiError(404, 'Material no encontrado');
  return m;
}
async function create(data) {
  if (!data.code || !data.name || !data.unit)
    throw new ApiError(400, 'code, name y unit son requeridos');
  return materialModel.create(data);
}
async function update(id, data) {
  await get(id);
  await materialModel.update(id, data);
  return get(id);
}

module.exports = { list, get, create, update };