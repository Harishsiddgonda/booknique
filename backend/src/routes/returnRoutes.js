import express from "express";
import { query } from "../config/db.js";

const router = express.Router();

// GET /api/returns/pending - Items currently rented out and pending return
router.get("/pending", async (req, res) => {
  try {
    const rows = await query(`
      SELECT r.*, i.replacement_cost, i.security_deposit, c.phone, c.address
      FROM rentals r
      JOIN inventory_items i ON r.item_id = i.id
      JOIN customers c ON r.customer_id = c.id
      WHERE r.status IN ('Active', 'Due Soon', 'Overdue')
      ORDER BY r.due_date ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error("Pending returns error:", err);
    res.status(500).json({ error: "Failed to fetch pending returns." });
  }
});

// POST /api/returns/process - Process an item return
router.post("/process", async (req, res) => {
  try {
    const {
      rental_id,
      condition_on_return,
      damage_fee,
      notes,
      staff_id
    } = req.body;

    if (!rental_id) {
      return res.status(400).json({ error: "rental_id is required." });
    }

    const rentals = await query("SELECT * FROM rentals WHERE id = ?", [Number(rental_id)]);
    if (!rentals.length) {
      return res.status(404).json({ error: "Rental record not found." });
    }
    const rental = rentals[0];

    const returnDate = new Date().toISOString().slice(0, 10);
    const dueDate = new Date(rental.due_date);
    const today = new Date();
    
    // Auto-calculate late fee: ₹30/day overdue
    let lateDays = 0;
    if (today > dueDate) {
      const diffTime = Math.abs(today - dueDate);
      lateDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    const lateFeeRate = 30.00;
    const calculatedLateFee = lateDays * lateFeeRate;
    const damageFeeVal = Number(damage_fee) || 0.00;

    // Update rental record
    await query(
      `UPDATE rentals
       SET return_date = ?,
           status = 'Returned',
           delivery_status = 'Returned to Store',
           late_fee_charged = ?,
           condition_on_return = ?,
           return_staff_id = ?,
           notes = CONCAT(COALESCE(notes, ''), ' | Return Note: ', ?)
       WHERE id = ?`,
      [
        returnDate,
        calculatedLateFee,
        condition_on_return || "Good",
        staff_id || 1,
        notes || "Processed via return desk.",
        rental.id
      ]
    );

    // Increment inventory available_quantity
    await query(
      `UPDATE inventory_items
       SET available_quantity = available_quantity + 1,
           condition_status = ?,
           rental_status = 'Available'
       WHERE id = ?`,
      [condition_on_return || "Good", rental.item_id]
    );

    // If late fee or damage fee exists, record invoice
    if (calculatedLateFee > 0 || damageFeeVal > 0) {
      const totalPenalty = calculatedLateFee + damageFeeVal;
      const invNumber = `INV-PEN-${Date.now().toString().slice(-6)}`;
      await query(
        `INSERT INTO payments
         (invoice_number, rental_id, customer_id, customer_name, amount, payment_type, payment_method, status, transaction_ref, notes, payment_date)
         VALUES (?, ?, ?, ?, ?, 'Late_Fee', 'UPI', 'Completed', ?, ?, ?)`,
        [
          invNumber,
          rental.id,
          rental.customer_id,
          rental.customer_name,
          totalPenalty,
          `UPI/PEN/${Date.now().toString().slice(-6)}`,
          `Return charges: Late fee ₹${calculatedLateFee} (${lateDays} days) + Damage fee ₹${damageFeeVal}`,
          returnDate
        ]
      );
    }

    res.json({
      success: true,
      message: `Item return processed successfully! ${lateDays > 0 ? `Late fee applied: ₹${calculatedLateFee} (${lateDays} days).` : "No late fee incurred."}`,
      late_days: lateDays,
      late_fee: calculatedLateFee,
      damage_fee: damageFeeVal
    });
  } catch (err) {
    console.error("Return processing error:", err);
    res.status(500).json({ error: err.message || "Failed to process return." });
  }
});

export default router;
