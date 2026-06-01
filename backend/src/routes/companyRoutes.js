import express from 'express';
import {
  createCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
} from '../controllers/companyController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .post(protect, authorize('po', 'admin'), createCompany)
  .get(protect, getCompanies);

router
  .route('/:id')
  .get(protect, getCompanyById)
  .put(protect, authorize('po', 'admin'), updateCompany)
  .delete(protect, authorize('po', 'admin'), deleteCompany);

export default router;
