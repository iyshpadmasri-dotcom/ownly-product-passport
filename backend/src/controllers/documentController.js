const path = require('path');
const fs = require('fs');
const prisma = require('../utils/prisma');

const formatBytes = (bytes, decimals = 1) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Add a document to a product
const addDocument = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;
    const { type, title, isPublicForListing } = req.body;

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

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, field: 'title', message: 'Document title is required.' });
    }

    const validTypes = ['Purchase Bill', 'Warranty', 'User Manual', 'Service Records', 'Other Documents'];
    const docType = validTypes.includes(type) ? type : 'Other Documents';

    let fileUrl = '';
    let fileName = '';
    let fileSize = '0 KB';
    let mimeType = 'application/octet-stream';

    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
      fileName = req.file.originalname;
      fileSize = formatBytes(req.file.size);
      mimeType = req.file.mimetype;
    } else if (req.body.fileUrl) {
      fileUrl = req.body.fileUrl;
      fileName = req.body.fileName || `${title.replace(/\s+/g, '_')}.pdf`;
      fileSize = req.body.fileSize || '120 KB';
      mimeType = 'application/pdf';
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please select a document file to upload.',
      });
    }

    const document = await prisma.productDocument.create({
      data: {
        productId,
        type: docType,
        title: title.trim(),
        fileUrl,
        fileName,
        fileSize,
        mimeType,
        isPublicForListing: isPublicForListing === 'true' || isPublicForListing === true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully.',
      data: document,
    });
  } catch (err) {
    next(err);
  }
};

// Delete a document
const deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const document = await prisma.productDocument.findUnique({
      where: { id },
      include: {
        product: { select: { userId: true } },
      },
    });

    if (!document || document.product.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Document not found or unauthorized.',
      });
    }

    // Try deleting physical file if in local uploads
    if (document.fileUrl && document.fileUrl.startsWith('/uploads/')) {
      const filename = path.basename(document.fileUrl);
      const filePath = path.join(__dirname, '../../uploads', filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.warn('Could not delete file from disk:', e.message);
        }
      }
    }

    await prisma.productDocument.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Document deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};

// Secure download/preview of a document
const viewOrDownloadDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const document = await prisma.productDocument.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            listings: { where: { status: 'ACTIVE' } },
          },
        },
      },
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found.',
      });
    }

    const isOwner = req.user && req.user.id === document.product.userId;
    const isPublicApproved =
      document.isPublicForListing &&
      document.product.listings.length > 0 &&
      document.product.listings[0].shareDocuments;

    if (!isOwner && !isPublicApproved) {
      return res.status(403).json({
        success: false,
        message: 'This document is private and not authorized for public viewing.',
      });
    }

    if (document.fileUrl.startsWith('/uploads/')) {
      const filename = path.basename(document.fileUrl);
      const filePath = path.join(__dirname, '../../uploads', filename);
      if (fs.existsSync(filePath)) {
        return res.sendFile(filePath);
      }
    }

    // If external or simulated file url
    res.redirect(document.fileUrl);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addDocument,
  deleteDocument,
  viewOrDownloadDocument,
};
