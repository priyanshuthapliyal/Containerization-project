import Department from '../models/Department.js';

// @desc    Create a new department
// @route   POST /api/v1/departments
// @access  Private/Admin
export const createDepartment = async (req, res, next) => {
  const { name, code, headOfDept } = req.body;

  if (!name || !code) {
    res.status(400);
    return next(new Error('Department name and code are required'));
  }

  try {
    const exists = await Department.findOne({ $or: [{ name }, { code: code.toUpperCase() }] });
    if (exists) {
      res.status(400);
      return next(new Error('Department with this name or code already exists'));
    }

    const dept = await Department.create({
      name,
      code: code.toUpperCase(),
      headOfDept,
    });

    res.status(201).json({
      success: true,
      data: dept,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all departments
// @route   GET /api/v1/departments
// @access  Private (Authenticated)
export const getDepartments = async (req, res, next) => {
  try {
    const depts = await Department.find({}).sort({ name: 1 });
    res.status(200).json({
      success: true,
      count: depts.length,
      data: depts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single department
// @route   GET /api/v1/departments/:id
// @access  Private (Authenticated)
export const getDepartmentById = async (req, res, next) => {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept) {
      res.status(404);
      return next(new Error('Department not found'));
    }
    res.status(200).json({
      success: true,
      data: dept,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a department
// @route   PUT /api/v1/departments/:id
// @access  Private/Admin
export const updateDepartment = async (req, res, next) => {
  const { name, code, headOfDept } = req.body;

  try {
    const dept = await Department.findById(req.params.id);
    if (!dept) {
      res.status(404);
      return next(new Error('Department not found'));
    }

    if (name) dept.name = name;
    if (code) dept.code = code.toUpperCase();
    if (headOfDept !== undefined) dept.headOfDept = headOfDept;

    const updatedDept = await dept.save();
    res.status(200).json({
      success: true,
      data: updatedDept,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a department
// @route   DELETE /api/v1/departments/:id
// @access  Private/Admin
export const deleteDepartment = async (req, res, next) => {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept) {
      res.status(404);
      return next(new Error('Department not found'));
    }

    await dept.deleteOne();
    res.status(200).json({
      success: true,
      message: 'Department removed successfully',
    });
  } catch (error) {
    next(error);
  }
};
