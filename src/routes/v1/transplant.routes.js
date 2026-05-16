const express = require("express");
const router = express.Router();
const transplantController = require("../../controllers/transplant.controller");
const authMiddleware = require("../../middleware/auth.middleware");

// All transplant routes are protected
router.use(authMiddleware);

// POST /api/v1/transplant/register
router.post("/register", transplantController.registerTransplant);

// GET /api/v1/transplant/my-registrations
router.get("/my-registrations", transplantController.getMyRegistrations);

module.exports = router;
