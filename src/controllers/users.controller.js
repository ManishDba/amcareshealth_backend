const { Op } = require("sequelize");
const { models } = require("../models");
const {
  errorHandler,
  successHandler,
  handlerWithMsg,
} = require("../utils/handler.utils");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../../env");

// ============================================================
// Welcome Route (Health Check)
// ============================================================
const welcome = async (req, res) => {
  res.send("Hello programmer... AmCaresHealth API is running!");
};

// ============================================================
// REGISTER / SIGN-UP
// POST /sign-up
// Body (form-data): name, email, phone, password, age,
//                   bloodGroup, aadharNo, address, photo (file)
// ============================================================
const signup = async (req, res) => {
  try {
    const { name, email, phone, password, age, bloodGroup, aadharNo, address } =
      req.body;

    // --- Validation ---
    if (!name || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, phone, and password are required fields.",
      });
    }

    // Check if phone already exists
    const existingPhone = await models.users.findOne({ where: { phone } });
    if (existingPhone) {
      return res.status(409).json({
        success: false,
        message: "Phone number is already registered.",
      });
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingEmail = await models.users.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: "Email is already registered.",
        });
      }
    }

    // Check if aadharNo already exists (if provided)
    if (aadharNo) {
      const existingAadhar = await models.users.findOne({
        where: { aadharNo },
      });
      if (existingAadhar) {
        return res.status(409).json({
          success: false,
          message: "Aadhar number is already registered.",
        });
      }
    }

    // Hash the password with bcrypt (salt rounds: 10)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get the photo path if a file was uploaded
    const photoPath = req.file ? `/uploads/photos/${req.file.filename}` : null;

    // Create the user record in the database
    const user = await models.users.create({
      name,
      email: email || null,
      phone,
      password: hashedPassword,
      age: age ? parseInt(age) : null,
      bloodGroup: bloodGroup || null,
      aadharNo: aadharNo || null,
      photo: photoPath,
      address: address || null,
    });

    // Generate JWT token for immediate login after registration
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    // Return success response (exclude password from response)
    const userData = user.toJSON();
    delete userData.password;

    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
      data: userData,
      token,
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

// ============================================================
// LOGIN / SIGN-IN
// POST /sign-in
// Body (JSON): { phone, password }
// ============================================================
const signin = async (req, res) => {
  try {
    const { phone, password } = req.body;

    // --- Validation ---
    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Phone and password are required.",
      });
    }

    // Find user by phone number
    const user = await models.users.findOne({ where: { phone } });

    // If user not found, return error
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid phone number or password.",
      });
    }

    // Compare the provided password with the stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid phone number or password.",
      });
    }

    // Generate JWT token (expires in 7 days)
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    // Return success response (exclude password)
    const userData = user.toJSON();
    delete userData.password;

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: userData,
      token,
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

// ============================================================
// GET PROFILE
// GET /profile
// Headers: Authorization: Bearer <token>
// ============================================================
const getProfile = async (req, res) => {
  try {
    // req.user is set by the auth middleware (contains userId)
    const user = await models.users.findByPk(req.user.userId, {
      attributes: { exclude: ["password"] }, // Never return password
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

// ============================================================
// UPDATE PROFILE
// PUT /profile
// Headers: Authorization: Bearer <token>
// Body (form-data): name, email, phone, age, bloodGroup,
//                   aadharNo, address, photo (file)
// Note: Password update is NOT allowed via this endpoint
// ============================================================
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, email, phone, age, bloodGroup, aadharNo, address } = req.body;

    // Find the user to update
    const user = await models.users.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Check uniqueness constraints for email (if changed)
    if (email && email !== user.email) {
      const existingEmail = await models.users.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: "Email is already in use by another account.",
        });
      }
    }

    // Check uniqueness constraints for phone (if changed)
    if (phone && phone !== user.phone) {
      const existingPhone = await models.users.findOne({ where: { phone } });
      if (existingPhone) {
        return res.status(409).json({
          success: false,
          message: "Phone number is already in use by another account.",
        });
      }
    }

    // Check uniqueness constraints for aadharNo (if changed)
    if (aadharNo && aadharNo !== user.aadharNo) {
      const existingAadhar = await models.users.findOne({
        where: { aadharNo },
      });
      if (existingAadhar) {
        return res.status(409).json({
          success: false,
          message: "Aadhar number is already in use by another account.",
        });
      }
    }

    // Build the update object (only include provided fields)
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (age !== undefined) updateData.age = parseInt(age);
    if (bloodGroup !== undefined) updateData.bloodGroup = bloodGroup;
    if (aadharNo !== undefined) updateData.aadharNo = aadharNo;
    if (address !== undefined) updateData.address = address;

    // Handle photo upload (if a new file was uploaded)
    if (req.file) {
      updateData.photo = `/uploads/photos/${req.file.filename}`;
    }

    // Update the user record
    await models.users.update(updateData, { where: { id: userId } });

    // Fetch the updated user data
    const updatedUser = await models.users.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: updatedUser,
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

module.exports = {
  welcome,
  signup,
  signin,
  getProfile,
  updateProfile,
};
