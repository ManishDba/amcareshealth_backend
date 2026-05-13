const express = require("express");
const router = express.Router();

const doctorController = require("../../controllers/doctors.controller");
const authMiddleware = require("../../middleware/auth.middleware");
const { validate, schemas } = require("../../middleware/validate.middleware");

// ============================================================
// DOCTOR ROUTES — /api/v1/doctors
// ============================================================

// --- Public Routes ---
router.get("/", doctorController.getAllDoctors);
router.get("/:id", doctorController.getDoctorById);
router.get("/:id/slots", doctorController.getAvailableSlots);

// --- Protected Routes (Admin/Doctor management) ---
router.post(
  "/",
  authMiddleware,
  validate(schemas.createDoctor),
  doctorController.createDoctor
);
router.put("/:id", authMiddleware, doctorController.updateDoctor);
router.delete("/:id", authMiddleware, doctorController.deleteDoctor);

module.exports = router;
