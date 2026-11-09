const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const auth = require('../middleware/auth');
const c = require('../controllers/supplierController');

router.get('/', auth(), asyncHandler(c.list));
router.post('/', auth(['admin', 'compras']), asyncHandler(c.create));
module.exports = router;