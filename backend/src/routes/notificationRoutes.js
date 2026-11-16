import express from "express";
import { query } from "../config/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const notifications = await query(
      "SELECT * FROM notifications ORDER BY id DESC LIMIT 15"
    );
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notifications." });
  }
});

router.patch("/:id/read", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await query("UPDATE notifications SET is_read = TRUE WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update notification." });
  }
});

router.post("/read-all", async (req, res) => {
  try {
    await query("UPDATE notifications SET is_read = TRUE WHERE is_read = FALSE");
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to mark all as read." });
  }
});

export default router;
