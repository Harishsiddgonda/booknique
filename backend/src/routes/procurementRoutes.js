import express from "express";
import { query, executeTransaction } from "../config/db.js";

const router = express.Router();

// GET /api/procurement
router.get("/", async (req, res) => {
  try {
    const orders = await query(`
      SELECT po.*, s.name as supplier_name, s.email as supplier_email, s.phone as supplier_phone
      FROM procurement_orders po
      LEFT JOIN suppliers s ON po.supplier_id = s.id
      ORDER BY po.id DESC
    `);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch procurement orders." });
  }
});

// POST /api/procurement
router.post("/", async (req, res) => {
  try {
    const { supplier_id, order_date, expected_date, total_amount, payment_status, notes, items } = req.body;
    const supplierId = Number(supplier_id);
    if (!supplierId) {
      return res.status(400).json({ error: "Supplier is required for procurement order." });
    }

    const [countRows] = await query("SELECT COUNT(*) as c FROM procurement_orders");
    const orderNumber = `PO-2026-00${(countRows[0].c || 0) + 1}`;
    const orderDate = order_date || new Date().toISOString().slice(0, 10);

    const result = await executeTransaction(async (conn) => {
      const [orderRes] = await conn.query(
        `INSERT INTO procurement_orders 
         (order_number, supplier_id, order_date, expected_date, total_amount, payment_status, status, notes)
         VALUES (?, ?, ?, ?, ?, ?, 'Ordered', ?)`,
        [
          orderNumber,
          supplierId,
          orderDate,
          expected_date || null,
          Number(total_amount || 0),
          payment_status || "Unpaid",
          notes || ""
        ]
      );
      const poId = orderRes.insertId;

      if (Array.isArray(items) && items.length > 0) {
        for (const item of items) {
          await conn.query(
            `INSERT INTO procurement_items (procurement_id, item_id, item_title, quantity, unit_cost, total_cost)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              poId,
              item.item_id || null,
              item.title || "Procured Item",
              Number(item.quantity) || 1,
              Number(item.unit_cost) || 0,
              Number((item.quantity || 1) * (item.unit_cost || 0))
            ]
          );
        }
      }

      return poId;
    });

    const [newOrder] = await query(
      `SELECT po.*, s.name as supplier_name 
       FROM procurement_orders po 
       LEFT JOIN suppliers s ON po.supplier_id = s.id 
       WHERE po.id = ?`,
      [result]
    );

    res.status(201).json(newOrder);
  } catch (err) {
    console.error("Create PO error:", err);
    res.status(500).json({ error: "Failed to create procurement order." });
  }
});

// PATCH /api/procurement/:id/receive (Mark Received & Increment Inventory Stock)
router.patch("/:id/receive", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const today = new Date().toISOString().slice(0, 10);

    await executeTransaction(async (conn) => {
      await conn.query(
        "UPDATE procurement_orders SET status = 'Received', received_date = ? WHERE id = ?",
        [today, id]
      );

      // Fetch items in this procurement order
      const [pItems] = await conn.query(
        "SELECT * FROM procurement_items WHERE procurement_id = ?",
        [id]
      );

      // Increment stock for linked items
      for (const pi of pItems) {
        if (pi.item_id) {
          await conn.query(
            "UPDATE inventory_items SET total_quantity = total_quantity + ?, available_quantity = available_quantity + ? WHERE id = ?",
            [pi.quantity, pi.quantity, pi.item_id]
          );
        }
      }
    });

    res.json({ success: true, message: "Procurement order received and inventory stock updated." });
  } catch (err) {
    console.error("Receive PO error:", err);
    res.status(500).json({ error: "Failed to receive procurement order." });
  }
});

export default router;
