const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const auth = require('../middleware/auth');
const c = require('../controllers/duplicateRuleController');

router.get('/', auth(), asyncHandler(c.getActive));
router.put('/:id', auth(['admin', 'compras']), asyncHandler(c.update));
module.exports = router;