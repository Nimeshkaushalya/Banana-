const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
      default: 0,
    },
    bananasCollected: {
      type: Number,
      default: 0,
    },
    livesUsed: {
      type: Number,
      default: 0,
    },
    gameLevel: {
      type: Number,
      default: 1,
    },
    gameDuration: {
      type: Number, // in seconds
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster leaderboard queries
scoreSchema.index({ score: -1, createdAt: -1 });

module.exports = mongoose.model('Score', scoreSchema);