import express from "express";
import { query } from "../config/db.js";
import { requireRole, optionalAuth } from "../middleware/auth.js";

const router = express.Router();

// GET /api/inventory
router.get("/", async (req, res) => {
  try {
    const { type, category, age_group, status, search } = req.query;
    let sql = "SELECT * FROM inventory_items WHERE 1=1";
    const params = [];

    if (type && type !== "All") {
      sql += " AND type = ?";
      params.push(type);
    }
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
      sql += " AND (title LIKE ? OR item_code LIKE ? OR category_name LIKE ? OR author_or_brand LIKE ?)";
      params.push(q, q, q, q);
    }

    sql += " ORDER BY id ASC";
    const rows = await query(sql, params);

    // Map rows with backwards-compatible aliases for legacy frontend support
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
    console.error("Inventory fetch error:", err);
    res.status(500).json({ error: "Failed to fetch inventory items from database." });
  }
});

// GET /api/inventory/:id
router.get("/:id", async (req, res) => {
  try {
    const idOrCode = req.params.id;
    const rows = await query(
      "SELECT * FROM inventory_items WHERE id = ? OR item_code = ?",
      [Number(idOrCode) || 0, idOrCode]
    );
    if (!rows.length) {
      return res.status(404).json({ error: "Inventory item not found." });
    }
    const item = rows[0];

    // Fetch rental history for this item
    const history = await query(
      "SELECT r.*, c.member_code, c.full_name as customer_name FROM rentals r LEFT JOIN customers c ON r.customer_id = c.id WHERE r.item_id = ? ORDER BY r.id DESC LIMIT 10",
      [item.id]
    );

    res.json({
      ...item,
      item_id: item.item_code,
      code: item.item_code,
      name: item.title,
      fee: Number(item.monthly_rental_fee),
      status: item.rental_status,
      condition: item.condition_status,
      total: item.total_quantity,
      available: item.available_quantity,
      history
    });
  } catch (err) {
    console.error("Item detail error:", err);
    res.status(500).json({ error: "Failed to load item details." });
  }
});

