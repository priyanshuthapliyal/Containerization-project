import Application from '../models/Application.js';
import Job from '../models/Job.js';
import StudentProfile from '../models/StudentProfile.js';
import User from '../models/User.js';
import archiver from 'archiver';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Apply for a job
// @route   POST /api/v1/applications/apply
// @access  Private/Student
export const applyForJob = async (req, res, next) => {
  const { jobId } = req.body;

  if (!jobId) {
    res.status(400);
    return next(new Error('Job ID is required'));
  }

  try {
    // 1. Check if job exists and is open
    const job = await Job.findById(jobId);
    if (!job) {
      res.status(404);
      return next(new Error('Job posting not found'));
    }

    if (job.status !== 'open') {
      res.status(400);
      return next(new Error(`This job posting is currently ${job.status}`));
    }

    // 2. Check if deadline has passed
    if (new Date() > new Date(job.deadline)) {
      res.status(400);
      return next(new Error('The application deadline for this job has passed'));
    }

    // 3. Check if already applied
    const alreadyApplied = await Application.findOne({ jobId, studentId: req.user._id });
    if (alreadyApplied) {
      res.status(400);
      return next(new Error('You have already applied for this job'));
    }

    // 4. Retrieve student profile
    const studentProfile = await StudentProfile.findOne({ userId: req.user._id });
    if (!studentProfile) {
      res.status(404);
      return next(new Error('Student profile not found. Please contact administration'));
    }

    // 5. Ensure resume is uploaded
    if (!studentProfile.resumeUrl) {
      res.status(400);
      return next(new Error('Please upload your resume in your profile before applying'));
    }

    // 6. Run eligibility calculations
    const reasons = [];
    if (studentProfile.cgpa < job.eligibility.minCgpa) {
      reasons.push(`Requires minimum CGPA of ${job.eligibility.minCgpa}`);
    }
    if (studentProfile.backlogs > job.eligibility.maxBacklogs) {
      reasons.push(`Requires maximum backlogs of ${job.eligibility.maxBacklogs}`);
    }
    if (job.eligibility.eligibleDepartments && job.eligibility.eligibleDepartments.length > 0) {
      const isDeptEligible = job.eligibility.eligibleDepartments.includes(studentProfile.departmentId);
      if (!isDeptEligible) {
        reasons.push('Your department is not eligible for this job');
      }
    }

    if (reasons.length > 0) {
      res.status(400);
      return next(new Error(`You are not eligible to apply: ${reasons.join(', ')}`));
    }

    // 7. Create application and snapshot current resumeUrl
    const application = await Application.create({
      jobId,
      studentId: req.user._id,
      resumeUrlSnapshot: studentProfile.resumeUrl,
      status: 'applied',
    });

    res.status(201).json({
      success: true,
      message: 'Successfully applied for the job',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in student's applications
// @route   GET /api/v1/applications/my-applications
// @access  Private/Student
export const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ studentId: req.user._id })
      .populate({
        path: 'jobId',
        populate: { path: 'companyId', select: 'name logoUrl website' },
      })
      .sort({ appliedAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applicants for a specific job (PO & Admin only)
// @route   GET /api/v1/applications/job/:jobId
// @access  Private/PO, Admin
export const getJobApplicants = async (req, res, next) => {
  const { jobId } = req.params;

  try {
    const job = await Job.findById(jobId).populate('companyId', 'name');
    if (!job) {
      res.status(404);
      return next(new Error('Job not found'));
    }

    const applications = await Application.find({ jobId })
      .populate('studentId', 'name email')
      .sort({ appliedAt: -1 });

    // For each application, fetch student profile info (roll number, department, cgpa, backlogs)
    const detailedApplicants = await Promise.all(
      applications.map(async (app) => {
        const appObj = app.toObject();
        const profile = await StudentProfile.findOne({ userId: app.studentId._id })
          .populate('departmentId', 'name code');
        appObj.studentProfile = profile;
        return appObj;
      })
    );

    res.status(200).json({
      success: true,
      job,
      count: detailedApplicants.length,
      data: detailedApplicants,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status (PO & Admin only)
// @route   PUT /api/v1/applications/:id/status
// @access  Private/PO, Admin
export const updateApplicationStatus = async (req, res, next) => {
  const { status, remarks } = req.body;

  if (!status) {
    res.status(400);
    return next(new Error('Status is required'));
  }

  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      res.status(404);
      return next(new Error('Application not found'));
    }

    // Update status and append to history log
    application.status = status;
    application.statusHistory.push({
      status,
      changedBy: req.user._id,
      remarks: remarks || `Status updated to ${status}`,
    });

    await application.save();

    // Lock Placement Status if candidate is Selected
    if (status === 'selected') {
      const studentProfile = await StudentProfile.findOne({ userId: application.studentId });
      if (studentProfile) {
        studentProfile.placementStatus = 'placed';
        
        // Fetch Job to find Company ID
        const job = await Job.findById(application.jobId);
        if (job) {
          studentProfile.placedCompanyId = job.companyId;
        }
        await studentProfile.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Application status updated successfully',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download all resumes for a job as ZIP (PO & Admin only)
// @route   GET /api/v1/applications/:jobId/download-resumes
// @access  Private/PO, Admin
export const downloadResumes = async (req, res, next) => {
  const { jobId } = req.params;

  try {
    const job = await Job.findById(jobId).populate('companyId', 'name');
    if (!job) {
      res.status(404);
      return next(new Error('Job not found'));
    }

    const applications = await Application.find({ jobId }).populate('studentId', 'name');
    
    // Filter out applications without a resume snapshot
    const validApplications = applications.filter(app => app.resumeUrlSnapshot);

    if (validApplications.length === 0) {
      res.status(400);
      return next(new Error('No applicant resumes found to download'));
    }

    // Set up zip headers
    res.attachment(`${job.title.replace(/\s+/g, '_')}_Resumes.zip`);

    const archive = archiver('zip', {
      zlib: { level: 9 }, // Maximum compression level
    });

    archive.on('error', (err) => {
      throw err;
    });

    // Pipe archive data to response stream
    archive.pipe(res);

    // Add each file to the archive
    validApplications.forEach((app) => {
      // resumeUrlSnapshot matches '/uploads/resume-xxxx-xxxx.pdf'
      const relativePath = app.resumeUrlSnapshot.replace(/^\//, ''); // strip leading slash
      const absolutePath = path.join(__dirname, '../../..', relativePath);
      
      if (fs.existsSync(absolutePath)) {
        // Name inside zip: StudentName_Resume.pdf
        const cleanName = app.studentId.name.replace(/\s+/g, '_');
        archive.file(absolutePath, { name: `${cleanName}_Resume.pdf` });
      }
    });

    await archive.finalize();
  } catch (error) {
    next(error);
  }
};
