const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// [VIRTUAL IDENTITY] Generate JWT containing user ID to maintain session state
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  '/register',
  [
    body('username')
      .trim()
      .isLength({ min: 3, max: 20 })
      .withMessage('Username must be between 3-20 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { username, email, password } = req.body;

    try {
      // Check if user already exists
      const userExists = await User.findOne({
        $or: [{ email }, { username }]
      });

      if (userExists) {
        return res.status(400).json({
          success: false,
          message: 'User with this email or username already exists',
        });
      }

      // [SECURITY] Hash password using bcrypt before saving to DB
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await User.create({
        username,
        email,
        password: hashedPassword, // Use the hashed password
      });

      // Create token
      const token = generateToken(user._id);

      console.log('User registered:', {
        id: user._id,
        username: user.username,
        highestScore: user.highestScore,
        gamesPlayed: user.gamesPlayed
      }); // Debug log

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          id: user._id,
          username: user.username,
          email: user.email,
          highestScore: user.highestScore,
          gamesPlayed: user.gamesPlayed,
          token,
        },
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during registration',
        error: error.message,
      });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    try {
      // Find user and include password
      const user = await User.findOne({ email }).select('+password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      // Check password
      const isMatch = await user.matchPassword(password);

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      // Create token
      const token = generateToken(user._id);

      console.log('User logged in:', {
        id: user._id,
        username: user.username,
        highestScore: user.highestScore,
        gamesPlayed: user.gamesPlayed
      }); // Debug log

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          id: user._id,
          username: user.username,
          email: user.email,
          highestScore: user.highestScore,
          gamesPlayed: user.gamesPlayed,
          token,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during login',
        error: error.message,
      });
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get current user (with fresh stats)
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    console.log('Fetching user data:', {
      id: user._id,
      username: user.username,
      highestScore: user.highestScore,
      gamesPlayed: user.gamesPlayed
    }); // Debug log

    res.json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        highestScore: user.highestScore,
        gamesPlayed: user.gamesPlayed,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

module.exports = router;