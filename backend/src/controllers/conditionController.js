const prisma = require('../utils/prisma');

// Get condition report for a product
const getConditionReport = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const report = await prisma.conditionReport.findFirst({
      where: { productId },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({
      success: true,
      data: report ? {
        ...report,
        checklist: JSON.parse(report.checklist || '{}'),
      } : null,
    });
  } catch (err) {
    next(err);
  }
};

// Create or update condition report (Owner only)
const saveConditionReport = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;
    const { overallCondition, checklist, notes, evidenceStatus = 'SELLER_REPORTED' } = req.body;

    // Verify product ownership
    const product = await prisma.product.findFirst({
      where: { id: productId, userId },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or unauthorized.',
      });
    }

    if (!overallCondition) {
      return res.status(400).json({
        success: false,
        message: 'Please select an overall condition rating.',
      });
    }

    const checklistString = typeof checklist === 'string' ? checklist : JSON.stringify(checklist || {});

    // Upsert condition report
    const existing = await prisma.conditionReport.findFirst({
      where: { productId },
    });

    let report;
    if (existing) {
      report = await prisma.conditionReport.update({
        where: { id: existing.id },
        data: {
          overallCondition,
          checklist: checklistString,
          notes: notes ? notes.trim() : null,
          evidenceStatus,
        },
      });
    } else {
      report = await prisma.conditionReport.create({
        data: {
          productId,
          overallCondition,
          checklist: checklistString,
          notes: notes ? notes.trim() : null,
          evidenceStatus,
        },
      });
    }

    // Also update product's overall condition and add timeline check
    await prisma.product.update({
      where: { id: productId },
      data: { condition: overallCondition },
    });

    await prisma.productHistory.create({
      data: {
        productId,
        eventType: 'Condition Check',
        eventDate: new Date(),
        title: `TrustCheck Report: ${overallCondition}`,
        notes: `Physical and functional condition assessment recorded. Evidence status: ${evidenceStatus === 'DOCUMENT_SUPPORTED' ? 'Document-Supported' : 'Self-Reported by Seller'}.`,
        recordedBy: req.user.name,
        evidenceType: evidenceStatus,
      },
    });

    res.status(200).json({
      success: true,
      message: 'TrustCheck condition report saved.',
      data: {
        ...report,
        checklist: JSON.parse(report.checklist || '{}'),
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getConditionReport,
  saveConditionReport,
};
