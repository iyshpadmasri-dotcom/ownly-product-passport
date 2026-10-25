const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

const JWT_SECRET = process.env.JWT_SECRET || 'ownly_default_jwt_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Field presence validation
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, field: 'name', message: 'Please enter your full name.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, field: 'email', message: 'Please enter your email address.' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, field: 'email', message: 'Please enter a valid email address.' });
    }
    if (!password) {
      return res.status(400).json({ success: false, field: 'password', message: 'Please enter a password.' });
    }
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        field: 'password',
        message: 'Password should be at least 6 characters long.',
      });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        field: 'confirmPassword',
        message: 'Passwords do not match. Please check and try again.',
      });
    }

    // Check if user already exists
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        field: 'email',
        message: 'An account with this email already exists. Try logging in.',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        location: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    // Generate token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    res.status(201).json({
      success: true,
      message: 'Welcome to Ownly! Your account has been created.',
      user,
      token,
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, field: 'email', message: 'Please enter your email.' });
    }
    if (!password) {
      return res.status(400).json({ success: false, field: 'password', message: 'Please enter your password.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No account found with this email. Please check or sign up.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        field: 'password',
        message: 'Incorrect password. Please try again.',
      });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      location: user.location,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    };

    res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      user: safeUser,
      token,
    });
  } catch (err) {
    next(err);
  }
};

const me = async (req, res, next) => {
  try {
    res.json({
      success: true,
      user: req.user,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  me,
};
