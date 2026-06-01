import express from 'express';
import {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
} from '../controllers/departmentController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .post(protect, authorize('admin'), createDepartment)
  .get(protect, getDepartments);

router
  .route('/:id')
  .get(protect, getDepartmentById)
  .put(protect, authorize('admin'), updateDepartment)
  .delete(protect, authorize('admin'), deleteDepartment);

export default router;
