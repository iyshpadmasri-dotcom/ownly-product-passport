const prisma = require('../utils/prisma');

// Add a history event to a product
const addHistory = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;
    const { eventDate, eventType, title, notes, cost, serviceProvider, evidenceType = 'SELF_REPORTED', documentId } = req.body;

    const product = await prisma.product.findFirst({
      where: { id: productId, userId },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or unauthorized.',
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, field: 'title', message: 'Event title is required.' });
    }
    if (!eventDate) {
      return res.status(400).json({ success: false, field: 'eventDate', message: 'Event date is required.' });
    }

    const parsedDate = new Date(eventDate);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ success: false, field: 'eventDate', message: 'Invalid date format.' });
    }

    const parsedCost = cost ? parseFloat(cost) : null;

    const history = await prisma.productHistory.create({
      data: {
        productId,
        eventDate: parsedDate,
        eventType: eventType || 'Service',
        title: title.trim(),
        notes: notes ? notes.trim() : null,
        cost: isNaN(parsedCost) ? null : parsedCost,
        serviceProvider: serviceProvider ? serviceProvider.trim() : null,
        recordedBy: req.user.name,
        evidenceType: ['SELF_REPORTED', 'DOCUMENT_SUPPORTED', 'VERIFIED'].includes(evidenceType) ? evidenceType : 'SELF_REPORTED',
        documentId: documentId || null,
      },
    });

    res.status(201).json({
      success: true,
      message: 'History record added successfully.',
      data: history,
    });
  } catch (err) {
    next(err);
  }
};

// Delete a history event
const deleteHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const history = await prisma.productHistory.findUnique({
      where: { id },
      include: {
        product: { select: { userId: true } },
      },
    });

    if (!history || history.product.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: 'History record not found or unauthorized.',
      });
    }

    await prisma.productHistory.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'History record deleted.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addHistory,
  deleteHistory,
};
