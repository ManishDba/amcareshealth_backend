const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../../env");

/**
 * JWT Authentication Middleware
 * 
 * Verifies the Bearer token from the Authorization header.
 * If valid, attaches the decoded user data (userId) to req.user.
 * If invalid or missing, returns 401 Unauthorized.
 * 
 * Usage: Add this middleware to any route that requires authentication.
 * Example: router.get("/profile", authMiddleware, controller.getProfile)
 */
const authMiddleware = (req, res, next) => {
  try {
    // Extract token from the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    // Remove "Bearer " prefix to get the actual token
    const token = authHeader.split(" ")[1];

    // Verify the token using JWT_SECRET from environment variables
    const decoded = jwt.verify(token, JWT_SECRET);

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
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please login again.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Authentication failed.",
    });
  }
};

module.exports = authMiddleware;
