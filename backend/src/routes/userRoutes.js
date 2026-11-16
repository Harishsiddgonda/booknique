import express from "express";
import bcrypt from "bcryptjs";
import { query } from "../config/db.js";

const router = express.Router();

// GET /api/users - List users
router.get("/", async (req, res) => {
  try {
    const { role, status, search } = req.query;
    let sql = "SELECT id, name, email, role, phone, status, created_at, updated_at FROM users WHERE 1=1";
    const params = [];

    if (role && role !== "All") {
      sql += " AND role = ?";
      params.push(role);
    }
    if (status && status !== "All") {
      sql += " AND status = ?";
      params.push(status);
    }
    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      sql += " AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)";
      params.push(q, q, q);
    }

    sql += " ORDER BY id ASC";
    const rows = await query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("Users fetch error:", err);
    res.status(500).json({ error: "Failed to fetch users." });
  }
});

// GET /api/users/:id
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const rows = await query(
      "SELECT id, name, email, role, phone, status, created_at FROM users WHERE id = ?",
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("User fetch error:", err);
    res.status(500).json({ error: "Failed to fetch user." });
  }
});

// PATCH /api/users/:id/role
router.patch("/:id/role", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { role } = req.body;
    if (!["admin", "staff", "customer"].includes(role)) {
      return res.status(400).json({ error: "Invalid role specified." });
    }

    await query("UPDATE users SET role = ? WHERE id = ?", [role, id]);
    res.json({ success: true, message: `User role updated to ${role}.` });
  } catch (err) {
    console.error("User role update error:", err);
    res.status(500).json({ error: "Failed to update role." });
  }
});

// PATCH /api/users/:id/status
router.patch("/:id/status", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;
    if (!["Active", "Suspended", "Inactive"].includes(status)) {
      return res.status(400).json({ error: "Invalid status specified." });
    }

    await query("UPDATE users SET status = ? WHERE id = ?", [status, id]);
    res.json({ success: true, message: `User status updated to ${status}.` });
  } catch (err) {
    console.error("User status update error:", err);
    res.status(500).json({ error: "Failed to update status." });
  }
});

export default router;
