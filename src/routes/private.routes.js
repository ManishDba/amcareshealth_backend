const express = require("express");
const router = express.Router();

// --- Middleware ---
const authMiddleware = require("../middleware/auth.middleware");

// --- Controllers ---
const usersController = require("../controllers/users.controller");
const upload = require("../utils/multer.utils");


// ============================================================
// PRIVATE ROUTES (JWT authentication required)
// All routes below require a valid Bearer token in the
// Authorization header.
// ============================================================

// Get authenticated user's profile
router.get("/profile", authMiddleware, usersController.getProfile);

router.put("/profile", authMiddleware, upload.single("photo"), usersController.updateProfile);

module.exports = router;