const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const auth = require('../middleware/auth');
const c = require('../controllers/movementController');

router.get('/', auth(), asyncHandler(c.list));
router.post('/', auth(['admin', 'almacen']), asyncHandler(c.create));
module.exports = router;