const express = require("express");
const router = express.Router();

const usersController = require("../../controllers/users.controller");
const authMiddleware = require("../../middleware/auth.middleware");
const upload = require("../../utils/multer.utils");

// ============================================================
// USER/PROFILE ROUTES — /api/v1/users
// All routes require authentication
// ============================================================

router.use(authMiddleware);

// Get authenticated user's profile
router.get("/profile", authMiddleware, usersController.getProfile);

// Update profile
router.put("/profile", authMiddleware, upload.single("photo"), usersController.updateProfile);

module.exports = router;
