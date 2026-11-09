const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const auth = require('../middleware/auth');
const c = require('../controllers/userController');

router.get('/', auth(['admin', 'almacen', 'compras']), asyncHandler(c.list));
module.exports = router;