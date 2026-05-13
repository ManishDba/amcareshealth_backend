const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../../env");
const { models } = require("../models");

/**
 * JWT Authentication Middleware
 * 
 * Verifies the Bearer token from the Authorization header.
 * If valid, attaches the decoded user data (userId, role) to req.user.
 * If invalid or missing, returns 401 Unauthorized.
 * 
 * Backward compatible — if an old token lacks a 'role' field,
 * it looks up the user's role from the database.
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Extract token from the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
        code: "NO_TOKEN",
      });
    }

    // Remove "Bearer " prefix to get the actual token
    const token = authHeader.split(" ")[1];

    // Verify the token using JWT_SECRET from environment variables
    const decoded = jwt.verify(token, JWT_SECRET);

    // Backward compatibility: old tokens may not have 'role'
    if (!decoded.role) {
      try {
        const user = await models.users.findByPk(decoded.userId, {
          attributes: ["role"],
        });
        decoded.role = user ? user.role : "patient";
      } catch {
        decoded.role = "patient";
      }
    }

    // Attach decoded user info to the request object
    req.user = decoded;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    // Handle specific JWT errors for better debugging
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired. Please login again.",
        code: "TOKEN_EXPIRED",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please login again.",
        code: "INVALID_TOKEN",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Authentication failed.",
      code: "AUTH_FAILED",
    });
  }
};

module.exports = authMiddleware;
