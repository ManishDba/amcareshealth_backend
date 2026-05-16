const { models } = require("../models");
const { errorHandler, successHandler } = require("../utils/handler.utils");
const crypto = require("crypto");

/**
 * Register a new Organ Transplant request (Recipient or Donor)
 */
const registerTransplant = async (req, res) => {
  try {
    const { 
      type, organ, patientName, email, phone, 
      age, city, bloodGroup, medicalHistory, urgency 
    } = req.body;
    const userId = req.user.userId;

    // 1. Validation
    if (!type || !organ || !patientName || !phone || !bloodGroup) {
      return errorHandler(res, new Error("Missing required fields for transplant registration"), 400);
    }

    // 2. Generate unique reference code
    const refCode = `AMC-TRANS-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    // 3. Create record
    const registration = await models.organTransplants.create({
      userId,
      type,
      organ,
      patientName,
      email,
      phone,
      age: parseInt(age),
      city,
      bloodGroup,
      medicalHistory,
      urgency: urgency || "medium",
      refCode,
      status: "active"
    });

    return successHandler(res, {
      message: "Transplant registration successful",
      registration
    });
  } catch (error) {
    return errorHandler(res, error);
  }
};

/**
 * Get all transplant registrations for the logged-in user
 */
const getMyRegistrations = async (req, res) => {
  try {
    const userId = req.user.userId;
    const registrations = await models.organTransplants.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]]
    });

    return successHandler(res, { registrations });
  } catch (error) {
    return errorHandler(res, error);
  }
};

module.exports = {
  registerTransplant,
  getMyRegistrations
};
