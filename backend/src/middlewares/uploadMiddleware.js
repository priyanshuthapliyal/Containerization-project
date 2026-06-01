import multer from 'multer';
import path from 'path';

// Configure disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Save file as student_id-timestamp.pdf
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const userId = req.user ? req.user._id : 'anonymous';
    cb(null, `resume-${userId}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// File filter (PDF only)
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF documents are allowed for resume uploads'), false);
  }
};

// Multer upload config
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB max size
  },
});

export default upload;
