const express = require("express");
const router = express.Router();

// --- Controllers ---
const usersController = require("../controllers/users.controller");

const { cloudinaryService } = require("../services/cloudinary.service");
const upload = require("../utils/multer.utils");

// ============================================================
// PUBLIC ROUTES (No authentication required)
// ============================================================

// Health check / Welcome route
router.get("/", usersController.welcome);

router.post("/sign-up", upload.single("photo"), usersController.signup);

// Get Cloudinary upload signature
router.get("/cloudinary-signature", (req, res) => {
  const signatureData = cloudinaryService.generateUploadSignature();
  res.json({ success: true, ...signatureData });
});

// Login with phone number and password
router.post("/sign-in", usersController.signin);

module.exports = router;