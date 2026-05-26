const { models } = require("../models");
const { errorHandler, successHandler } = require("../utils/handler.utils");
const { Op } = require("sequelize");

const allowedSpecs = ['Liver Surgeon', 'Heart Surgeon', 'Kidney Surgeon'];

const getAllDoctors = async (req, res) => {
  try {
    const { search } = req.query;
    let where = {};

    if (search) {
      where.name = { [Op.iLike]: `%${search}%` };
    }

    // Restrict to allowed specializations only
    where[Op.and] = where[Op.and] || [];
    // Case‑insensitive filter for allowed specializations
    const specFilters = allowedSpecs.map(spec => ({ specialization: { [Op.iLike]: spec } }));
    where[Op.and].push({ [Op.or]: specFilters });

    const doctors = await models.doctors.findAll({
      where,
      // Order to put Dr. Subash Gupta first, then by name
      order: [
        [
          models.sequelize.literal(`CASE WHEN name = 'Dr. Subash Gupta' THEN 0 ELSE 1 END`),
          'ASC',
        ],
        ["name", "ASC"],
      ],
    });

    return successHandler(res, { doctors });
  } catch (error) {
    return errorHandler(res, error);
  }
};

const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await models.doctors.findByPk(id);

    if (!doctor) {
      return errorHandler(res, new Error("Doctor not found"), 404);
    }

    return successHandler(res, { doctor });
  } catch (error) {
    return errorHandler(res, error);
  }
};

const getAvailableSlots = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    // If a specific date is provided, filter by that date.
    // Otherwise, return unbooked slots for the next 30 days.
    let slotWhere = { doctorId: id, isBooked: false };
    if (date) {
      slotWhere.date = date;
    } else {
      const dates = [];
      const today = new Date();
      for (let i = 0; i < 30; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        dates.push(d.toISOString().split('T')[0]);
      }
      slotWhere.date = { [Op.in]: dates };
    }

    const slots = await models.doctorSlots.findAll({
      where: slotWhere,
      order: [["date", "ASC"], ["time", "ASC"]],
    });

    return successHandler(res, { slots });
  } catch (error) {
    return errorHandler(res, error);
  }
};

const createDoctor = async (req, res) => {
  try {
    const { name, specialization, hospital, bio, rating, experience, initials, bgColor, fgColor } = req.body;

    if (!name || !specialization || !hospital) {
      return errorHandler(res, new Error("Name, specialization, and hospital are required"), 400);
    }

    const doctor = await models.doctors.create({
      name,
      specialization,
      hospital,
      bio,
      rating,
      experience,
      initials,
      bgColor,
      fgColor,
    });

    return successHandler(res, { message: "Doctor created successfully", doctor }, 201);
  } catch (error) {
    return errorHandler(res, error);
  }
};

const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const doctor = await models.doctors.findByPk(id);
    if (!doctor) {
      return errorHandler(res, new Error("Doctor not found"), 404);
    }

    await doctor.update(updateData);

    return successHandler(res, { message: "Doctor updated successfully", doctor });
  } catch (error) {
    return errorHandler(res, error);
  }
};

const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await models.doctors.findByPk(id);
    if (!doctor) {
      return errorHandler(res, new Error("Doctor not found"), 404);
    }

    await doctor.destroy();

    return successHandler(res, { message: "Doctor deleted successfully" });
  } catch (error) {
    return errorHandler(res, error);
  }
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  getAvailableSlots,
  createDoctor,
  updateDoctor,
  deleteDoctor,
};
