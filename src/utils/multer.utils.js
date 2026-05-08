const multer = require("multer");
const path = require("path");

/**
 * Multer File Upload Configuration (Memory Storage)
 * 
 * This configuration uses memory storage to store files as Buffers
 * in memory, which are then uploaded directly to Cloudinary.
 * No files are stored locally.
 */

// Configure memory storage
const storage = multer.memoryStorage();

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
