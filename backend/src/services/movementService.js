const { withTransaction } = require('../config/db');
const materialModel = require('../models/materialModel');
const locationModel = require('../models/locationModel');
const stockService = require('./stockService');
const alertService = require('./alertService');
const ApiError = require('../utils/ApiError');

const TYPES = ['entrada', 'salida', 'traslado', 'ajuste'];

async function create(data, userId) {
  const {
    material_id,
    type,
    quantity,
    origin_location_id,
    destination_location_id,
    source_document,
    observations,
    movement_date
  } = data;

  if (!TYPES.includes(type)) throw new ApiError(400, 'Tipo de movimiento inválido');
  const qty = Number(quantity);
  if (Number.isNaN(qty) || qty === 0)
    throw new ApiError(400, 'Cantidad inválida');
  if (type !== 'ajuste' && qty < 0)
    throw new ApiError(400, 'La cantidad debe ser positiva para este tipo');

  const material = await materialModel.findById(material_id);
  if (!material) throw new ApiError(404, 'Material no encontrado');

  if (type === 'entrada' || type === 'ajuste') {
    if (!destination_location_id)
      throw new ApiError(400, 'Ubicación destino requerida');
  }
  if (type === 'salida') {
    if (!origin_location_id) throw new ApiError(400, 'Ubicación origen requerida');
  }
  if (type === 'traslado') {
    if (!origin_location_id || !destination_location_id)
      throw new ApiError(400, 'Origen y destino requeridos');
    if (Number(origin_location_id) === Number(destination_location_id))
      throw new ApiError(400, 'Origen y destino deben ser distintos');
  }

  if (origin_location_id && !(await locationModel.findById(origin_location_id)))
    throw new ApiError(404, 'Ubicación origen no existe');
  if (destination_location_id && !(await locationModel.findById(destination_location_id)))
    throw new ApiError(404, 'Ubicación destino no existe');

  const result = await withTransaction(async (conn) => {
    if (type === 'salida' || type === 'traslado') {
      const stock = await stockService.atLocation(
        material_id,
        origin_location_id,
        conn
      );
      if (stock < qty)
        throw new ApiError(400, `Stock insuficiente en origen (disponible: ${stock})`);
    }
    const [r] = await conn.execute(
      `INSERT INTO movements
        (material_id, type, quantity, user_id, origin_location_id,
         destination_location_id, source_document, observations, movement_date)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [
        material_id,
        type,
        qty,
        userId,
        origin_location_id || null,
        destination_location_id || null,
        source_document || null,
        observations || null,
        movement_date || new Date()
      ]
    );
    return { id: r.insertId };
  });

  await alertService.evaluateMaterial(material_id);
  return result;
}

module.exports = { create };