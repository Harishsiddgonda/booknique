import express from "express";
import { query } from "../config/db.js";

const router = express.Router();

// GET /api/bookings - Returns all rentals & active bookings
router.get("/", async (req, res) => {
  try {
    const { status, customer_id } = req.query;
    let sql = `
      SELECT r.*, i.image_url, i.type as item_type, i.shelf_location, c.phone, c.address
      FROM rentals r
      LEFT JOIN inventory_items i ON r.item_id = i.id
      LEFT JOIN customers c ON r.customer_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += " AND r.status = ?";
      params.push(status);
    }
    if (customer_id) {
      sql += " AND r.customer_id = ?";
      params.push(Number(customer_id));
    }

    sql += " ORDER BY r.id DESC";
    const rows = await query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("Bookings fetch error:", err);
    res.status(500).json({ error: "Failed to fetch bookings." });
  }
});

// POST /api/bookings - Place new rental booking / reservation
router.post("/", async (req, res) => {
  try {
    const {
      customer_id,
      item_id,
      duration_days,
      delivery_address,
      notes
    } = req.body;

    if (!customer_id || !item_id) {
      return res.status(400).json({ error: "customer_id and item_id are required." });
    }

    // Verify item
    const items = await query("SELECT * FROM inventory_items WHERE id = ?", [Number(item_id)]);
    if (!items.length) {
      return res.status(404).json({ error: "Item not found in inventory." });
    }
    const item = items[0];
    if (item.available_quantity <= 0) {
      return res.status(400).json({ error: "Item is currently out of stock." });
    }

    // Verify customer
    const customers = await query("SELECT * FROM customers WHERE id = ?", [Number(customer_id)]);
    if (!customers.length) {
      return res.status(404).json({ error: "Customer record not found." });
    }
    const cust = customers[0];

    const rentalCode = `R${Date.now().toString().slice(-4)}`;
    const rentDate = new Date().toISOString().slice(0, 10);
    const days = Number(duration_days) || 30;
    const dueDateObj = new Date();
    dueDateObj.setDate(dueDateObj.getDate() + days);
    const dueDate = dueDateObj.toISOString().slice(0, 10);

    const monthlyFee = Number(item.monthly_rental_fee);
    const depositHeld = Number(item.security_deposit);

    await query(
      `INSERT INTO rentals
       (rental_code, customer_id, member_code, customer_name, item_id, item_code, item_title,
        rent_date, due_date, status, delivery_status, monthly_fee, deposit_held, condition_on_issue, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active', 'Order Placed', ?, ?, 'Good', ?)`,
      [
        rentalCode,
        cust.id,
        cust.member_code,
        cust.full_name,
        item.id,
        item.item_code,
        item.title,
        rentDate,
        dueDate,
        monthlyFee,
        depositHeld,
        notes || `Delivery to: ${delivery_address || cust.address}`
      ]
    );

    // Update inventory quantity
    await query(
      "UPDATE inventory_items SET available_quantity = available_quantity - 1 WHERE id = ?",
      [item.id]
    );

    // Generate Invoice / Payment Record
    const invNumber = `INV-${Date.now().toString().slice(-6)}`;
    await query(
      `INSERT INTO payments
       (invoice_number, customer_id, customer_name, amount, payment_type, payment_method, status, transaction_ref, notes, payment_date)
       VALUES (?, ?, ?, ?, 'Rental_Fee', 'UPI', 'Completed', ?, ?, ?)`,
      [
        invNumber,
        cust.id,
        cust.full_name,
        monthlyFee,
        `UPI/${Date.now().toString().slice(-8)}`,
        `Rental fee for ${item.title} (${days} days)`,
        rentDate
      ]
    );

    res.status(201).json({
      success: true,
      message: "Rental booking created successfully!",
      rental_code: rentalCode,
      invoice_number: invNumber
    });
  } catch (err) {
    console.error("Booking creation error:", err);
    res.status(500).json({ error: err.message || "Failed to create booking." });
  }
});

export default router;
