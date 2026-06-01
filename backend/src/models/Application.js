import mongoose from 'mongoose';

const applicationHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['applied', 'shortlisted', 'interviewing', 'selected', 'rejected'],
    required: true,
  },
  changedAt: {
    type: Date,
    default: Date.now,
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  remarks: {
    type: String,
    default: '',
  },
});

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job reference is required'],
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student reference is required'],
    },
    resumeUrlSnapshot: {
      type: String,
      required: [true, 'Resume snapshot is required to freeze candidate history'],
    },
    status: {
      type: String,
      enum: ['applied', 'shortlisted', 'interviewing', 'selected', 'rejected'],
      default: 'applied',
    },
    statusHistory: [applicationHistorySchema],
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save validation: Automatically add history on status initialization
applicationSchema.pre('save', function (next) {
  if (this.isNew && this.statusHistory.length === 0) {
    this.statusHistory.push({
      status: this.status,
      changedBy: this.studentId, // Initially applied by the student
      remarks: 'Application submitted',
    });
  }
  next();
});

const Application = mongoose.model('Application', applicationSchema);
export default Application;
