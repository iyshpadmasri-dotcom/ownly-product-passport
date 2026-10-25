const prisma = require('../utils/prisma');

// Submit an inquiry on a listing
const createInquiry = async (req, res, next) => {
  try {
    const { listingId } = req.params;
    const { buyerName, buyerEmail, buyerPhone, message, offerPrice } = req.body;

    const listing = await prisma.marketplaceListing.findUnique({
      where: { id: listingId },
      include: { user: { select: { email: true, name: true } } },
    });

    if (!listing || listing.status !== 'ACTIVE') {
      return res.status(404).json({
        success: false,
        message: 'This listing is no longer active or available.',
      });
    }

    // Validation
    if (!buyerName || !buyerName.trim()) {
      return res.status(400).json({ success: false, field: 'buyerName', message: 'Please enter your name.' });
    }
    if (!buyerEmail || !buyerEmail.trim()) {
      return res.status(400).json({ success: false, field: 'buyerEmail', message: 'Please enter your email.' });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, field: 'message', message: 'Please include a message for the seller.' });
    }

    const inquiry = await prisma.buyerInquiry.create({
      data: {
        listingId,
        buyerUserId: req.user ? req.user.id : null,
        buyerName: buyerName.trim(),
        buyerEmail: buyerEmail.trim(),
        buyerPhone: buyerPhone ? buyerPhone.trim() : null,
        message: message.trim(),
        offerPrice: offerPrice ? parseFloat(offerPrice) : null,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Your inquiry has been sent to the seller!',
      data: inquiry,
    });
  } catch (err) {
    next(err);
  }
};

// Seller: get inquiries for their listings
const getSellerInquiries = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const inquiries = await prisma.buyerInquiry.findMany({
      where: {
        listing: {
          userId,
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            price: true,
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    res.json({
      success: true,
      data: inquiries,
    });
  } catch (err) {
    next(err);
  }
};

// Seller: update inquiry status (e.g. mark as READ or REPLIED)
const updateInquiryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const inquiry = await prisma.buyerInquiry.findUnique({
      where: { id },
      include: {
        listing: { select: { userId: true } },
      },
    });

    if (!inquiry || inquiry.listing.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found or unauthorized.',
      });
    }

    const updated = await prisma.buyerInquiry.update({
      where: { id },
      data: { status },
    });

    res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createInquiry,
  getSellerInquiries,
  updateInquiryStatus,
};
