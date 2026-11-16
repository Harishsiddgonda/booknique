import express from "express";
import { query } from "../config/db.js";

const router = express.Router();

// GET /api/payments
router.get("/", async (req, res) => {
  try {
    const { customer_id, payment_type, status, search } = req.query;
    let sql = `
      SELECT p.*, c.member_code, r.rental_code, r.item_title
      FROM payments p
      LEFT JOIN customers c ON p.customer_id = c.id
      LEFT JOIN rentals r ON p.rental_id = r.id
      WHERE 1=1
    `;
    const params = [];

    if (customer_id) {
      sql += " AND p.customer_id = ?";
      params.push(Number(customer_id));
    }
    if (payment_type && payment_type !== "All") {
      sql += " AND p.payment_type = ?";
      params.push(payment_type);
    }
    if (status && status !== "All") {
      sql += " AND p.status = ?";
      params.push(status);
    }
    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      sql += " AND (p.invoice_number LIKE ? OR p.customer_name LIKE ? OR p.transaction_ref LIKE ?)";
      params.push(q, q, q);
    }

    sql += " ORDER BY p.id DESC";
    const rows = await query(sql, params);

    const mapped = rows.map(r => ({
      ...r,
      memberId: r.member_code || "",
      amount: Number(r.amount),
      date: r.payment_date ? r.payment_date.toISOString().slice(0, 10) : "",
      customer: r.customer_name
    }));

    res.json(mapped);
  } catch (err) {
    console.error("Payments fetch error:", err);
    res.status(500).json({ error: "Failed to fetch payments." });
  }
});

// GET /api/payments/:id (Invoice Details)
router.get("/:id", async (req, res) => {
  try {
    const idOrInv = req.params.id;
    const rows = await query(
      `SELECT p.*, c.member_code, c.email as customer_email, c.phone as customer_phone, c.address as customer_address,
              r.rental_code, r.item_title, r.rent_date, r.due_date, r.return_date, r.late_fee_charged
       FROM payments p
       LEFT JOIN customers c ON p.customer_id = c.id
       LEFT JOIN rentals r ON p.rental_id = r.id
       WHERE p.id = ? OR p.invoice_number = ?`,
      [Number(idOrInv) || 0, idOrInv]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Invoice/Payment not found." });
    }

    const inv = rows[0];
    res.json({
      ...inv,
      amount: Number(inv.amount),
      date: inv.payment_date ? inv.payment_date.toISOString().slice(0, 10) : "",
      customer: inv.customer_name,
      memberId: inv.member_code
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to load invoice." });
  }
});

// POST /api/payments
router.post("/", async (req, res) => {
  try {
    const x = req.body;
    const customer = x.customer || x.customer_name;
    const amount = Number(x.amount);
    if (!customer || !amount || amount <= 0) {
      return res.status(400).json({ error: "Customer name and positive amount are required." });
    }

    // Lookup customer id if available
    const customers = await query(
      "SELECT id, member_code FROM customers WHERE full_name = ? OR member_code = ? LIMIT 1",
      [customer, customer]
    );
    const customerId = customers.length ? customers[0].id : null;
    const memberCode = customers.length ? customers[0].member_code : "";

    const [countRows] = await query("SELECT COUNT(*) as c FROM payments");
    const invNumber = x.invoice_number || `INV-${Math.floor(Math.random() * 89999 + 10000)}`;
    const paymentDate = x.payment_date || x.date || new Date().toISOString().slice(0, 10);

    const result = await query(
      `INSERT INTO payments 
       (invoice_number, rental_id, customer_id, customer_name, amount, payment_type, payment_method, status, transaction_ref, notes, payment_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        invNumber,
        x.rental_id || null,
        customerId,
        customer,
        amount,
        x.payment_type || "Rental_Fee",
        x.method || x.payment_method || "Credit Card",
        x.status || "Completed",
        x.transaction_ref || `TXN-${Math.floor(Math.random() * 899999 + 100000)}`,
        x.notes || "Manual payment record",
        paymentDate
      ]
    );

    const [newPayment] = await query("SELECT * FROM payments WHERE id = ?", [result.insertId]);
    res.status(201).json({
      ...newPayment,
      memberId: memberCode,
      amount: Number(newPayment.amount),
      date: newPayment.payment_date ? newPayment.payment_date.toISOString().slice(0, 10) : "",
      customer: newPayment.customer_name
    });
  } catch (err) {
    console.error("Record payment error:", err);
    res.status(500).json({ error: "Failed to record payment in database." });
  }
});

// DELETE /api/payments/:id
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await query("DELETE FROM payments WHERE id = ?", [id]);
    res.json({ success: true, message: "Payment record deleted." });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete payment." });
  }
});

export default router;
