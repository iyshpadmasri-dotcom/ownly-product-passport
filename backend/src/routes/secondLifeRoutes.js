const express = require('express');
const router = express.Router();
const secondLifeController = require('../controllers/secondLifeController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.post('/product/:productId/action', secondLifeController.recordSecondLifeAction);

module.exports = router;
