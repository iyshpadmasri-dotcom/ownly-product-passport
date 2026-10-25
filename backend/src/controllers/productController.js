const prisma = require('../utils/prisma');

// Helper to determine warranty status
const getWarrantyStatus = (warrantyExpiry) => {
  if (!warrantyExpiry) return { status: 'NO_DETAILS', label: 'No Warranty Details' };
  const now = new Date();
  const expiry = new Date(warrantyExpiry);
  const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { status: 'EXPIRED', label: 'Expired', daysLeft: diffDays };
  }
  if (diffDays <= 30) {
    return { status: 'EXPIRING_SOON', label: `Expiring Soon (${diffDays}d left)`, daysLeft: diffDays };
  }
  return { status: 'ACTIVE', label: `Warranty Active (${diffDays}d left)`, daysLeft: diffDays };
};

// Summary metrics for the dashboard
const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    const [totalProducts, listedForSale, underWarranty] = await Promise.all([
      prisma.product.count({ where: { userId } }),
      prisma.marketplaceListing.count({
        where: {
          userId,
          status: 'ACTIVE',
        },
      }),
      prisma.product.count({
        where: {
          userId,
          warrantyExpiry: {
            gte: now,
          },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalProducts,
        listedForSale,
        underWarranty,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Get all products for the logged-in user
const getProducts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { search, category } = req.query;

    const where = {
      userId,
      ...(category && category !== 'All' ? { category } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { brand: { contains: search } },
              { model: { contains: search } },
            ],
          }
        : {}),
    };

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        documents: { select: { id: true, type: true } },
        history: { select: { id: true, eventType: true, eventDate: true } },
        listings: {
          where: { status: 'ACTIVE' },
          select: { id: true, price: true, status: true },
        },
      },
    });

    const enriched = products.map((p) => ({
      ...p,
      warrantyInfo: getWarrantyStatus(p.warrantyExpiry),
      isListed: p.listings.length > 0,
      activeListingId: p.listings[0]?.id || null,
      documentCount: p.documents.length,
      historyCount: p.history.length,
    }));

    res.json({
      success: true,
      data: enriched,
    });
  } catch (err) {
    next(err);
  }
};

// Get single product passport
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const product = await prisma.product.findFirst({
      where: { id, userId },
      include: {
        documents: {
          orderBy: { createdAt: 'desc' },
        },
        history: {
          orderBy: { eventDate: 'desc' },
        },
        conditionReports: {
          orderBy: { updatedAt: 'desc' },
          take: 1,
        },
        transfers: {
          where: { status: 'PENDING' },
          include: { fromUser: { select: { name: true } } },
        },
        listings: {
          where: { status: 'ACTIVE' },
          include: {
            inquiries: {
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product passport not found or you do not have permission to view it.',
      });
    }

    const warrantyInfo = getWarrantyStatus(product.warrantyExpiry);

    res.json({
      success: true,
      data: {
        ...product,
        warrantyInfo,
        activeListing: product.listings[0] || null,
        pendingTransfer: product.transfers[0] || null,
        latestConditionReport: product.conditionReports[0] ? {
          ...product.conditionReports[0],
          checklist: JSON.parse(product.conditionReports[0].checklist || '{}'),
        } : null,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Create a new product (Two-step flow backend handler)
const createProduct = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      name,
      category,
      brand,
      model,
      imageUrl,
      purchaseDate,
      purchasePrice,
      purchaseStore,
      serialOrImei,
      condition,
      warrantyExpiry,
      description,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, field: 'name', message: 'Product name is required.' });
    }
    if (!category || !category.trim()) {
      return res.status(400).json({ success: false, field: 'category', message: 'Category is required.' });
    }

    let finalImageUrl = imageUrl || null;
    if (req.file) {
      finalImageUrl = `/uploads/${req.file.filename}`;
    }

    const parsedPurchaseDate = purchaseDate ? new Date(purchaseDate) : null;
    const parsedWarrantyExpiry = warrantyExpiry ? new Date(warrantyExpiry) : null;
    const parsedPurchasePrice = purchasePrice ? parseFloat(purchasePrice) : null;

    const product = await prisma.product.create({
      data: {
        userId,
        name: name.trim(),
        category: category.trim(),
        brand: brand ? brand.trim() : null,
        model: model ? model.trim() : null,
        imageUrl: finalImageUrl,
        purchaseDate: parsedPurchaseDate,
        purchasePrice: isNaN(parsedPurchasePrice) ? null : parsedPurchasePrice,
        purchaseStore: purchaseStore ? purchaseStore.trim() : null,
        serialOrImei: serialOrImei ? serialOrImei.trim() : null,
        condition: condition || 'Good',
        warrantyExpiry: parsedWarrantyExpiry,
        description: description ? description.trim() : null,
        lifecycleStatus: 'OWNED',
      },
    });

    // If purchase date was provided, auto-create the first timeline entry!
    if (parsedPurchaseDate && !isNaN(parsedPurchaseDate.getTime())) {
      await prisma.productHistory.create({
        data: {
          productId: product.id,
          eventType: 'Purchase',
          eventDate: parsedPurchaseDate,
          title: `Purchased ${product.name}`,
          cost: parsedPurchasePrice,
          notes: purchaseStore ? `Bought from ${purchaseStore}` : (brand ? `Brand: ${brand}` : 'Acquired product'),
          serviceProvider: purchaseStore || null,
          recordedBy: req.user.name,
          evidenceType: 'SELF_REPORTED',
        },
      });
    }

    res.status(201).json({
      success: true,
      message: 'Your product passport is ready!',
      data: product,
    });
  } catch (err) {
    next(err);
  }
};

// Update an existing product
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const {
      name,
      category,
      brand,
      model,
      imageUrl,
      purchaseDate,
      purchasePrice,
      purchaseStore,
      serialOrImei,
      condition,
      warrantyExpiry,
      description,
    } = req.body;

    const existing = await prisma.product.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or unauthorized.',
      });
    }

    let finalImageUrl = existing.imageUrl;
    if (req.file) {
      finalImageUrl = `/uploads/${req.file.filename}`;
    } else if (imageUrl !== undefined) {
      finalImageUrl = imageUrl;
    }

    const parsedPurchaseDate = purchaseDate ? new Date(purchaseDate) : null;
    const parsedWarrantyExpiry = warrantyExpiry ? new Date(warrantyExpiry) : null;
    const parsedPurchasePrice = purchasePrice ? parseFloat(purchasePrice) : null;

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(category && { category: category.trim() }),
        brand: brand !== undefined ? (brand ? brand.trim() : null) : existing.brand,
        model: model !== undefined ? (model ? model.trim() : null) : existing.model,
        imageUrl: finalImageUrl,
        purchaseDate: parsedPurchaseDate,
        purchasePrice: isNaN(parsedPurchasePrice) ? null : parsedPurchasePrice,
        purchaseStore: purchaseStore !== undefined ? (purchaseStore ? purchaseStore.trim() : null) : existing.purchaseStore,
        serialOrImei: serialOrImei !== undefined ? (serialOrImei ? serialOrImei.trim() : null) : existing.serialOrImei,
        condition: condition !== undefined ? condition : existing.condition,
        warrantyExpiry: parsedWarrantyExpiry,
        description: description !== undefined ? (description ? description.trim() : null) : existing.description,
      },
    });

    res.json({
      success: true,
      message: 'Product details updated successfully.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

// Delete a product (with cascade)
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await prisma.product.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or unauthorized.',
      });
    }

    await prisma.product.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Product and its passport records have been removed.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardSummary,
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getWarrantyStatus,
};
