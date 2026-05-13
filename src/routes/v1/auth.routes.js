const express = require("express");
const router = express.Router();

const usersController = require("../../controllers/users.controller");
const { cloudinaryService } = require("../../services/cloudinary.service");
const upload = require("../../utils/multer.utils");
const { validate, schemas } = require("../../middleware/validate.middleware");
const { authRateLimit } = require("../../middleware/rateLimit.middleware");

// ============================================================
// AUTH ROUTES — /api/v1/auth
// ============================================================

// Health check
router.get("/health", usersController.welcome);

// Registration (rate-limited)
router.post(
  "/sign-up",
  authRateLimit,
  upload.single("photo"),
  validate(schemas.signup),
  usersController.signup
);

// Login (rate-limited)
router.post(
  "/sign-in",
  authRateLimit,
  validate(schemas.signin),
  usersController.signin
);

// Cloudinary upload signature (public)
router.get("/cloudinary-signature", (req, res) => {
  const signatureData = cloudinaryService.generateUploadSignature();
  res.json({ success: true, ...signatureData });
});

module.exports = router;
