const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const auth = require('../middleware/auth');
const c = require('../controllers/purchaseOrderController');

// Debe ir antes de /:id
router.get('/duplicates', auth(), asyncHandler(c.duplicates));
router.get('/', auth(), asyncHandler(c.list));
router.post('/', auth(['admin', 'compras']), asyncHandler(c.create));
router.get('/:id', auth(), asyncHandler(c.get));
router.post('/:id/receive', auth(['admin', 'almacen', 'compras']), asyncHandler(c.receive));
module.exports = router;