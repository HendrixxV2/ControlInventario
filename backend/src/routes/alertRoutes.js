const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const auth = require('../middleware/auth');
const c = require('../controllers/alertController');

router.get('/reorder', auth(), asyncHandler(c.list));
router.post('/recheck', auth(['admin', 'almacen', 'compras']), asyncHandler(c.recheck));
router.post('/:id/resolve', auth(['admin', 'almacen', 'compras']), asyncHandler(c.resolve));
module.exports = router;