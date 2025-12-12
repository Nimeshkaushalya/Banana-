const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // [SESSION VALIDATION]
      // Verify token
      // We check if the token is valid and hasn't expired.
      // If valid, we decode it to get the user ID.
      // This is how we "resume" the session on the server side  // [EXPLAIN: VIRTUAL IDENTITY - VERIFICATION]
      // This middleware checks every protected request for a valid JWT.
      // It verifies the digital signature to ensure the user is who they claim to be.
      // Verify token
      // We check if the token is valid and hasn't expired.
      // If valid, we decode it to get the user ID.
      // This is how we "resume" the session on the server side for this request.
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    });
  }
};

module.exports = { protect };