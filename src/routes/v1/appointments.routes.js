const express = require("express");
const router = express.Router();

const appointmentController = require("../../controllers/appointments.controller");
const authMiddleware = require("../../middleware/auth.middleware");
const { validate, schemas } = require("../../middleware/validate.middleware");

// ============================================================
// APPOINTMENT ROUTES — /api/v1/appointments
// All routes require authentication
// ============================================================

router.use(authMiddleware);

// Book a new appointment
router.post(
  "/",
  validate(schemas.bookAppointment),
  appointmentController.bookAppointment
);

// Get authenticated user's appointments
router.get("/my-bookings", appointmentController.getUserAppointments);

module.exports = router;
