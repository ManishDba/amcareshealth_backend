const express = require("express");
const router = express.Router();

const usersController = require("../../controllers/users.controller");
const { sendRegistrationEmail } = require("../../services/email.service");
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

// Backwards-compatible alias: /register -> /sign-up
router.post(
  "/register",
  authRateLimit,
  upload.single("photo"),
  validate(schemas.signup),
  usersController.signup
);

// Quick test endpoint to send a registration email (JSON body: { name, email })
router.post("/test-email", async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) return res.status(400).json({ success: false, message: "name and email required" });
    const result = await sendRegistrationEmail({ name, email });
    return res.json({ success: true, result });
  } catch (err) {
    console.error('Test email error:', err);
    return res.status(500).json({ success: false, message: 'Failed to send test email', error: err.message });
  }
});

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
