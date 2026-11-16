import express from "express";
import { query } from "../config/db.js";

const router = express.Router();

// GET /api/customers (or /api/members)
router.get("/", async (req, res) => {
  try {
    const { plan, status, search } = req.query;
    let sql = `
      SELECT 
        c.*, 
        p.name as plan_name, 
        p.price as plan_price,
        p.max_books,
        p.max_toys,
        (SELECT COUNT(*) FROM rentals r WHERE r.customer_id = c.id AND r.status IN ('Active', 'Due Soon', 'Overdue')) as current_borrowed_count
      FROM customers c
      LEFT JOIN membership_plans p ON c.subscription_plan_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (plan && plan !== "All") {
      sql += " AND (c.subscription_plan_id = ? OR p.name = ?)";
      params.push(Number(plan) || 0, plan);
    }
    if (status && status !== "All") {
      sql += " AND c.status = ?";
      params.push(status);
    }
    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      sql += " AND (c.full_name LIKE ? OR c.member_code LIKE ? OR c.email LIKE ? OR c.phone LIKE ? OR c.city LIKE ?)";
      params.push(q, q, q, q, q);
    }

    sql += " ORDER BY c.id ASC";
    const rows = await query(sql, params);

    const mapped = rows.map(r => ({
      ...r,
      member_id: r.member_code,
      code: r.member_code,
      name: r.full_name,
      plan: r.plan_name || "Custom Plan",
      subscription_plan: r.plan_name || "Custom Plan",
      joinDate: r.join_date,
      maxItems: r.max_items_allowed,
      active_borrowings: r.current_borrowed_count || 0
    }));

    res.json(mapped);
  } catch (err) {
    console.error("Customers fetch error:", err);
    res.status(500).json({ error: "Failed to fetch customers from database." });
  }
});

// GET /api/customers/:id
router.get("/:id", async (req, res) => {
  try {
    const idOrCode = req.params.id;
    const rows = await query(
      `SELECT c.*, p.name as plan_name, p.price as plan_price, p.max_total_items 
       FROM customers c 
       LEFT JOIN membership_plans p ON c.subscription_plan_id = p.id 
       WHERE c.id = ? OR c.member_code = ?`,
      [Number(idOrCode) || 0, idOrCode]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Customer not found." });
    }
    const customer = rows[0];

    // Fetch customer's rentals
    const rentals = await query(
      "SELECT * FROM rentals WHERE customer_id = ? ORDER BY id DESC",
      [customer.id]
    );

    // Fetch customer's payments
    const payments = await query(
      "SELECT * FROM payments WHERE customer_id = ? ORDER BY id DESC",
      [customer.id]
    );

    res.json({
      ...customer,
      member_id: customer.member_code,
      code: customer.member_code,
      name: customer.full_name,
      plan: customer.plan_name || "Custom Plan",
      subscription_plan: customer.plan_name || "Custom Plan",
      joinDate: customer.join_date,
      maxItems: customer.max_items_allowed,
      rentals,
      payments
    });
  } catch (err) {
    console.error("Customer detail error:", err);
    res.status(500).json({ error: "Failed to load customer profile." });
  }
});

// POST /api/customers
router.post("/", async (req, res) => {
  try {
    const x = req.body;
    const name = x.full_name || x.name;
    if (!name) {
      return res.status(400).json({ error: "Customer full name is required." });
    }

    // Auto-generate code if missing
    let code = x.member_code || x.member_id || x.code;
    if (!code) {
      const [count] = await query("SELECT COUNT(*) as c FROM customers");
      code = `M10${(count.c || 0) + 1}`;
    }

    const planId = Number(x.subscription_plan_id) || 1;
    const plans = await query("SELECT * FROM membership_plans WHERE id = ? OR name = ?", [planId, x.subscription_plan || x.plan || ""]);
    const plan = plans[0] || null;
    const maxItems = Number(x.max_items_allowed || x.maxItems) || (plan ? plan.max_total_items : 2);

    const joinDate = x.join_date || x.joinDate || new Date().toISOString().slice(0, 10);
    const expDate = x.expiration_date || x.expirationDate || null;

    const result = await query(
      `INSERT INTO customers 
       (member_code, full_name, email, phone, address, city, subscription_plan_id, join_date, expiration_date, status, max_items_allowed, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        code,
        name,
        x.email || `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
        x.phone || "+1-555-0000",
        x.address || "",
        x.city || "New York",
        plan ? plan.id : planId,
        joinDate,
        expDate,
        x.status || "Active",
        maxItems,
        x.notes || ""
      ]
    );

    const [newCustomer] = await query(
      `SELECT c.*, p.name as plan_name 
       FROM customers c 
       LEFT JOIN membership_plans p ON c.subscription_plan_id = p.id 
       WHERE c.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      ...newCustomer,
      member_id: newCustomer.member_code,
      code: newCustomer.member_code,
      name: newCustomer.full_name,
      plan: newCustomer.plan_name || "Custom Plan",
      subscription_plan: newCustomer.plan_name || "Custom Plan",
      joinDate: newCustomer.join_date,
      maxItems: newCustomer.max_items_allowed
    });
  } catch (err) {
    console.error("Create customer error:", err);
    res.status(500).json({ error: "Failed to register customer in database." });
  }
});

