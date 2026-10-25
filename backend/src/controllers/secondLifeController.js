const prisma = require('../utils/prisma');

// Record a SecondLife action (Repair, Donate, Recycle)
const recordSecondLifeAction = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;
    const action = req.body.actionType || req.body.action;
    const { details, partnerOrCenter, cost, date } = req.body;

    const validActions = ['REPAIR', 'DONATE', 'RECYCLE'];
    if (!action || !validActions.includes(action.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid SecondLife action. Choose from REPAIR, DONATE, or RECYCLE.',
      });
    }
    const actionType = action.toUpperCase();

    const product = await prisma.product.findFirst({
      where: { id: productId, userId },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or unauthorized.',
      });
    }

    const eventDate = date ? new Date(date) : new Date();

    let newLifecycleStatus = 'OWNED';
    let historyTitle = '';
    let eventType = 'Other';

    if (actionType === 'REPAIR') {
      newLifecycleStatus = 'REPAIR_PENDING';
      eventType = 'Repair';
      historyTitle = `Repair Needed: ${details?.title || 'Service Recorded'}`;
    } else if (actionType === 'DONATE') {
      newLifecycleStatus = 'DONATED';
      eventType = 'Donation';
      historyTitle = `Donated to ${partnerOrCenter || 'Community / Charity'}`;
    } else if (actionType === 'RECYCLE') {
      newLifecycleStatus = 'RECYCLED';
      eventType = 'Recycle';
      historyTitle = `E-Waste Recycled via ${partnerOrCenter || 'Authorized Recycling Centre'}`;
    }

    // Update product lifecycle status
    await prisma.product.update({
      where: { id: productId },
      data: {
        lifecycleStatus: newLifecycleStatus,
      },
    });

    // Create history event
    const history = await prisma.productHistory.create({
      data: {
        productId,
        eventType,
        eventDate,
        title: historyTitle,
        notes: details?.notes || `SecondLife responsible lifecycle option recorded.`,
        cost: cost ? parseFloat(cost) : null,
        serviceProvider: partnerOrCenter || null,
        recordedBy: req.user.name,
        evidenceType: 'SELF_REPORTED',
      },
    });

    res.status(201).json({
      success: true,
      message: `Product recorded under SecondLife ${actionType.toLowerCase()} option.`,
      data: {
        lifecycleStatus: newLifecycleStatus,
        history,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  recordSecondLifeAction,
};
