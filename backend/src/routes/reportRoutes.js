import express from 'express';
import {
  getDashboardStats,
  getDepartmentStats,
  exportPlacedStudents,
} from '../controllers/reportController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/dashboard-stats', protect, authorize('po', 'admin'), getDashboardStats);
router.get('/department-stats', protect, authorize('po', 'admin'), getDepartmentStats);
router.get('/export-placed', protect, authorize('po', 'admin'), exportPlacedStudents);

export default router;
