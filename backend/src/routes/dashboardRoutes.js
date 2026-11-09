const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const auth = require('../middleware/auth');
const c = require('../controllers/dashboardController');

router.get('/summary', auth(), asyncHandler(c.summary));
module.exports = router;