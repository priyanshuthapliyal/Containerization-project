import express from 'express';
import {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
} from '../controllers/jobController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .post(protect, authorize('po', 'admin'), createJob)
  .get(protect, getJobs);

router
  .route('/:id')
  .get(protect, getJobById)
  .put(protect, authorize('po', 'admin'), updateJob)
  .delete(protect, authorize('po', 'admin'), deleteJob);

export default router;
