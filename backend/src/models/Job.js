import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company reference is required'],
    },
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    packageLPA: {
      type: Number,
      required: [true, 'Package in LPA is required'],
      min: [0, 'Package cannot be negative'],
    },
    location: {
      type: String,
      required: [true, 'Job location is required'],
      trim: true,
    },
    eligibility: {
      minCgpa: {
        type: Number,
        default: 0,
        min: 0,
        max: 10,
      },
      maxBacklogs: {
        type: Number,
        default: 0,
        min: 0,
      },
      eligibleDepartments: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Department',
        },
      ],
    },
    deadline: {
      type: Date,
      required: [true, 'Application deadline is required'],
    },
    status: {
      type: String,
      enum: ['open', 'closed', 'archived'],
      default: 'open',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator reference is required'],
    },
  },
  {
    timestamps: true,
  }
);

const Job = mongoose.model('Job', jobSchema);
export default Job;
