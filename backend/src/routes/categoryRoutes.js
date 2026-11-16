import express from "express";
import { query } from "../config/db.js";

const router = express.Router();

// GET /api/categories
router.get("/", async (req, res) => {
  try {
    const { type } = req.query;
    let sql = `
      SELECT c.*, COUNT(i.id) as item_count
      FROM categories c
      LEFT JOIN inventory_items i ON c.id = i.category_id
    `;
    const params = [];

    if (type && type !== "All") {
      sql += " WHERE c.type = ?";
      params.push(type);
    }

    sql += " GROUP BY c.id ORDER BY c.name ASC";
    const rows = await query(sql, params);
    res.json(rows.map(r => ({ ...r, item_count: Number(r.item_count) || 0 })));
  } catch (err) {
    console.error("Categories fetch error:", err);
    res.status(500).json({ error: "Failed to fetch categories." });
  }
});

// POST /api/categories
router.post("/", async (req, res) => {
  try {
    const { name, type, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Category name is required." });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    await query(
      "INSERT INTO categories (name, type, slug, description) VALUES (?, ?, ?, ?)",
      [name, type || "General", slug, description || ""]
    );

    res.status(201).json({ success: true, message: "Category created successfully." });
  } catch (err) {
    console.error("Category create error:", err);
    res.status(500).json({ error: err.message || "Failed to create category." });
  }
});

export default router;
