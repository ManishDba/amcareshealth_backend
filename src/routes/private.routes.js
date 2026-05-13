const express = require("express");
const router = express.Router();

// --- Middleware ---
const authMiddleware = require("../middleware/auth.middleware");

// --- Controllers ---
const usersController = require("../controllers/users.controller");
const appointmentController = require("../controllers/appointments.controller");
const doctorController = require("../controllers/doctors.controller");
const upload = require("../utils/multer.utils");


// ============================================================
// PRIVATE ROUTES (JWT authentication required)
// All routes below require a valid Bearer token in the
// Authorization header.
// ============================================================

// Get authenticated user's profile
router.get("/profile", authMiddleware, usersController.getProfile);

router.put("/profile", authMiddleware, upload.single("photo"), usersController.updateProfile);

// --- Appointment Module ---
router.post("/api/appointments", authMiddleware, appointmentController.bookAppointment);
router.get("/api/appointments/my-bookings", authMiddleware, appointmentController.getUserAppointments);

// --- Doctor Management ---
router.post("/api/doctors", authMiddleware, doctorController.createDoctor);
router.put("/api/doctors/:id", authMiddleware, doctorController.updateDoctor);
router.delete("/api/doctors/:id", authMiddleware, doctorController.deleteDoctor);

module.exports = router;