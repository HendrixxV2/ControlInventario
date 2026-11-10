const { withTransaction } = require('../config/db');
const purchaseOrderModel = require('../models/purchaseOrderModel');
const materialModel = require('../models/materialModel');
const supplierModel = require('../models/supplierModel');
const locationModel = require('../models/locationModel');
const alertService = require('./alertService');
const ApiError = require('../utils/ApiError');

async function list() {
  return purchaseOrderModel.list();
}
async function get(id) {
  const po = await purchaseOrderModel.findById(id);
  if (!po) throw new ApiError(404, 'Orden de compra no encontrada');
  return po;
}

async function nextNumber(conn) {
  const [rows] = await conn.execute('SELECT COUNT(*) AS n FROM purchase_orders');
  const year = new Date().getFullYear();
  return `OC-${year}-${String(rows[0].n + 1).padStart(4, '0')}`;
}

async function create(data, userId) {
  if (!data.supplier_id || !data.destination_location_id)
    throw new ApiError(400, 'supplier_id y destination_location_id son requeridos');
  if (!Array.isArray(data.items) || !data.items.length)
    throw new ApiError(400, 'Debe incluir al menos un ítem');

  if (!(await supplierModel.findById(data.supplier_id)))
    throw new ApiError(404, 'Proveedor no encontrado');
  if (!(await locationModel.findById(data.destination_location_id)))
    throw new ApiError(404, 'Ubicación destino no encontrada');

  for (const it of data.items) {
    if (!it.material_id || Number(it.quantity) <= 0)
      throw new ApiError(400, 'Ítem inválido');
    if (!(await materialModel.findById(it.material_id)))
      throw new ApiError(404, `Material ${it.material_id} no encontrado`);
  }

  const id = await withTransaction(async (conn) => {
    const orderNumber = data.order_number || (await nextNumber(conn));
    let total = 0;
    for (const it of data.items)
      total += Number(it.quantity) * Number(it.unit_price || 0);

    const [r] = await conn.execute(
      `INSERT INTO purchase_orders
        (order_number, supplier_id, status, destination_location_id,
         user_id, observations, total)
       VALUES (?,?,?,?,?,?,?)`,
      [
        orderNumber,
        data.supplier_id,
        data.status || 'borrador',
        data.destination_location_id,
        userId,
        data.observations || null,
        total
      ]
    );
    const poId = r.insertId;

    for (const it of data.items) {
      const subtotal = Number(it.quantity) * Number(it.unit_price || 0);
      await conn.execute(
        `INSERT INTO purchase_order_items
          (purchase_order_id, material_id, quantity, unit_price, subtotal)
         VALUES (?,?,?,?,?)`,
        [poId, it.material_id, it.quantity, it.unit_price || 0, subtotal]
      );
    }
    return poId;
  });

  return get(id);
}

async function receive(id, userId) {
  const po = await get(id);
  if (po.status === 'recibida') throw new ApiError(400, 'OC ya recibida');
  if (po.status === 'cancelada') throw new ApiError(400, 'OC cancelada');

  await withTransaction(async (conn) => {
    for (const it of po.items) {
      await conn.execute(
        `INSERT INTO movements
          (material_id, type, quantity, user_id, destination_location_id,
           source_document, observations)
         VALUES (?,?,?,?,?,?,?)`,
        [
          it.material_id,
          'entrada',
          it.quantity,
          userId,
          po.destination_location_id,
          po.order_number,
          `Recepción OC ${po.order_number}`
        ]
      );
    }
    await conn.execute(
      `UPDATE purchase_orders SET status = 'recibida' WHERE id = ?`,
      [id]
    );
  });

  for (const it of po.items) await alertService.evaluateMaterial(it.material_id);
  return get(id);
}

module.exports = { list, get, create, receive };