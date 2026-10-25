const prisma = require('../utils/prisma');
const { getWarrantyStatus } = require('./productController');

// Public: Get all active marketplace listings with search, category, price, sort
const getMarketplaceListings = async (req, res, next) => {
  try {
    const { search, category, minPrice, maxPrice, condition, sortBy, state, city } = req.query;

    const where = {
      status: 'ACTIVE',
      ...(category && category !== 'All' ? { product: { category } } : {}),
      ...(condition && condition !== 'All' ? { condition } : {}),
      ...(state && state !== 'All' ? {
        OR: [
          { state: { contains: state } },
          { location: { contains: state } },
        ]
      } : {}),
      ...(city && city !== 'All' ? {
        OR: [
          { city: { contains: city } },
          { location: { contains: city } },
        ]
      } : {}),
      ...(minPrice || maxPrice
        ? {
            price: {
              ...(minPrice ? { gte: parseFloat(minPrice) } : {}),
              ...(maxPrice ? { lte: parseFloat(maxPrice) } : {}),
            },
          }
        : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search } },
              { description: { contains: search } },
              { product: { name: { contains: search } } },
              { product: { brand: { contains: search } } },
              { location: { contains: search } },
            ],
          }
        : {}),
    };

    let orderBy = { createdAt: 'desc' };
    if (sortBy === 'price_asc') orderBy = { price: 'asc' };
    if (sortBy === 'price_desc') orderBy = { price: 'desc' };
    if (sortBy === 'oldest') orderBy = { createdAt: 'asc' };

    const listings = await prisma.marketplaceListing.findMany({
      where,
      orderBy,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            brand: true,
            model: true,
            category: true,
            imageUrl: true,
            purchaseDate: true,
            warrantyExpiry: true,
            _count: {
              select: {
                documents: true,
                history: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
      },
    });

    // Format each card with indicators reflecting REAL shared data
    const formatted = listings.map((listing) => {
      const hasPurchaseRecord =
        listing.sharePurchaseDate && Boolean(listing.product.purchaseDate);

      const hasWarrantyRecord =
        listing.shareWarranty &&
        Boolean(listing.product.warrantyExpiry) &&
        new Date(listing.product.warrantyExpiry) > new Date();

      const hasServiceHistory =
        listing.shareHistory && listing.product._count.history > 0;

      const hasDocuments =
        listing.shareDocuments && listing.product._count.documents > 0;

      return {
        id: listing.id,
        productId: listing.product.id,
        title: listing.title,
        price: listing.price,
        condition: listing.condition,
        location: listing.location || listing.user.location || 'Location not specified',
        createdAt: listing.createdAt,
        product: {
          name: listing.product.name,
          brand: listing.product.brand,
          category: listing.product.category,
          imageUrl: listing.product.imageUrl,
        },
        seller: {
          name: listing.user.name,
        },
        historyBadges: {
          purchaseRecord: hasPurchaseRecord,
          warrantyActive: hasWarrantyRecord,
          serviceHistory: hasServiceHistory,
          documentsAvailable: hasDocuments,
        },
      };
    });

    res.json({
      success: true,
      data: formatted,
    });
  } catch (err) {
    next(err);
  }
};

