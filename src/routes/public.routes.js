const express = require("express");
const router = express.Router();

// --- Controllers ---
const usersController = require("../controllers/users.controller");

// --- Multer (file upload) ---
const upload = require("../utils/multer.utils");

// ============================================================
// PUBLIC ROUTES (No authentication required)
// ============================================================

// Health check / Welcome route
router.get("/", usersController.welcome);

// Register a new user
// Accepts multipart/form-data with optional "photo" file field
router.post("/sign-up", upload.single("photo"), usersController.signup);

// Login with phone number and password
router.post("/sign-in", usersController.signin);

module.exports = router;