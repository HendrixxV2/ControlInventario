const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const c = require('../controllers/authController');

router.post('/login', asyncHandler(c.login));
module.exports = router;