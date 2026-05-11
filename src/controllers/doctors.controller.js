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

module.exports = {
  getAllDoctors,
  getDoctorById,
  getAvailableSlots,
};
