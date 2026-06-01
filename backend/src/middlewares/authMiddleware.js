import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes - Verify JWT access token
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Decode token
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

      // Get user from database (excluding password) and attach to request
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        res.status(401);
        return next(new Error('Not authorized, user not found'));
      }

      if (!req.user.isActive) {
        res.status(403);
        return next(new Error('User account is deactivated'));
      }

      next();
    } catch (error) {
      console.error('JWT verification error:', error.message);
      res.status(401);
      next(new Error('Not authorized, token failed'));
    }
  } else {
    res.status(401);
    next(new Error('Not authorized, no token provided'));
  }
};

// Authorize roles - RBAC check
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      return next(
        new Error(`Role (${req.user ? req.user.role : 'Guest'}) is not authorized to access this resource`)
      );
    }
    next();
  };
};
