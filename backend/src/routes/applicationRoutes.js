import express from 'express';
import {
  applyForJob,
  getMyApplications,
  getJobApplicants,
  updateApplicationStatus,
  downloadResumes,
} from '../controllers/applicationController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/apply', protect, authorize('student'), applyForJob);
router.get('/my-applications', protect, authorize('student'), getMyApplications);
router.get('/job/:jobId', protect, authorize('po', 'admin'), getJobApplicants);
router.put('/:id/status', protect, authorize('po', 'admin'), updateApplicationStatus);
router.get('/:jobId/download-resumes', protect, authorize('po', 'admin'), downloadResumes);

export default router;
