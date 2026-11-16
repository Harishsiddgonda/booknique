import express from "express";
import { query, getDatabaseDriver } from "../config/db.js";

const router = express.Router();

// GET /api/admin/overview - Real database metrics
router.get("/overview", async (req, res) => {
  try {
    const [totalBooks] = await query("SELECT COUNT(*) as count FROM inventory_items WHERE type = 'Book'");
    const [totalToys] = await query("SELECT COUNT(*) as count FROM inventory_items WHERE type = 'Toy'");
    const [activeRentals] = await query("SELECT COUNT(*) as count FROM rentals WHERE status IN ('Active', 'Due Soon', 'Overdue')");
    const [overdueRentals] = await query("SELECT COUNT(*) as count FROM rentals WHERE status = 'Overdue'");
    const [totalCustomers] = await query("SELECT COUNT(*) as count FROM customers");
    const [revenueRow] = await query("SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'Completed'");
    const [recentRentals] = await query("SELECT * FROM rentals ORDER BY id DESC LIMIT 5");

    res.json({
      db_driver: getDatabaseDriver(),
      books_count: Number(totalBooks?.count || 0),
      toys_count: Number(totalToys?.count || 0),
      active_rentals: Number(activeRentals?.count || 0),
      overdue_rentals: Number(overdueRentals?.count || 0),
      total_members: Number(totalCustomers?.count || 0),
      total_revenue: Number(revenueRow?.total || 0),
      currency: "INR",
      recent_rentals: recentRentals || []
    });
  } catch (err) {
    console.error("Admin overview error:", err);
    res.status(500).json({ error: "Failed to fetch admin overview metrics." });
  }
});

// GET /api/admin/audit-logs
router.get("/audit-logs", async (req, res) => {
  try {
    const rows = await query("SELECT * FROM audit_logs ORDER BY id DESC LIMIT 50");
    res.json(rows);
  } catch (err) {
    console.error("Audit logs error:", err);
    res.status(500).json({ error: "Failed to fetch audit logs." });
  }
});

// GET /api/admin/damages
router.get("/damages", async (req, res) => {
  try {
    const rows = await query(`
      SELECT d.*, i.title as item_title, i.item_code, i.type as item_type, c.full_name as customer_name
      FROM damages d
      JOIN inventory_items i ON d.item_id = i.id
      LEFT JOIN customers c ON d.customer_id = c.id
      ORDER BY d.id DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("Damages fetch error:", err);
    res.status(500).json({ error: "Failed to fetch damage records." });
  }
});

// POST /api/admin/damages
router.post("/damages", async (req, res) => {
  try {
    const { rental_id, item_id, customer_id, damage_type, severity, repair_cost, fee_charged, description } = req.body;
    await query(
      `INSERT INTO damages (rental_id, item_id, customer_id, damage_type, severity, repair_cost, fee_charged, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        rental_id || null,
        Number(item_id),
        customer_id ? Number(customer_id) : null,
        damage_type || "Wear & Tear",
        severity || "Low",
        Number(repair_cost) || 0.00,
        Number(fee_charged) || 0.00,
        description || ""
      ]
    );

    // Update item status to Maintenance if severity is Medium or Critical
    if (["Medium", "Critical"].includes(severity)) {
      await query("UPDATE inventory_items SET condition_status = 'Needs Inspection', rental_status = 'Maintenance' WHERE id = ?", [Number(item_id)]);
    }

    res.status(201).json({ success: true, message: "Damage logged and item flagged for maintenance." });
  } catch (err) {
    console.error("Damage log error:", err);
    res.status(500).json({ error: err.message || "Failed to log damage." });
  }
});

// GET /api/admin/discounts
router.get("/discounts", async (req, res) => {
  try {
    const rows = await query("SELECT * FROM discounts ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error("Discounts error:", err);
    res.status(500).json({ error: "Failed to fetch discounts." });
  }
});

// POST /api/admin/discounts
router.post("/discounts", async (req, res) => {
  try {
    const { code, discount_percent, fixed_amount, min_order_amount, max_discount_amount, expiry_date, usage_limit } = req.body;
    if (!code) {
      return res.status(400).json({ error: "Coupon code is required." });
    }

    await query(
      `INSERT INTO discounts (code, discount_percent, fixed_amount, min_order_amount, max_discount_amount, expiry_date, usage_limit)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        code.toUpperCase(),
        Number(discount_percent) || 0,
        Number(fixed_amount) || 0,
        Number(min_order_amount) || 0,
        Number(max_discount_amount) || 0,
        expiry_date || "2027-12-31",
        Number(usage_limit) || 100
      ]
    );

    res.status(201).json({ success: true, message: "Discount coupon created successfully." });
  } catch (err) {
    console.error("Discount create error:", err);
    res.status(500).json({ error: err.message || "Failed to create discount coupon." });
  }
});

// GET /api/admin/settings
router.get("/settings", async (req, res) => {
  try {
    const rows = await query("SELECT * FROM store_settings ORDER BY id ASC");
    res.json(rows);
  } catch (err) {
    console.error("Settings error:", err);
    res.status(500).json({ error: "Failed to fetch store settings." });
  }
});

// PUT /api/admin/settings
router.put("/settings", async (req, res) => {
  try {
    const { settings } = req.body; // Array of { setting_key, setting_value }
    if (Array.isArray(settings)) {
      for (const s of settings) {
        await query(
          "UPDATE store_settings SET setting_value = ? WHERE setting_key = ?",
          [s.setting_value, s.setting_key]
        );
      }
    }
    res.json({ success: true, message: "Settings updated successfully." });
  } catch (err) {
    console.error("Settings update error:", err);
    res.status(500).json({ error: "Failed to update settings." });
  }
});

export default router;
