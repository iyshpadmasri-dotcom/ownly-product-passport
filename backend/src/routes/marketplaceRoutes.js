const express = require('express');
const router = express.Router();
const marketplaceController = require('../controllers/marketplaceController');
const { authenticateToken, optionalAuth } = require('../middleware/authMiddleware');

// Public listing browsing with optional auth
router.get('/', optionalAuth, marketplaceController.getMarketplaceListings);
router.get('/user/my-listings', authenticateToken, marketplaceController.getMyListings);
router.get('/:id', optionalAuth, marketplaceController.getListingById);

// Seller actions
router.post('/', authenticateToken, marketplaceController.createListing);
router.put('/:id', authenticateToken, marketplaceController.updateListing);
router.delete('/:id', authenticateToken, marketplaceController.deleteListing);

module.exports = router;