// PUT /api/customers/:id
router.put("/:id", async (req, res) => {
  try {
    const idOrCode = req.params.id;
    const rows = await query("SELECT * FROM customers WHERE id = ? OR member_code = ?", [Number(idOrCode) || 0, idOrCode]);
    if (!rows.length) {
      return res.status(404).json({ error: "Customer not found." });
    }
    const current = rows[0];
    const x = req.body;

    const name = x.full_name || x.name || current.full_name;
    const planId = Number(x.subscription_plan_id) || current.subscription_plan_id;
    const status = x.status || current.status;
    const maxItems = Number(x.max_items_allowed ?? x.maxItems ?? current.max_items_allowed);

    await query(
      `UPDATE customers 
       SET full_name = ?, email = ?, phone = ?, address = ?, city = ?, 
           subscription_plan_id = ?, status = ?, max_items_allowed = ?, notes = ?
       WHERE id = ?`,
      [
        name,
        x.email || current.email,
        x.phone || current.phone,
        x.address || current.address,
        x.city || current.city,
        planId,
        status,
        maxItems,
        x.notes ?? current.notes,
        current.id
      ]
    );

    const [updated] = await query(
      `SELECT c.*, p.name as plan_name 
       FROM customers c 
       LEFT JOIN membership_plans p ON c.subscription_plan_id = p.id 
       WHERE c.id = ?`,
      [current.id]
    );

    res.json({
      ...updated,
      member_id: updated.member_code,
      code: updated.member_code,
      name: updated.full_name,
      plan: updated.plan_name || "Custom Plan",
      subscription_plan: updated.plan_name || "Custom Plan",
      joinDate: updated.join_date,
      maxItems: updated.max_items_allowed
    });
  } catch (err) {
    console.error("Update customer error:", err);
    res.status(500).json({ error: "Failed to update customer in database." });
  }
});

// PATCH /api/customers/:id/status
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Active", "Suspended", "Expired"].includes(status)) {
      return res.status(400).json({ error: "Invalid status. Must be Active, Suspended, or Expired." });
    }

    const idOrCode = req.params.id;
    await query("UPDATE customers SET status = ? WHERE id = ? OR member_code = ?", [status, Number(idOrCode) || 0, idOrCode]);
    res.json({ success: true, message: `Member status updated to ${status}.` });
  } catch (err) {
    res.status(500).json({ error: "Failed to update member status." });
  }
});

// DELETE /api/customers/:id
router.delete("/:id", async (req, res) => {
  try {
    const idOrCode = req.params.id;
    const rows = await query("SELECT id, member_code FROM customers WHERE id = ? OR member_code = ?", [Number(idOrCode) || 0, idOrCode]);
    if (!rows.length) {
      return res.status(404).json({ error: "Customer not found." });
    }
    const customer = rows[0];

    // Check if customer has active rentals
    const activeRentals = await query(
      "SELECT id FROM rentals WHERE customer_id = ? AND status IN ('Active', 'Due Soon', 'Overdue')",
      [customer.id]
    );
    if (activeRentals.length > 0) {
      return res.status(400).json({
        error: `Cannot delete member ${customer.member_code} with ${activeRentals.length} active rental(s). Return items first.`
      });
    }

    await query("DELETE FROM customers WHERE id = ?", [customer.id]);
    res.json({ success: true, message: `Member ${customer.member_code} deleted successfully.` });
  } catch (err) {
    console.error("Delete customer error:", err);
    res.status(500).json({ error: "Failed to delete customer." });
  }
});

export default router;
