const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.post('/product/:productId', historyController.addHistory);
router.delete('/:id', historyController.deleteHistory);

module.exports = router;
