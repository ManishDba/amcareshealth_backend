const { models, sequelize } = require("../models");
const { errorHandler, successHandler } = require("../utils/handler.utils");
const crypto = require("crypto");
const { sendAppointmentEmail, sendAppointmentNotification } = require("../services/email.service");

const bookAppointment = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { doctorId, slotId, consultType, patientDetails } = req.body;
    const userId = req.user.userId; // Based on auth middleware common practice

    if (!doctorId || !slotId || !patientDetails) {
      return errorHandler(res, new Error("Missing required fields"), 400);
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
        patientDetails,
        refCode,
        status: "confirmed", // Defaulting to confirmed for simplicity, or "pending" as per requirement
      },
      { transaction: t }
    );

    await t.commit();

    // --- Send Confirmation Email (Async) ---
    try {
      const fullUser = await models.users.findByPk(userId);
      const fullDoctor = await models.doctors.findByPk(doctorId);
      if (fullUser && fullUser.email) {
        await sendAppointmentEmail(appointment, fullUser, fullDoctor);
      }
      if (fullUser && fullDoctor) {
        await sendAppointmentNotification(appointment, fullUser, fullDoctor);
      }
    } catch (emailError) {
      console.error("Failed to send appointment email:", emailError);
    }

    return successHandler(res, { 
      message: "Appointment booked successfully", 
      appointment 
    });
  } catch (error) {
    await t.rollback();
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
