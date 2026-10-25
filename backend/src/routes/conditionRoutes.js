const express = require('express');
const router = express.Router();
const conditionController = require('../controllers/conditionController');
const { authenticateToken, optionalAuth } = require('../middleware/authMiddleware');

router.get('/product/:productId', optionalAuth, conditionController.getConditionReport);
router.post('/product/:productId', authenticateToken, conditionController.saveConditionReport);

module.exports = router;
