const crypto = require('crypto');
const prisma = require('../utils/prisma');
const { getWarrantyStatus } = require('./productController');

// Create or update ProofPack configuration for a product
const createOrUpdateProofPack = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;
    const {
      includePurchaseDate = true,
      includeWarranty = true,
      includeHistory = true,
      includeConditionReport = true,
      includeDocuments = false,
      isRevoked = false,
    } = req.body;

    const product = await prisma.product.findFirst({
      where: { id: productId, userId },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or unauthorized.',
      });
    }

    let report = await prisma.shareableReport.findFirst({
      where: { productId },
    });

    if (report) {
      report = await prisma.shareableReport.update({
        where: { id: report.id },
        data: {
          includePurchaseDate: Boolean(includePurchaseDate),
          includeWarranty: Boolean(includeWarranty),
          includeHistory: Boolean(includeHistory),
          includeConditionReport: Boolean(includeConditionReport),
          includeDocuments: Boolean(includeDocuments),
          isRevoked: Boolean(isRevoked),
        },
      });
    } else {
      const shareToken = crypto.randomBytes(16).toString('hex');
      report = await prisma.shareableReport.create({
        data: {
          productId,
          shareToken,
          includePurchaseDate: Boolean(includePurchaseDate),
          includeWarranty: Boolean(includeWarranty),
          includeHistory: Boolean(includeHistory),
          includeConditionReport: Boolean(includeConditionReport),
          includeDocuments: Boolean(includeDocuments),
          isRevoked: false,
        },
      });
    }

    res.json({
      success: true,
      message: 'ProofPack shareable report updated.',
      data: report,
    });
  } catch (err) {
    next(err);
  }
};

// Get ProofPack configuration for product owner
const getProofPackConfig = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const report = await prisma.shareableReport.findFirst({
      where: {
        productId,
        product: { userId },
      },
    });

    res.json({
      success: true,
      data: report || null,
    });
  } catch (err) {
    next(err);
  }
};

// Public endpoint to view a ProofPack report via shareToken
const getPublicProofPack = async (req, res, next) => {
  try {
    const { shareToken } = req.params;

    const report = await prisma.shareableReport.findUnique({
      where: { shareToken },
      include: {
        product: {
          include: {
            user: { select: { name: true, city: true, state: true } },
            documents: true,
            history: { orderBy: { eventDate: 'desc' } },
            conditionReports: { orderBy: { updatedAt: 'desc' }, take: 1 },
          },
        },
      },
    });

    if (!report || report.isRevoked) {
      return res.status(404).json({
        success: false,
        message: 'This ProofPack link has been revoked by the owner or does not exist.',
      });
    }

    const { product } = report;

    // Filter permitted history
    let allowedHistory = [];
    if (report.includeHistory) {
      allowedHistory = product.history.map((h) => ({
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

    // Filter approved documents (Only public and non-sensitive)
    let allowedDocuments = [];
    if (report.includeDocuments) {
      allowedDocuments = product.documents
        .filter((d) => d.isPublicForListing)
        .map((d) => ({
          id: d.id,
          type: d.type,
          title: d.title,
          fileSize: d.fileSize,
        }));
    }

    // Condition assessment
    let conditionAssessment = null;
    if (report.includeConditionReport && product.conditionReports.length > 0) {
      const cr = product.conditionReports[0];
      conditionAssessment = {
        overallCondition: cr.overallCondition,
        checklist: JSON.parse(cr.checklist || '{}'),
        notes: cr.notes,
        evidenceStatus: cr.evidenceStatus,
        updatedAt: cr.updatedAt,
      };
    }

    const warrantyInfo = report.includeWarranty && product.warrantyExpiry
      ? getWarrantyStatus(product.warrantyExpiry)
      : null;

    res.json({
      success: true,
      data: {
        token: report.shareToken,
        createdAt: report.createdAt,
        product: {
          name: product.name,
          brand: product.brand,
          model: product.model,
          category: product.category,
          imageUrl: product.imageUrl,
          description: product.description,
          purchaseDate: report.includePurchaseDate ? product.purchaseDate : null,
          purchasePrice: report.includePurchaseDate ? product.purchasePrice : null,
          purchaseStore: report.includePurchaseDate ? product.purchaseStore : null,
          // STRICT PRIVACY: serialOrImei is NEVER exposed in public proofpack
          warrantyInfo,
          condition: product.condition,
        },
        conditionAssessment,
        history: allowedHistory,
        documents: allowedDocuments,
        owner: {
          name: product.user.name,
          location: [product.user.city, product.user.state].filter(Boolean).join(', ') || 'India',
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createOrUpdateProofPack,
  getProofPackConfig,
  getPublicProofPack,
};
