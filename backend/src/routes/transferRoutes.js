const express = require('express');
const router = express.Router();
const transferController = require('../controllers/transferController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.post('/initiate', transferController.initiateTransfer);
router.get('/', transferController.getTransfers);
router.put('/:id/respond', transferController.respondTransfer);
router.put('/:id/cancel', transferController.cancelTransfer);

module.exports = router;
