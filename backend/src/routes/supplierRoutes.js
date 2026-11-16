import express from "express";
import { query } from "../config/db.js";

const router = express.Router();

// GET /api/suppliers
router.get("/", async (req, res) => {
  try {
    const suppliers = await query(`
      SELECT s.*, 
        (SELECT COUNT(*) FROM procurement_orders po WHERE po.supplier_id = s.id) as order_count,
        (SELECT COALESCE(SUM(total_amount), 0) FROM procurement_orders po WHERE po.supplier_id = s.id) as total_procured_amount
      FROM suppliers s 
      ORDER BY s.id ASC
    `);
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch suppliers." });
  }
});

// POST /api/suppliers
router.post("/", async (req, res) => {
  try {
    const { name, contact_person, email, phone, address, items_supplied } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Supplier name is required." });
    }

    const result = await query(
      `INSERT INTO suppliers (name, contact_person, email, phone, address, items_supplied, status)
       VALUES (?, ?, ?, ?, ?, ?, 'Active')`,
      [name, contact_person || "", email || "", phone || "", address || "", items_supplied || ""]
    );

    const [newSup] = await query("SELECT * FROM suppliers WHERE id = ?", [result.insertId]);
    res.status(201).json(newSup);
  } catch (err) {
    res.status(500).json({ error: "Failed to add supplier." });
  }
});

// PUT /api/suppliers/:id
router.put("/:id", async (req, res) => {
  try {
    const { name, contact_person, email, phone, address, items_supplied, status } = req.body;
    const id = Number(req.params.id);

    await query(
      `UPDATE suppliers 
       SET name = COALESCE(?, name), contact_person = COALESCE(?, contact_person),
           email = COALESCE(?, email), phone = COALESCE(?, phone),
           address = COALESCE(?, address), items_supplied = COALESCE(?, items_supplied),
           status = COALESCE(?, status)
       WHERE id = ?`,
      [name, contact_person, email, phone, address, items_supplied, status, id]
    );

    const [updated] = await query("SELECT * FROM suppliers WHERE id = ?", [id]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update supplier." });
  }
});

// DELETE /api/suppliers/:id
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await query("DELETE FROM suppliers WHERE id = ?", [id]);
    res.json({ success: true, message: "Supplier deleted." });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete supplier." });
  }
});

export default router;
