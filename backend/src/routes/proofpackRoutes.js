const express = require('express');
const router = express.Router();
const proofpackController = require('../controllers/proofpackController');
const { authenticateToken, optionalAuth } = require('../middleware/authMiddleware');

// Public report view
router.get('/public/:shareToken', proofpackController.getPublicProofPack);

// Owner report configuration
router.get('/product/:productId', authenticateToken, proofpackController.getProofPackConfig);
router.post('/product/:productId', authenticateToken, proofpackController.createOrUpdateProofPack);

module.exports = router;
