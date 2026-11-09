const router = require('express').Router();

router.use('/auth', require('./authRoutes'));
router.use('/users', require('./userRoutes'));
router.use('/suppliers', require('./supplierRoutes'));
router.use('/locations', require('./locationRoutes'));
router.use('/materials', require('./materialRoutes'));
router.use('/movements', require('./movementRoutes'));
router.use('/purchase-orders', require('./purchaseOrderRoutes'));
router.use('/alerts', require('./alertRoutes'));
router.use('/dashboard', require('./dashboardRoutes'));
router.use('/duplicate-rules', require('./duplicateRuleRoutes'));

module.exports = router;