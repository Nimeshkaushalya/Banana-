const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Score = require('../models/Score');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route   POST /api/scores
// @desc    Submit a new score
// @access  Private
router.post(
  '/',
  protect,
  [
    body('score').isInt({ min: 0 }).withMessage('Score must be a positive integer'),
    body('bananasCollected').isInt({ min: 0 }).withMessage('Bananas collected must be a positive integer'),
    body('livesUsed').isInt({ min: 0 }).withMessage('Lives used must be a positive integer'),
    body('gameLevel').isInt({ min: 1 }).withMessage('Game level must be at least 1'),
    body('gameDuration').isInt({ min: 0 }).withMessage('Game duration must be a positive integer'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { score, bananasCollected, livesUsed, gameLevel, gameDuration } = req.body;

    try {
      // Create score entry
      const scoreEntry = await Score.create({
        user: req.user.id,
        username: req.user.username,
        score,
        bananasCollected,
        livesUsed,
        gameLevel,
        gameDuration,
      });

      // Update user stats
      const user = await User.findById(req.user.id);
      user.gamesPlayed += 1;
      
      // Check if this is a new high score
      const isNewHighScore = score > user.highestScore;
      
      if (isNewHighScore) {
        user.highestScore = score;
      }
      
      await user.save();

      res.status(201).json({
        success: true,
        message: 'Score submitted successfully',
        data: {
          ...scoreEntry.toObject(),
          isNewHighScore,
          currentHighScore: user.highestScore,
        },
      });
    } catch (error) {
      console.error('Submit score error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while submitting score',
        error: error.message,
      });
    }
  }
);

// @route   GET /api/scores/leaderboard
// @desc    Get top scores (leaderboard) - ONE ENTRY PER USER (HIGHEST SCORE)
// @access  Public
router.get('/leaderboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    // Aggregate to get only the highest score per user
    const leaderboard = await Score.aggregate([
      {
        $sort: { score: -1, createdAt: -1 }
      },
      {
        $group: {
          _id: '$user',
          username: { $first: '$username' },
          score: { $max: '$score' },
          bananasCollected: { $first: '$bananasCollected' },
          gameLevel: { $first: '$gameLevel' },
          gameDuration: { $first: '$gameDuration' },
          createdAt: { $first: '$createdAt' }
        }
      },
      {
        $sort: { score: -1, createdAt: -1 }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      },
      {
        $project: {
          _id: 1,
          username: 1,
          score: 1,
          bananasCollected: 1,
          gameLevel: 1,
          gameDuration: 1,
          createdAt: 1
        }
      }
    ]);

    // Get total unique users count
    const totalUsers = await Score.distinct('user');
    const total = totalUsers.length;

    res.json({
      success: true,
      data: {
        scores: leaderboard,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          limit,
        },
      },
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching leaderboard',
      error: error.message,
    });
  }
});

// @route   GET /api/scores/user/:userId
// @desc    Get user's score history
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const scores = await Score.find({ user: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('score bananasCollected gameLevel gameDuration createdAt');

    res.json({
      success: true,
      data: scores,
    });
  } catch (error) {
    console.error('Get user scores error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user scores',
      error: error.message,
    });
  }
});

// @route   GET /api/scores/top-players
// @desc    Get top players by highest score
// @access  Public
router.get('/top-players', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const topPlayers = await User.find()
      .sort({ highestScore: -1 })
      .limit(limit)
      .select('username highestScore gamesPlayed');

    res.json({
      success: true,
      data: topPlayers,
    });
  } catch (error) {
    console.error('Get top players error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching top players',
      error: error.message,
    });
  }
});

module.exports = router;