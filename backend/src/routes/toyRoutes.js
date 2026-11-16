import express from "express";
import { query } from "../config/db.js";

const router = express.Router();

// GET /api/toys - list toys with optional filtering
router.get("/", async (req, res) => {
  try {
    const { category, age_group, status, search } = req.query;
    let sql = "SELECT * FROM inventory_items WHERE type = 'Toy'";
    const params = [];

    if (category && category !== "All") {
      sql += " AND (category_name = ? OR category_id = ?)";
      params.push(category, Number(category) || 0);
    }
    if (age_group && age_group !== "All") {
      sql += " AND age_group = ?";
      params.push(age_group);
    }
    if (status && status !== "All") {
      sql += " AND rental_status = ?";
      params.push(status);
    }
    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      sql += " AND (title LIKE ? OR item_code LIKE ? OR author_or_brand LIKE ?)";
      params.push(q, q, q);
    }

    sql += " ORDER BY id ASC";
    const rows = await query(sql, params);

    const mapped = rows.map(r => ({
      ...r,
      item_id: r.item_code,
      code: r.item_code,
      name: r.title,
      category: r.category_name,
      ageGroup: r.age_group,
      fee: Number(r.monthly_rental_fee),
      monthly_rental_fee: Number(r.monthly_rental_fee),
      status: r.rental_status,
      condition: r.condition_status,
      total: r.total_quantity,
      available: r.available_quantity
    }));

    res.json(mapped);
  } catch (err) {
    console.error("Toys fetch error:", err);
    res.status(500).json({ error: "Failed to fetch toys from database." });
  }
});

// GET /api/toys/:id
router.get("/:id", async (req, res) => {
  try {
    const idOrCode = req.params.id;
    const rows = await query(
      "SELECT * FROM inventory_items WHERE type = 'Toy' AND (id = ? OR item_code = ?)",
      [Number(idOrCode) || 0, idOrCode]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Toy not found." });
    }

    const r = rows[0];
    res.json({
      ...r,
      item_id: r.item_code,
      code: r.item_code,
      name: r.title,
      fee: Number(r.monthly_rental_fee),
      monthly_rental_fee: Number(r.monthly_rental_fee)
    });
  } catch (err) {
    console.error("Toy detail error:", err);
    res.status(500).json({ error: "Failed to fetch toy detail." });
  }
});

// POST /api/toys (Create new toy)
router.post("/", async (req, res) => {
  try {
    const {
      item_code,
      title,
      category_id,
      category_name,
      age_group,
      author_or_brand,
      isbn_or_model,
      monthly_rental_fee,
      security_deposit,
      replacement_cost,
      total_quantity,
      condition_status,
      shelf_location,
      description,
      image_url
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Toy title is required." });
    }

    const code = item_code || `T${Date.now().toString().slice(-4)}`;
    const fee = Number(monthly_rental_fee) || 399.00;
    const deposit = Number(security_deposit) || (fee * 2.5);
    const replacement = Number(replacement_cost) || (fee * 5);
    const total = Number(total_quantity) || 1;

    await query(
      `INSERT INTO inventory_items
       (item_code, title, type, category_id, category_name, age_group, author_or_brand, isbn_or_model,
        monthly_rental_fee, security_deposit, replacement_cost, total_quantity, available_quantity,
        condition_status, rental_status, shelf_location, description, image_url)
       VALUES (?, ?, 'Toy', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Available', ?, ?, ?)`,
      [
        code,
        title,
        category_id || 5,
        category_name || "General Toy",
        age_group || "3+ years",
        author_or_brand || "",
        isbn_or_model || "",
        fee,
        deposit,
        replacement,
        total,
        total,
        condition_status || "Good",
        shelf_location || "Bin T-01",
        description || "",
        image_url || "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=600&q=80"
      ]
    );

    res.status(201).json({ success: true, message: "Toy created successfully.", item_code: code });
  } catch (err) {
    console.error("Toy create error:", err);
    res.status(500).json({ error: err.message || "Failed to create toy." });
  }
});

export default router;
