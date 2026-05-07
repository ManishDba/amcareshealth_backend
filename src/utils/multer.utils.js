const multer = require("multer");
const path = require("path");
const fs = require("fs");

/**
 * Multer File Upload Configuration
 *
 * Handles file uploads for user profile photos.
 * Files are stored in the "uploads/photos/" directory.
 * Only image files (jpeg, jpg, png, gif) are accepted.
 * Max file size: 5MB
 */

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, "../../uploads/photos");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage: where and how files are saved
const storage = multer.diskStorage({
  // Set the destination folder for uploads
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  // Generate a unique filename: userId_timestamp.extension
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `photo_${uniqueSuffix}${ext}`);
  },
});

// Filter: Only allow image file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extName = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimeType = allowedTypes.test(file.mimetype);

  if (extName && mimeType) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpeg, jpg, png, gif) are allowed!"), false);
  }
};

// Create the multer upload instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});

module.exports = upload;
