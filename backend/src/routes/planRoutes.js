import express from "express";
import { query } from "../config/db.js";

const router = express.Router();

// GET /api/plans
router.get("/", async (req, res) => {
  try {
    const rows = await query("SELECT * FROM membership_plans ORDER BY price ASC");
    const mapped = rows.map(r => ({
      ...r,
      price: Number(r.price),
      books: r.max_books,
      toys: r.max_toys,
      maxItems: r.max_total_items,
      desc: r.description
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch membership plans." });
  }
});

// POST /api/plans
router.post("/", async (req, res) => {
  try {
    const { name, code, price, duration_days, max_books, max_toys, max_total_items, description } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ error: "Plan name and price are required." });
    }

    const planCode = code || `PLAN-${name.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8)}`;
    const books = Number(max_books) || 0;
    const toys = Number(max_toys) || 0;
    const total = Number(max_total_items) || (books + toys);

    const result = await query(
      `INSERT INTO membership_plans (code, name, price, duration_days, max_books, max_toys, max_total_items, description, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Active')`,
      [planCode, name, Number(price), Number(duration_days) || 30, books, toys, total, description || ""]
    );

    const [newPlan] = await query("SELECT * FROM membership_plans WHERE id = ?", [result.insertId]);
    res.status(201).json({
      ...newPlan,
      price: Number(newPlan.price),
      books: newPlan.max_books,
      toys: newPlan.max_toys,
      maxItems: newPlan.max_total_items,
      desc: newPlan.description
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to create membership plan." });
  }
});

// PUT /api/plans/:id
router.put("/:id", async (req, res) => {
  try {
    const { name, price, duration_days, max_books, max_toys, max_total_items, description, status } = req.body;
    const id = Number(req.params.id);

    await query(
      `UPDATE membership_plans 
       SET name = COALESCE(?, name), price = COALESCE(?, price), duration_days = COALESCE(?, duration_days),
           max_books = COALESCE(?, max_books), max_toys = COALESCE(?, max_toys), 
           max_total_items = COALESCE(?, max_total_items), description = COALESCE(?, description),
           status = COALESCE(?, status)
       WHERE id = ?`,
      [name, price, duration_days, max_books, max_toys, max_total_items, description, status, id]
    );

    const [updated] = await query("SELECT * FROM membership_plans WHERE id = ?", [id]);
    res.json({
      ...updated,
      price: Number(updated.price),
      books: updated.max_books,
      toys: updated.max_toys,
      maxItems: updated.max_total_items,
      desc: updated.description
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to update membership plan." });
  }
});

// DELETE /api/plans/:id
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const assigned = await query("SELECT id FROM customers WHERE subscription_plan_id = ?", [id]);
    if (assigned.length > 0) {
      return res.status(400).json({ error: `Cannot delete plan because ${assigned.length} member(s) are actively enrolled.` });
    }

    await query("DELETE FROM membership_plans WHERE id = ?", [id]);
    res.json({ success: true, message: "Membership plan removed." });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete plan." });
  }
});

export default router;
