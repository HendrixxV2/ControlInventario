const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const auth = require('../middleware/auth');
const c = require('../controllers/locationController');

router.get('/', auth(), asyncHandler(c.list));
router.post('/', auth(['admin', 'almacen']), asyncHandler(c.create));
router.get('/:id/stock', auth(), asyncHandler(c.stock));
module.exports = router;