// Public/Semi-public: Get single listing details with only approved shared history and docs
const getListingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const listing = await prisma.marketplaceListing.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            documents: true,
            history: {
              orderBy: { eventDate: 'desc' },
            },
            conditionReports: {
              orderBy: { updatedAt: 'desc' },
              take: 1,
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            location: true,
            city: true,
            state: true,
            avatarUrl: true,
            createdAt: true,
          },
        },
      },
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Marketplace listing not found or has ended.',
      });
    }

    // Filter information according to seller's privacy preferences
    let sharedHistory = [];
    if (listing.shareHistory) {
      sharedHistory = listing.product.history.map((h) => ({
        id: h.id,
        eventType: h.eventType,
        eventDate: h.eventDate,
        title: h.title,
        notes: h.notes,
        cost: h.cost,
        recordedBy: h.recordedBy || 'Owner',
        evidenceType: h.evidenceType || 'SELF_REPORTED',
      }));
    }

    let sharedDocuments = [];
    if (listing.shareDocuments) {
      // Only include documents explicitly marked as public for listing
      sharedDocuments = listing.product.documents
        .filter((d) => d.isPublicForListing)
        .map((d) => ({
          id: d.id,
          type: d.type,
          title: d.title,
          fileSize: d.fileSize,
        }));
    }

    // TrustCheck condition report
    let conditionAssessment = null;
    if (listing.product.conditionReports && listing.product.conditionReports.length > 0) {
      const cr = listing.product.conditionReports[0];
      conditionAssessment = {
        overallCondition: cr.overallCondition,
        checklist: JSON.parse(cr.checklist || '{}'),
        notes: cr.notes,
        evidenceStatus: cr.evidenceStatus,
        updatedAt: cr.updatedAt,
      };
    }

    const warrantyInfo =
      listing.shareWarranty && listing.product.warrantyExpiry
        ? getWarrantyStatus(listing.product.warrantyExpiry)
        : null;

    const isSeller = req.user && req.user.id === listing.userId;

    res.json({
      success: true,
      data: {
        id: listing.id,
        productId: listing.productId,
        title: listing.title,
        description: listing.description,
        price: listing.price,
        condition: listing.condition,
        location: listing.location || [listing.city, listing.state].filter(Boolean).join(', ') || 'India',
        status: listing.status,
        createdAt: listing.createdAt,
        isSeller,
        product: {
          id: listing.product.id,
          name: listing.product.name,
          brand: listing.product.brand,
          model: listing.product.model,
          category: listing.product.category,
          imageUrl: listing.product.imageUrl,
          purchaseDate: listing.sharePurchaseDate ? listing.product.purchaseDate : null,
          purchaseStore: listing.sharePurchaseDate ? listing.product.purchaseStore : null,
          warrantyInfo,
        },
        conditionAssessment,
        sharedHistory,
        sharedDocuments,
        seller: {
          id: listing.user.id,
          name: listing.user.name,
          location: listing.user.location || [listing.user.city, listing.user.state].filter(Boolean).join(', ') || 'India',
          avatarUrl: listing.user.avatarUrl,
          memberSince: listing.user.createdAt,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// Authenticated: Create a marketplace listing for a product
const createListing = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      productId,
      title,
      description,
      price,
      condition,
      location,
      sharePurchaseDate = true,
      shareWarranty = true,
      shareHistory = true,
      shareDocuments = false,
    } = req.body;

    const product = await prisma.product.findFirst({
      where: { id: productId, userId },
      include: {
        listings: { where: { status: 'ACTIVE' } },
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product passport not found or unauthorized.',
      });
    }

    if (product.listings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'This product is already listed for sale on the marketplace.',
      });
    }

    if (!price || parseFloat(price) <= 0) {
      return res.status(400).json({
        success: false,
        field: 'price',
        message: 'Please enter a valid asking price.',
      });
    }
    if (!condition) {
      return res.status(400).json({
        success: false,
        field: 'condition',
        message: 'Please select the item condition.',
      });
    }

    const listingTitle = title && title.trim() ? title.trim() : product.name;
    const listingDescription =
      description && description.trim()
        ? description.trim()
        : product.description || `Selling my ${product.name}. In ${condition.toLowerCase()} condition.`;

    const listing = await prisma.marketplaceListing.create({
      data: {
        productId,
        userId,
        title: listingTitle,
        description: listingDescription,
        price: parseFloat(price),
        condition,
        location: location ? location.trim() : req.user.location || null,
        sharePurchaseDate: Boolean(sharePurchaseDate),
        shareWarranty: Boolean(shareWarranty),
        shareHistory: Boolean(shareHistory),
        shareDocuments: Boolean(shareDocuments),
      },
    });

    res.status(201).json({
      success: true,
      message: 'Your product is now listed on the Ownly marketplace!',
      data: listing,
    });
  } catch (err) {
    next(err);
  }
};

// Authenticated: Get all listings created by the logged-in user
const getMyListings = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const listings = await prisma.marketplaceListing.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            brand: true,
            imageUrl: true,
            category: true,
          },
        },
        inquiries: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    res.json({
      success: true,
      data: listings,
    });
  } catch (err) {
    next(err);
  }
};

// Authenticated: Update listing (price, status, details)
const updateListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, description, price, condition, location, status } = req.body;

    const existing = await prisma.marketplaceListing.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found or unauthorized.',
      });
    }

    const updated = await prisma.marketplaceListing.update({
      where: { id },
      data: {
        ...(title && { title: title.trim() }),
        ...(description && { description: description.trim() }),
        ...(price && { price: parseFloat(price) }),
        ...(condition && { condition }),
        ...(location !== undefined && { location: location ? location.trim() : null }),
        ...(status && { status }), // ACTIVE, SOLD, DELISTED
      },
    });

    res.json({
      success: true,
      message: 'Listing updated successfully.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

// Authenticated: Delete or delist listing
const deleteListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await prisma.marketplaceListing.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found or unauthorized.',
      });
    }

    await prisma.marketplaceListing.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Listing removed from the marketplace.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMarketplaceListings,
  getListingById,
  createListing,
  getMyListings,
  updateListing,
  deleteListing,
};
