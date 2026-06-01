import express from 'express';
import {
  getUsers,
  createUser,
  updateUser,
  getStudentProfile,
  updateStudentProfileSelf,
  uploadResume,
  bulkImportStudents,
} from '../controllers/userController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.post(
  '/bulk-import',
  protect,
  authorize('admin'),
  bulkImportStudents
);

// Profile paths (placed first to avoid collision with :id param)
router
  .route('/profile')
  .get(protect, getStudentProfile)
  .put(protect, authorize('student'), updateStudentProfileSelf);

router.post(
  '/profile/resume',
  protect,
  authorize('student'),
  upload.single('resume'),
  uploadResume
);

// Administrative pathways
router
  .route('/')
  .get(protect, authorize('admin'), getUsers)
  .post(protect, authorize('admin'), createUser);

router
  .route('/:id')
  .put(protect, authorize('admin'), updateUser);

export default router;
