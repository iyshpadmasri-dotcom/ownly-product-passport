const prisma = require('../utils/prisma');

// Initiate an ownership transfer
const initiateTransfer = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId, toEmail, notes, shareDocuments = true, shareHistory = true } = req.body;

    if (!toEmail || !toEmail.trim()) {
      return res.status(400).json({
        success: false,
        field: 'toEmail',
        message: 'Please enter the recipient’s email address.',
      });
    }

    const normalizedToEmail = toEmail.trim().toLowerCase();
    if (normalizedToEmail === req.user.email.toLowerCase()) {
      return res.status(400).json({
        success: false,
        field: 'toEmail',
        message: 'You cannot transfer a product to yourself.',
      });
    }

    // Verify ownership
    const product = await prisma.product.findFirst({
      where: { id: productId, userId },
      include: {
        transfers: {
          where: { status: 'PENDING' },
        },
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or you do not have permission to transfer it.',
      });
    }

    if (product.transfers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'A transfer request for this product is already pending. Cancel it before creating a new one.',
      });
    }

    // Create the transfer record
    const transfer = await prisma.ownershipTransfer.create({
      data: {
        productId,
        fromUserId: userId,
        toEmail: normalizedToEmail,
        notes: notes ? notes.trim() : null,
        shareDocuments: Boolean(shareDocuments),
        shareHistory: Boolean(shareHistory),
        status: 'PENDING',
      },
      include: {
        product: { select: { id: true, name: true, brand: true, imageUrl: true } },
      },
    });

    res.status(201).json({
      success: true,
      message: `Ownership transfer initiated for ${toEmail}. Awaiting recipient’s acceptance.`,
      data: transfer,
    });
  } catch (err) {
    next(err);
  }
};

// Get pending transfers (incoming and outgoing)
const getTransfers = async (req, res, next) => {
  try {
    const userEmail = req.user.email.toLowerCase();
    const userId = req.user.id;

    const [incoming, outgoing, history] = await Promise.all([
      // Incoming transfers for current user's email
      prisma.ownershipTransfer.findMany({
        where: {
          toEmail: userEmail,
          status: 'PENDING',
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              brand: true,
              category: true,
              imageUrl: true,
              purchaseDate: true,
            },
          },
          fromUser: {
            select: {
              id: true,
              name: true,
              // Privacy rule: do not expose previous owner's email or exact location
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),

      // Outgoing transfers sent by current user
      prisma.ownershipTransfer.findMany({
        where: {
          fromUserId: userId,
          status: 'PENDING',
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              brand: true,
              imageUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),

      // Completed / historical transfers
      prisma.ownershipTransfer.findMany({
        where: {
          OR: [
            { fromUserId: userId, status: { in: ['ACCEPTED', 'REJECTED', 'CANCELLED'] } },
            { toUserId: userId, status: 'ACCEPTED' },
          ],
        },
        include: {
          product: { select: { id: true, name: true, brand: true, imageUrl: true } },
          fromUser: { select: { name: true } },
          toUser: { select: { name: true } },
        },
        orderBy: { updatedAt: 'desc' },
        take: 10,
      }),
    ]);

    res.json({
      success: true,
      data: {
        incoming,
        outgoing,
        history,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Accept or Reject a transfer request
const respondTransfer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'ACCEPT' or 'REJECT'
    const userEmail = req.user.email.toLowerCase();
    const userId = req.user.id;

    const transfer = await prisma.ownershipTransfer.findUnique({
      where: { id },
      include: {
        product: true,
        fromUser: { select: { id: true, name: true } },
      },
    });

    if (!transfer || transfer.toEmail.toLowerCase() !== userEmail) {
      return res.status(404).json({
        success: false,
        message: 'Transfer request not found or not addressed to your account.',
      });
    }

    if (transfer.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `This transfer request has already been ${transfer.status.toLowerCase()}.`,
      });
    }

    if (action === 'ACCEPT') {
      // 1. Update product ownership to the new user
      await prisma.product.update({
        where: { id: transfer.productId },
        data: {
          userId,
          lifecycleStatus: 'OWNED',
        },
      });

      // 2. If the product had an active marketplace listing, delist/mark as sold
      await prisma.marketplaceListing.updateMany({
        where: {
          productId: transfer.productId,
          status: 'ACTIVE',
        },
        data: {
          status: 'SOLD',
        },
      });

      // 3. Mark transfer as ACCEPTED
      const updatedTransfer = await prisma.ownershipTransfer.update({
        where: { id },
        data: {
          status: 'ACCEPTED',
          toUserId: userId,
          completedAt: new Date(),
        },
      });

      // 4. Log permanent LifeTrace transfer entry in product history
      await prisma.productHistory.create({
        data: {
          productId: transfer.productId,
          eventType: 'Ownership Transfer',
          eventDate: new Date(),
          title: `Ownership Transferred to ${req.user.name}`,
          notes: `Official digital passport transfer completed. Previous owner verified care history preserved.`,
          recordedBy: 'Ownly Transfer System',
          evidenceType: 'VERIFIED',
          isTransferRecord: true,
        },
      });

      return res.json({
        success: true,
        message: `Congratulations! ${transfer.product.name} has been transferred to your Ownly passport.`,
        data: updatedTransfer,
      });
    } else if (action === 'REJECT') {
      const updatedTransfer = await prisma.ownershipTransfer.update({
        where: { id },
        data: {
          status: 'REJECTED',
          toUserId: userId,
          completedAt: new Date(),
        },
      });

      return res.json({
        success: true,
        message: 'Transfer request declined.',
        data: updatedTransfer,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Must be ACCEPT or REJECT.',
      });
    }
  } catch (err) {
    next(err);
  }
};

// Cancel an outgoing transfer request
const cancelTransfer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const transfer = await prisma.ownershipTransfer.findFirst({
      where: { id, fromUserId: userId, status: 'PENDING' },
    });

    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: 'Pending transfer not found or unauthorized.',
      });
    }

    await prisma.ownershipTransfer.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    res.json({
      success: true,
      message: 'Transfer request cancelled.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  initiateTransfer,
  getTransfers,
  respondTransfer,
  cancelTransfer,
};
