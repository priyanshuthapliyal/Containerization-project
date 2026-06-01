import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import {
  generateAccessToken,
  generateRefreshToken,
  sendRefreshTokenCookie,
} from '../utils/generateTokens.js';

// @desc    Auth user & get token
// @route   POST /api/v1/auth/login
// @access  Public
export const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    return next(new Error('Please provide email and password'));
  }

  try {
    // Find user by email
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      if (!user.isActive) {
        res.status(403);
        return next(new Error('User account is deactivated'));
      }

      // Generate JWT tokens
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      // Save refresh token in HttpOnly cookie
      sendRefreshTokenCookie(res, refreshToken);

      res.status(200).json({
        success: true,
        accessToken,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isPasswordReset: user.isPasswordReset,
        },
      });
    } else {
      res.status(401);
      next(new Error('Invalid email or password'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Log user out / clear cookie
// @route   POST /api/v1/auth/logout
// @access  Private
export const logout = async (req, res, next) => {
  try {
    res.cookie('refreshToken', '', {
      httpOnly: true,
      expires: new Date(0),
      sameSite: 'strict',
    });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh access token
// @route   POST /api/v1/auth/refresh
// @access  Public
export const refresh = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    res.status(401);
    return next(new Error('No refresh token provided'));
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      res.status(401);
      return next(new Error('User not found or deactivated'));
    }

    const newAccessToken = generateAccessToken(user);
    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    res.status(401);
    next(new Error('Refresh token is invalid or expired'));
  }
};

// @desc    Reset password (change password)
// @route   PUT /api/v1/auth/reset-password
// @access  Private
export const resetPassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    return next(new Error('Please provide current and new passwords'));
  }

  if (newPassword.length < 6) {
    res.status(400);
    return next(new Error('New password must be at least 6 characters'));
  }

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      res.status(401);
      return next(new Error('Current password is incorrect'));
    }

    // Update password and flag
    user.password = newPassword;
    user.isPasswordReset = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    next(error);
  }
};
