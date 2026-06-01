import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import Department from '../models/Department.js';

// @desc    Get all users (Admin only)
// @route   GET /api/v1/users
// @access  Private/Admin
export const getUsers = async (req, res, next) => {
  try {
    const { role, active } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (active) filter.isActive = active === 'true';

    // Find users
    const users = await User.find(filter).select('-password').sort({ name: 1 });
    
    // If we're looking at students, populate their profiles
    const usersWithProfiles = await Promise.all(
      users.map(async (user) => {
        const userObj = user.toObject();
        if (user.role === 'student') {
          const profile = await StudentProfile.findOne({ userId: user._id })
            .populate('departmentId', 'name code');
          userObj.profile = profile;
        }
        return userObj;
      })
    );

    res.status(200).json({
      success: true,
      count: usersWithProfiles.length,
      data: usersWithProfiles,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new user (Admin only)
// @route   POST /api/v1/users
// @access  Private/Admin
export const createUser = async (req, res, next) => {
  const { name, email, password, role, ...profileData } = req.body;

  if (!name || !email || !password || !role) {
    res.status(400);
    return next(new Error('Name, email, password, and role are required'));
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      return next(new Error('User already exists with this email'));
    }

    // If role is student, validate student profile specific fields first
    if (role === 'student') {
      const { rollNumber, departmentId, graduationYear, cgpa, backlogs } = profileData;
      if (!rollNumber || !departmentId || !graduationYear || cgpa === undefined) {
        res.status(400);
        return next(new Error('Roll number, department, graduation year, and CGPA are required for students'));
      }

      // Check if roll number already exists
      const rollExists = await StudentProfile.findOne({ rollNumber: rollNumber.toUpperCase() });
      if (rollExists) {
        res.status(400);
        return next(new Error('Student profile already exists with this roll number'));
      }

      // Verify department exists
      const dept = await Department.findById(departmentId);
      if (!dept) {
        res.status(404);
        return next(new Error('Department not found'));
      }
    }

    // Create user (triggers pre-save password hash)
    const user = await User.create({
      name,
      email,
      password,
      role,
      isPasswordReset: false,
    });

    let profile = null;

    if (role === 'student') {
      try {
        profile = await StudentProfile.create({
          userId: user._id,
          rollNumber: profileData.rollNumber.toUpperCase(),
          departmentId: profileData.departmentId,
          graduationYear: profileData.graduationYear,
          cgpa: profileData.cgpa,
          backlogs: profileData.backlogs || 0,
        });
      } catch (err) {
        // Rollback user creation if profile creation fails
        await User.findByIdAndDelete(user._id);
        throw err;
      }
    }

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user credentials and student parameters (Admin only)
// @route   PUT /api/v1/users/:id
// @access  Private/Admin
export const updateUser = async (req, res, next) => {
  const { name, email, isActive, profileData } = req.body;

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    let profile = null;

    if (user.role === 'student' && profileData) {
      profile = await StudentProfile.findOne({ userId: user._id });
      if (profile) {
        if (profileData.rollNumber) profile.rollNumber = profileData.rollNumber.toUpperCase();
        if (profileData.departmentId) {
          const dept = await Department.findById(profileData.departmentId);
          if (!dept) {
            res.status(404);
            return next(new Error('Department not found'));
          }
          profile.departmentId = profileData.departmentId;
        }
        if (profileData.graduationYear) profile.graduationYear = profileData.graduationYear;
        if (profileData.cgpa !== undefined) profile.cgpa = profileData.cgpa;
        if (profileData.backlogs !== undefined) profile.backlogs = profileData.backlogs;
        if (profileData.placementStatus) profile.placementStatus = profileData.placementStatus;

        await profile.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in student profile
// @route   GET /api/v1/users/profile
// @access  Private (Student, PO, Admin)
export const getStudentProfile = async (req, res, next) => {
  const targetUserId = req.user.role === 'student' ? req.user._id : req.query.studentId;

  if (!targetUserId) {
    res.status(400);
    return next(new Error('Please provide studentId parameter'));
  }

  try {
    const user = await User.findById(targetUserId).select('-password');
    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    if (user.role !== 'student') {
      res.status(400);
      return next(new Error('Target user is not a student'));
    }

    const profile = await StudentProfile.findOne({ userId: targetUserId })
      .populate('departmentId', 'name code')
      .populate('placedCompanyId', 'name website');

    res.status(200).json({
      success: true,
      data: {
        user,
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student-owned profile properties (skills only)
// @route   PUT /api/v1/users/profile
// @access  Private/Student
export const updateStudentProfileSelf = async (req, res, next) => {
  const { skills } = req.body;

  try {
    const profile = await StudentProfile.findOne({ userId: req.user._id });
    if (!profile) {
      res.status(404);
      return next(new Error('Student profile not found'));
    }

    if (skills) {
      profile.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
    }

    const updatedProfile = await profile.save();

    res.status(200).json({
      success: true,
      data: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload student resume
// @route   POST /api/v1/users/profile/resume
// @access  Private/Student
export const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      return next(new Error('Please upload a PDF file'));
    }

    const profile = await StudentProfile.findOne({ userId: req.user._id });
    if (!profile) {
      res.status(404);
      return next(new Error('Student profile not found'));
    }

    profile.resumeUrl = `/uploads/${req.file.filename}`;
    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully',
      resumeUrl: profile.resumeUrl,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk import students from CSV (Admin only)
// @route   POST /api/v1/users/bulk-import
// @access  Private/Admin
export const bulkImportStudents = async (req, res, next) => {
  const { csvData } = req.body;

  if (!csvData) {
    res.status(400);
    return next(new Error('CSV data is required'));
  }

  try {
    const lines = csvData.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    if (lines.length <= 1) {
      res.status(400);
      return next(new Error('CSV contains no data rows'));
    }

    const results = {
      total: lines.length - 1,
      imported: 0,
      failed: 0,
      errors: [],
    };

    const departments = await Department.find({});
    const deptMap = {};
    departments.forEach(d => {
      deptMap[d.code.toUpperCase()] = d._id;
    });

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',').map(val => val.trim());
      if (row.length < 7) {
        results.failed++;
        results.errors.push(`Line ${i + 1}: Insufficient columns (expected at least 7 fields)`);
        continue;
      }

      const [rollNumber, name, email, password, departmentCode, graduationYearStr, cgpaStr, backlogsStr] = row;

      try {
        if (!rollNumber || !name || !email || !password || !departmentCode || !graduationYearStr || !cgpaStr) {
          throw new Error('Required fields are missing');
        }

        const deptId = deptMap[departmentCode.toUpperCase()];
        if (!deptId) {
          throw new Error(`Department code '${departmentCode}' not found`);
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
          throw new Error(`User with email '${email}' already exists`);
        }

        const rollExists = await StudentProfile.findOne({ rollNumber: rollNumber.toUpperCase() });
        if (rollExists) {
          throw new Error(`Roll number '${rollNumber}' already exists`);
        }

        const cgpa = parseFloat(cgpaStr);
        const graduationYear = parseInt(graduationYearStr, 10);
        const backlogs = backlogsStr ? parseInt(backlogsStr, 10) : 0;

        if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
          throw new Error(`Invalid CGPA: ${cgpaStr}`);
        }
        if (isNaN(graduationYear)) {
          throw new Error(`Invalid Graduation Year: ${graduationYearStr}`);
        }

        const user = await User.create({
          name,
          email,
          password,
          role: 'student',
          isPasswordReset: false,
        });

        await StudentProfile.create({
          userId: user._id,
          rollNumber: rollNumber.toUpperCase(),
          departmentId: deptId,
          graduationYear,
          cgpa,
          backlogs,
        });

        results.imported++;
      } catch (err) {
        results.failed++;
        results.errors.push(`Line ${i + 1} (${name || 'Row'}): ${err.message}`);
      }
    }

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};
