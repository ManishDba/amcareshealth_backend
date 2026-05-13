const express = require("express");
const router = express.Router();

const { models } = require("../../models");
const { sendSuccess } = require("../../utils/response");
const authMiddleware = require("../../middleware/auth.middleware");

// ============================================================
// NOTIFICATION ROUTES — /api/v1/notifications
// All routes require authentication
// ============================================================

router.use(authMiddleware);

// Get user's notifications (paginated)
router.get("/", async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await models.notifications.findAndCountAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset,
    });

    return sendSuccess(res, {
      data: { notifications: rows },
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get unread count
router.get("/unread-count", async (req, res, next) => {
  try {
    const count = await models.notifications.count({
      where: { userId: req.user.userId, isRead: false },
    });
    return sendSuccess(res, { data: { unreadCount: count } });
  } catch (error) {
    next(error);
  }
});

// Mark notification as read
router.patch("/:id/read", async (req, res, next) => {
  try {
    const { id } = req.params;
    await models.notifications.update(
      { isRead: true, readAt: new Date() },
      { where: { id, userId: req.user.userId } }
    );
    return sendSuccess(res, { message: "Notification marked as read." });
  } catch (error) {
    next(error);
  }
});

// Mark all as read
router.patch("/read-all", async (req, res, next) => {
  try {
    await models.notifications.update(
      { isRead: true, readAt: new Date() },
      { where: { userId: req.user.userId, isRead: false } }
    );
    return sendSuccess(res, { message: "All notifications marked as read." });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
