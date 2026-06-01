import Company from '../models/Company.js';

// @desc    Create a company
// @route   POST /api/v1/companies
// @access  Private/PO, Admin
export const createCompany = async (req, res, next) => {
  const { name, website, description, contactPerson, logoUrl } = req.body;

  if (!name) {
    res.status(400);
    return next(new Error('Company name is required'));
  }

  try {
    const exists = await Company.findOne({ name });
    if (exists) {
      res.status(400);
      return next(new Error('Company with this name already exists'));
    }

    const company = await Company.create({
      name,
      website,
      description,
      contactPerson,
      logoUrl,
    });

    res.status(201).json({
      success: true,
      data: company,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all companies
// @route   GET /api/v1/companies
// @access  Private
export const getCompanies = async (req, res, next) => {
  try {
    const companies = await Company.find({}).sort({ name: 1 });
    res.status(200).json({
      success: true,
      count: companies.length,
      data: companies,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get company by ID
// @route   GET /api/v1/companies/:id
// @access  Private
export const getCompanyById = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      res.status(404);
      return next(new Error('Company not found'));
    }
    res.status(200).json({
      success: true,
      data: company,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update company profile
// @route   PUT /api/v1/companies/:id
// @access  Private/PO, Admin
export const updateCompany = async (req, res, next) => {
  const { name, website, description, contactPerson, logoUrl } = req.body;

  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      res.status(404);
      return next(new Error('Company not found'));
    }

    if (name) company.name = name;
    if (website) company.website = website;
    if (description) company.description = description;
    if (logoUrl !== undefined) company.logoUrl = logoUrl;
    if (contactPerson) {
      company.contactPerson = {
        ...company.contactPerson.toObject(),
        ...contactPerson,
      };
    }

    const updatedCompany = await company.save();
    res.status(200).json({
      success: true,
      data: updatedCompany,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete company
// @route   DELETE /api/v1/companies/:id
// @access  Private/PO, Admin
export const deleteCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      res.status(404);
      return next(new Error('Company not found'));
    }

    await company.deleteOne();
    res.status(200).json({
      success: true,
      message: 'Company removed successfully',
    });
  } catch (error) {
    next(error);
  }
};
