const { models, sequelize } = require("../models");
const { errorHandler, successHandler } = require("../utils/handler.utils");
const crypto = require("crypto");
const { sendAppointmentEmail, sendAppointmentNotification } = require("../services/email.service");

const bookAppointment = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { doctorId, slotId, consultType, patientDetails } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      await t.rollback();
      return res.status(401).json({
        success: false,
        message: "Authenticated user not found. Please login again.",
        code: "USER_NOT_FOUND",
      });
    }

    const authenticatedUser = await models.users.findByPk(userId);
    if (!authenticatedUser) {
      await t.rollback();
      return res.status(401).json({
        success: false,
        message: "User account no longer exists.",
        code: "USER_NOT_FOUND",
      });
    }

    if (!doctorId || !slotId || !patientDetails) {
      await t.rollback();
      return errorHandler(res, new Error("Missing required fields"), 400);
    }

    let parsedPatientDetails = patientDetails;
    if (typeof patientDetails === 'string') {
      try {
        parsedPatientDetails = JSON.parse(patientDetails);
      } catch (e) {
        await t.rollback();
        return errorHandler(res, new Error("Invalid patientDetails JSON format"), 400);
      }
    }

    if (!parsedPatientDetails || typeof parsedPatientDetails !== 'object') {
      await t.rollback();
      return errorHandler(res, new Error("patientDetails must be an object"), 400);
    }

    // Ensure reasons is always an array of strings
    if (!Array.isArray(parsedPatientDetails.reasons)) {
      if (typeof parsedPatientDetails.reasons === 'string' && parsedPatientDetails.reasons.trim() !== '') {
        parsedPatientDetails.reasons = [parsedPatientDetails.reasons.trim()];
      } else {
        parsedPatientDetails.reasons = [];
      }
    }

    // 1. Check if slot exists and is available
    const slot = await models.doctorSlots.findOne({
      where: { id: slotId, doctorId, isBooked: false },
      transaction: t,
    });

    if (!slot) {
      await t.rollback();
      return errorHandler(res, new Error("Slot not available or already booked"), 400);
    }

    // 2. Mark slot as booked
    await slot.update({ isBooked: true }, { transaction: t });

    // 3. Generate unique refCode
    const refCode = `AMC-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    // 4. Create appointment
    const appointment = await models.appointments.create(
      {
        doctorId,
        userId,
        date: slot.date,
        time: slot.time,
        consultType: consultType || "clinic",
        patientDetails: parsedPatientDetails,
        refCode,
        status: "confirmed", // Defaulting to confirmed for simplicity, or "pending" as per requirement
      },
      { transaction: t }
    );

    await t.commit();

    // --- Send Confirmation Email (Fire-and-forget, non-blocking) ---
    // Don't await — send response immediately, emails go out in background
    const emailUserId = userId;
    const emailDoctorId = doctorId;
    const emailAppointment = appointment;

    Promise.resolve().then(async () => {
      try {
        const fullUser = await models.users.findByPk(emailUserId);
        const fullDoctor = await models.doctors.findByPk(emailDoctorId);
        if (fullUser && fullUser.email) {
          await sendAppointmentEmail(emailAppointment, fullUser, fullDoctor);
        }
        if (fullUser && fullDoctor) {
          await sendAppointmentNotification(emailAppointment, fullUser, fullDoctor);
        }
      } catch (emailError) {
        console.error("Failed to send appointment email:", emailError.message);
      }
    });

    return successHandler(res, {
      message: "Appointment booked successfully",
      appointment
    });
  } catch (error) {
    try {
      await t.rollback();
    } catch (rollbackError) {
      console.error("Failed to rollback transaction:", rollbackError.message);
    }
    return errorHandler(res, error);
  }
};

const getUserAppointments = async (req, res) => {
  try {
    const userId = req.user.userId;

    const appointments = await models.appointments.findAll({
      where: { userId },
      include: [
        {
          model: models.doctors,
          as: "doctor",
          attributes: ["name", "specialization", "hospital", "initials", "bgColor", "fgColor"],
        },
      ],
      order: [["date", "DESC"], ["time", "DESC"]],
    });

    return successHandler(res, { appointments });
  } catch (error) {
    return errorHandler(res, error);
  }
};

module.exports = {
  bookAppointment,
  getUserAppointments,
};
