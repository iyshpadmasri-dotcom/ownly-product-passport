const bcrypt = require('bcryptjs');
const prisma = require('../utils/prisma');

// Get profile
const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        location: true,
        city: true,
        state: true,
        pincode: true,
        avatarUrl: true,
        createdAt: true,
        _count: {
          select: {
            products: true,
            listings: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// Update profile
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, location, city, state, pincode, avatarUrl } = req.body;

    let finalAvatarUrl = avatarUrl;
    if (req.file) {
      finalAvatarUrl = `/uploads/${req.file.filename}`;
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name: name.trim() }),
        ...(location !== undefined && { location: location ? location.trim() : null }),
        ...(city !== undefined && { city: city ? city.trim() : null }),
        ...(state !== undefined && { state: state ? state.trim() : null }),
        ...(pincode !== undefined && { pincode: pincode ? pincode.trim() : null }),
        ...(finalAvatarUrl !== undefined && { avatarUrl: finalAvatarUrl }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        location: true,
        city: true,
        state: true,
        pincode: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

// Change password securely
const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword) {
      return res.status(400).json({ success: false, field: 'currentPassword', message: 'Enter your current password.' });
    }
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        field: 'newPassword',
        message: 'New password must be at least 6 characters.',
      });
    }
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        field: 'confirmNewPassword',
        message: 'New passwords do not match.',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        field: 'currentPassword',
        message: 'Current password is incorrect.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    res.json({
      success: true,
      message: 'Password updated successfully.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
};