// POST /api/inventory
router.post("/", async (req, res) => {
  try {
    const x = req.body;
    const title = x.title || x.name;
    if (!title) {
      return res.status(400).json({ error: "Item title is required." });
    }

    const type = x.type || (x.category?.toLowerCase().includes("toy") ? "Toy" : "Book");
    
    // Auto-generate item code if missing
    let code = x.item_code || x.item_id || x.code;
    if (!code) {
      const [count] = await query("SELECT COUNT(*) as c FROM inventory_items WHERE type = ?", [type]);
      const prefix = type === "Toy" ? "T" : "B";
      code = `${prefix}00${(count.c || 0) + 1}`;
    }

    // Check unique code
    const existing = await query("SELECT id FROM inventory_items WHERE item_code = ?", [code]);
    if (existing.length) {
      code = `${code}-${Math.floor(Math.random() * 900 + 100)}`;
    }

    const total = Number(x.total_quantity || x.total) || 1;
    const fee = Number(x.monthly_rental_fee || x.fee) || 3.00;
    const deposit = Number(x.security_deposit) || (fee * 2);
    const replacement = Number(x.replacement_cost) || (fee * 5);
    const condition = x.condition_status || x.condition || "Good";
    const status = x.rental_status || x.status || "Available";
    const categoryName = x.category_name || x.category || (type === "Book" ? "General Book" : "General Toy");
    const ageGroup = x.age_group || x.ageGroup || "All ages";

    const result = await query(
      `INSERT INTO inventory_items 
       (item_code, title, type, category_name, age_group, author_or_brand, isbn_or_model, monthly_rental_fee, security_deposit, replacement_cost, total_quantity, available_quantity, condition_status, rental_status, shelf_location, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        code,
        title,
        type,
        categoryName,
        ageGroup,
        x.author_or_brand || "",
        x.isbn_or_model || "",
        fee,
        deposit,
        replacement,
        total,
        total,
        condition,
        status,
        x.shelf_location || "Storage A",
        x.description || ""
      ]
    );

    const [newItem] = await query("SELECT * FROM inventory_items WHERE id = ?", [result.insertId]);

    res.status(201).json({
      ...newItem,
      item_id: newItem.item_code,
      code: newItem.item_code,
      name: newItem.title,
      fee: Number(newItem.monthly_rental_fee),
      status: newItem.rental_status,
      condition: newItem.condition_status,
      total: newItem.total_quantity,
      available: newItem.available_quantity
    });
  } catch (err) {
    console.error("Create item error:", err);
    res.status(500).json({ error: "Failed to create inventory item in database." });
  }
});

// PUT /api/inventory/:id
router.put("/:id", async (req, res) => {
  try {
    const idOrCode = req.params.id;
    const items = await query("SELECT * FROM inventory_items WHERE id = ? OR item_code = ?", [Number(idOrCode) || 0, idOrCode]);
    if (!items.length) {
      return res.status(404).json({ error: "Inventory item not found." });
    }
    const current = items[0];
    const x = req.body;

    const title = x.title || x.name || current.title;
    const fee = Number(x.monthly_rental_fee ?? x.fee ?? current.monthly_rental_fee);
    const condition = x.condition_status || x.condition || current.condition_status;
    const status = x.rental_status || x.status || current.rental_status;
    const total = Number(x.total_quantity ?? x.total ?? current.total_quantity);
    const available = Number(x.available_quantity ?? x.available ?? current.available_quantity);
    const categoryName = x.category_name || x.category || current.category_name;
    const ageGroup = x.age_group || x.ageGroup || current.age_group;

    await query(
      `UPDATE inventory_items 
       SET title = ?, type = ?, category_name = ?, age_group = ?, author_or_brand = ?, 
           monthly_rental_fee = ?, condition_status = ?, rental_status = ?, 
           total_quantity = ?, available_quantity = ?, shelf_location = ?, description = ?
       WHERE id = ?`,
      [
        title,
        x.type || current.type,
        categoryName,
        ageGroup,
        x.author_or_brand ?? current.author_or_brand,
        fee,
        condition,
        status,
        total,
        available,
        x.shelf_location ?? current.shelf_location,
        x.description ?? current.description,
        current.id
      ]
    );

    const [updated] = await query("SELECT * FROM inventory_items WHERE id = ?", [current.id]);
    res.json({
      ...updated,
      item_id: updated.item_code,
      code: updated.item_code,
      name: updated.title,
      fee: Number(updated.monthly_rental_fee),
      status: updated.rental_status,
      condition: updated.condition_status,
      total: updated.total_quantity,
      available: updated.available_quantity
    });
  } catch (err) {
    console.error("Update item error:", err);
    res.status(500).json({ error: "Failed to update inventory item in database." });
  }
});

// DELETE /api/inventory/:id
router.delete("/:id", async (req, res) => {
  try {
    const idOrCode = req.params.id;
    const items = await query("SELECT id, item_code, rental_status FROM inventory_items WHERE id = ? OR item_code = ?", [Number(idOrCode) || 0, idOrCode]);
    if (!items.length) {
      return res.status(404).json({ error: "Inventory item not found." });
    }
    const item = items[0];

    // Check if active rentals exist for this item
    const activeRentals = await query(
      "SELECT id FROM rentals WHERE item_id = ? AND status IN ('Active', 'Due Soon', 'Overdue')",
      [item.id]
    );
    if (activeRentals.length > 0) {
      return res.status(400).json({
        error: `Cannot delete item ${item.item_code} because it is currently rented out in ${activeRentals.length} active rental order(s).`
      });
    }

    await query("DELETE FROM inventory_items WHERE id = ?", [item.id]);
    res.json({ success: true, message: `Item ${item.item_code} deleted successfully.` });
  } catch (err) {
    console.error("Delete item error:", err);
    res.status(500).json({ error: "Failed to delete item from database." });
  }
});

export default router;
