const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { authenticateToken, optionalAuth } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

router.post('/product/:productId', authenticateToken, upload.single('document'), documentController.addDocument);
router.delete('/:id', authenticateToken, documentController.deleteDocument);
router.get('/:id/view', optionalAuth, documentController.viewOrDownloadDocument);

module.exports = router;
