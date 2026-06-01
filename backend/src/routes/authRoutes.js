import express from 'express';
import {
  login,
  logout,
  refresh,
  resetPassword,
} from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/logout', protect, logout);
router.post('/refresh', refresh);
router.put('/reset-password', protect, resetPassword);

export default router;
