const express = require('express');
const router = express.Router();
const inquiryController = require('../controllers/inquiryController');
const { authenticateToken, optionalAuth } = require('../middleware/authMiddleware');

router.post('/listing/:listingId', optionalAuth, inquiryController.createInquiry);
router.get('/seller/all', authenticateToken, inquiryController.getSellerInquiries);
router.put('/:id/status', authenticateToken, inquiryController.updateInquiryStatus);

module.exports = router;
