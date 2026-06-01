import Job from '../models/Job.js';
import StudentProfile from '../models/StudentProfile.js';
import Company from '../models/Company.js';

// Helper function to check student eligibility for a job
const checkEligibility = (studentProfile, job) => {
  const reasons = [];
  
  if (studentProfile.cgpa < job.eligibility.minCgpa) {
    reasons.push(`Minimum CGPA required is ${job.eligibility.minCgpa} (Your CGPA: ${studentProfile.cgpa})`);
  }

  if (studentProfile.backlogs > job.eligibility.maxBacklogs) {
    reasons.push(`Maximum allowed backlogs is ${job.eligibility.maxBacklogs} (Your backlogs: ${studentProfile.backlogs})`);
  }

  if (job.eligibility.eligibleDepartments && job.eligibility.eligibleDepartments.length > 0) {
    const isDeptEligible = job.eligibility.eligibleDepartments.some(
      (deptId) => deptId.toString() === studentProfile.departmentId.toString()
    );
    if (!isDeptEligible) {
      reasons.push('Your department is not eligible for this job posting');
    }
  }

  const isDeadlinePassed = new Date() > new Date(job.deadline);
  if (isDeadlinePassed) {
    reasons.push('The registration deadline for this job has passed');
  }

  return {
    isEligible: reasons.length === 0,
    reasons,
  };
};

// @desc    Create a job posting
// @route   POST /api/v1/jobs
// @access  Private/PO, Admin
export const createJob = async (req, res, next) => {
  const { companyId, title, description, packageLPA, location, eligibility, deadline } = req.body;

  if (!companyId || !title || !description || packageLPA === undefined || !location || !deadline) {
    res.status(400);
    return next(new Error('Company ID, title, description, package, location, and deadline are required'));
  }

  try {
    // Validate company exists
    const company = await Company.findById(companyId);
    if (!company) {
      res.status(404);
      return next(new Error('Company not found'));
    }

    const job = await Job.create({
      companyId,
      title,
      description,
      packageLPA,
      location,
      eligibility: {
        minCgpa: eligibility?.minCgpa || 0,
        maxBacklogs: eligibility?.maxBacklogs || 0,
        eligibleDepartments: eligibility?.eligibleDepartments || [],
      },
      deadline: new Date(deadline),
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all jobs (with dynamic student eligibility)
// @route   GET /api/v1/jobs
// @access  Private (Authenticated)
export const getJobs = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const jobs = await Job.find(filter)
      .populate('companyId', 'name website logoUrl')
      .populate('eligibility.eligibleDepartments', 'name code')
      .sort({ createdAt: -1 });

    let result = jobs;

    // If student, calculate eligibility for each job
    if (req.user.role === 'student') {
      const studentProfile = await StudentProfile.findOne({ userId: req.user._id });
      if (studentProfile) {
        result = jobs.map((job) => {
          const { isEligible, reasons } = checkEligibility(studentProfile, job);
          return {
            ...job.toObject(),
            isEligible,
            ineligibilityReasons: reasons,
          };
        });
      }
    }

    res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get job by ID
// @route   GET /api/v1/jobs/:id
// @access  Private (Authenticated)
export const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('companyId', 'name website logoUrl description contactPerson')
      .populate('eligibility.eligibleDepartments', 'name code');

    if (!job) {
      res.status(404);
      return next(new Error('Job not found'));
    }

    let result = job.toObject();

    if (req.user.role === 'student') {
      const studentProfile = await StudentProfile.findOne({ userId: req.user._id });
      if (studentProfile) {
        const { isEligible, reasons } = checkEligibility(studentProfile, job);
        result.isEligible = isEligible;
        result.ineligibilityReasons = reasons;
      }
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a job posting
// @route   PUT /api/v1/jobs/:id
// @access  Private/PO, Admin
export const updateJob = async (req, res, next) => {
  const { title, description, packageLPA, location, eligibility, deadline, status } = req.body;

  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      res.status(404);
      return next(new Error('Job not found'));
    }

    if (title) job.title = title;
    if (description) job.description = description;
    if (packageLPA !== undefined) job.packageLPA = packageLPA;
    if (location) job.location = location;
    if (deadline) job.deadline = new Date(deadline);
    if (status) job.status = status;

    if (eligibility) {
      job.eligibility = {
        minCgpa: eligibility.minCgpa !== undefined ? eligibility.minCgpa : job.eligibility.minCgpa,
        maxBacklogs: eligibility.maxBacklogs !== undefined ? eligibility.maxBacklogs : job.eligibility.maxBacklogs,
        eligibleDepartments: eligibility.eligibleDepartments || job.eligibility.eligibleDepartments,
      };
    }

    const updatedJob = await job.save();
    res.status(200).json({
      success: true,
      data: updatedJob,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a job
// @route   DELETE /api/v1/jobs/:id
// @access  Private/PO, Admin
export const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      res.status(404);
      return next(new Error('Job not found'));
    }

    await job.deleteOne();
    res.status(200).json({
      success: true,
      message: 'Job listing deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
