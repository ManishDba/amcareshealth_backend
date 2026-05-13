const { models } = require("../models");
const { errorHandler, successHandler } = require("../utils/handler.utils");
const { Op } = require("sequelize");

const getAllDoctors = async (req, res) => {
  try {
    const { search, specialization } = req.query;
    let where = {};

    if (search) {
      where.name = { [Op.iLike]: `%${search}%` };
    }

    if (specialization) {
      where.specialization = specialization;
    }

    const doctors = await models.doctors.findAll({
      where,
      order: [["name", "ASC"]],
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

    if (!date) {
      return errorHandler(res, new Error("Date is required"), 400);
    }

    const slots = await models.doctorSlots.findAll({
      where: {
        doctorId: id,
        date,
        isBooked: false,
      },
      order: [["time", "ASC"]],
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
