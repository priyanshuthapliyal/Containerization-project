import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import Company from '../models/Company.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Department from '../models/Department.js';

// @desc    Get dashboard metrics summary (PO & Admin only)
// @route   GET /api/v1/reports/dashboard-stats
// @access  Private/PO, Admin
export const getDashboardStats = async (req, res, next) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const placedStudents = await StudentProfile.countDocuments({ placementStatus: 'placed' });
    const totalCompanies = await Company.countDocuments();
    const activeJobs = await Job.countDocuments({ status: 'open' });
    const totalApplications = await Application.countDocuments();

    const placementPercentage = totalStudents > 0 
      ? Math.round((placedStudents / totalStudents) * 100 * 100) / 100 
      : 0;

    // Fetch highest package offered
    const highestPackageJob = await Job.findOne({ status: 'open' }).sort({ packageLPA: -1 }).limit(1);
    const highestPackage = highestPackageJob ? highestPackageJob.packageLPA : 0;

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        placedStudents,
        placementPercentage,
        totalCompanies,
        activeJobs,
        totalApplications,
        highestPackage,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get placement statistics grouped by department (PO & Admin only)
// @route   GET /api/v1/reports/department-stats
// @access  Private/PO, Admin
export const getDepartmentStats = async (req, res, next) => {
  try {
    const departments = await Department.find({});
    
    const stats = await Promise.all(
      departments.map(async (dept) => {
        const total = await StudentProfile.countDocuments({ departmentId: dept._id });
        const placed = await StudentProfile.countDocuments({
          departmentId: dept._id,
          placementStatus: 'placed',
        });
        
        const rate = total > 0 ? Math.round((placed / total) * 100 * 100) / 100 : 0;
        
        return {
          departmentId: dept._id,
          name: dept.name,
          code: dept.code,
          totalStudents: total,
          placedStudents: placed,
          placementRate: rate,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export placed students as CSV (PO & Admin only)
// @route   GET /api/v1/reports/export-placed
// @access  Private/PO, Admin
export const exportPlacedStudents = async (req, res, next) => {
  try {
    // Find all placed student profiles
    const profiles = await StudentProfile.find({ placementStatus: 'placed' })
      .populate('userId', 'name email')
      .populate('departmentId', 'name code')
      .populate('placedCompanyId', 'name');

    // Build CSV content
    let csv = 'Roll Number,Student Name,Email,Department,Placed Company,Package (LPA)\n';

    profiles.forEach((profile) => {
      const roll = profile.rollNumber;
      const name = profile.userId?.name || 'N/A';
      const email = profile.userId?.email || 'N/A';
      const dept = profile.departmentId?.code || 'N/A';
      const company = profile.placedCompanyId?.name || 'N/A';
      
      csv += `"${roll}","${name}","${email}","${dept}","${company}"\n`;
    });

    res.header('Content-Type', 'text/csv');
    res.attachment('Placed_Students_Report.csv');
    return res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};
