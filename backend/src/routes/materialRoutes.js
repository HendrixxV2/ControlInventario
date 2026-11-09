const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const auth = require('../middleware/auth');
const c = require('../controllers/materialController');

router.get('/', auth(), asyncHandler(c.list));
router.post('/', auth(['admin', 'almacen']), asyncHandler(c.create));
router.get('/:id', auth(), asyncHandler(c.get));
router.put('/:id', auth(['admin', 'almacen']), asyncHandler(c.update));
router.get('/:id/stock', auth(), asyncHandler(c.stock));
router.get('/:id/traceability', auth(), asyncHandler(c.traceability));
module.exports = router;