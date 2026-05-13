const express = require("express");
const router = express.Router();

/**
 * API v1 Route Aggregator
 * 
 * All v1 route modules are mounted here.
 * Mounted at /api/v1 in the main app.
 */

router.use("/auth", require("./auth.routes"));
router.use("/users", require("./users.routes"));
router.use("/doctors", require("./doctors.routes"));
router.use("/appointments", require("./appointments.routes"));
router.use("/notifications", require("./notifications.routes"));

module.exports = router;
