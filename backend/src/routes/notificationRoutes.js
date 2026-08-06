const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");
const { verifyToken } = require("../middleware/authMiddleware");

// In-Memory persistent fallback for notifications if SQL table is not yet migrated
const memoryNotifications = new Map();

router.use(verifyToken);

// Helper: Get or initialize memory array for user
const getMemoryList = (userId) => {
  if (!memoryNotifications.has(userId)) {
    // Default welcome notification
    memoryNotifications.set(userId, [
      {
        _id: `welcome-${userId}`,
        title: "Welcome to ResumeAI",
        message: "Your application tracking and recruitment status alerts will appear here in real-time.",
        type: "system",
        isRead: false,
        createdAt: new Date().toISOString(),
      },
    ]);
  }
  return memoryNotifications.get(userId);
};

/* ─────────────────────────────────────────────
   GET /api/notifications
   Returns recent notifications and unread count
   for the logged-in user across Web & Mobile.
───────────────────────────────────────────── */
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false })
      .limit(30);

    if (error && (error.code === "42P01" || error.code === "PGRST205")) {
      // Graceful fallback to in-memory notifications
      const list = getMemoryList(req.user.id);
      const unreadCount = list.filter((n) => !n.isRead).length;
      return res.json({ notifications: list, unreadCount });
    } else if (error) {
      throw error;
    }

    const notifications = (data || []).map((n) => ({
      _id: n.id,
      title: n.title,
      message: n.message,
      type: n.type || "status_update",
      isRead: Boolean(n.is_read),
      link: n.link || null,
      createdAt: n.created_at,
    }));

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    res.json({ notifications, unreadCount });
  } catch (err) {
    console.warn("[notificationRoutes] GET error, falling back to memory:", err.message);
    const list = getMemoryList(req.user.id);
    const unreadCount = list.filter((n) => !n.isRead).length;
    res.json({ notifications: list, unreadCount });
  }
});

/* ─────────────────────────────────────────────
   PUT /api/notifications/:id/read
   Mark single notification as read
───────────────────────────────────────────── */
router.put("/:id/read", async (req, res) => {
  try {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", req.params.id)
      .eq("user_id", req.user.id);

    if (error && (error.code === "42P01" || error.code === "PGRST205")) {
      const list = getMemoryList(req.user.id);
      const idx = list.findIndex((n) => n._id === req.params.id);
      if (idx !== -1) list[idx].isRead = true;
      return res.json({ message: "Marked as read (memory)" });
    } else if (error) {
      throw error;
    }

    res.json({ message: "Marked as read" });
  } catch (err) {
    const list = getMemoryList(req.user.id);
    const idx = list.findIndex((n) => n._id === req.params.id);
    if (idx !== -1) list[idx].isRead = true;
    res.json({ message: "Marked as read (memory fallback)" });
  }
});

/* ─────────────────────────────────────────────
   PUT /api/notifications/read-all
   Mark all notifications as read for logged-in user
───────────────────────────────────────────── */
router.put("/read-all", async (req, res) => {
  try {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", req.user.id)
      .eq("is_read", false);

    if (error && (error.code === "42P01" || error.code === "PGRST205")) {
      const list = getMemoryList(req.user.id);
      list.forEach((n) => (n.isRead = true));
      return res.json({ message: "All marked as read (memory)" });
    } else if (error) {
      throw error;
    }

    res.json({ message: "All marked as read" });
  } catch (err) {
    const list = getMemoryList(req.user.id);
    list.forEach((n) => (n.isRead = true));
    res.json({ message: "All marked as read (memory fallback)" });
  }
});

// Helper exported for backend internal status updates
router.addStatusNotification = async (userId, title, message, link = null) => {
  try {
    const { error } = await supabase.from("notifications").insert({
      user_id: userId,
      title,
      message,
      type: "status_update",
      is_read: false,
      link,
    });

    if (error && (error.code === "42P01" || error.code === "PGRST205")) {
      const list = getMemoryList(userId);
      list.unshift({
        _id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title,
        message,
        type: "status_update",
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    const list = getMemoryList(userId);
    list.unshift({
      _id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title,
      message,
      type: "status_update",
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  }
};

module.exports = router;
