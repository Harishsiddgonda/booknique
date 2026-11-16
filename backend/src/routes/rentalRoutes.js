import express from "express";
import { query, executeTransaction } from "../config/db.js";

const router = express.Router();

// GET /api/rentals
router.get("/", async (req, res) => {
  try {
    const { status, customer_id, member_code, search } = req.query;
    let sql = `
      SELECT 
        r.*, 
        c.email as customer_email, 
        c.phone as customer_phone,
        c.status as customer_status,
        i.category_name, 
        i.type as item_type,
        i.condition_status as current_item_condition
      FROM rentals r
      LEFT JOIN customers c ON r.customer_id = c.id
      LEFT JOIN inventory_items i ON r.item_id = i.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== "All") {
      sql += " AND r.status = ?";
      params.push(status);
    }
    if (customer_id) {
      sql += " AND r.customer_id = ?";
      params.push(Number(customer_id));
    }
    if (member_code) {
      sql += " AND r.member_code = ?";
      params.push(member_code);
    }
    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      sql += " AND (r.rental_code LIKE ? OR r.customer_name LIKE ? OR r.item_title LIKE ? OR r.item_code LIKE ?)";
      params.push(q, q, q, q);
    }

    sql += " ORDER BY r.id DESC";
    const rows = await query(sql, params);

    const mapped = rows.map(r => ({
      ...r,
      rental_id: r.rental_code,
      code: r.rental_code,
      member_id: r.member_code,
      memberId: r.member_code,
      customer: r.customer_name,
      item_id: r.item_code,
      itemId: r.item_code,
      item: r.item_title,
      rent_date: r.rent_date ? r.rent_date.toISOString().slice(0, 10) : "",
      date: r.rent_date ? r.rent_date.toISOString().slice(0, 10) : "",
      due_date: r.due_date ? r.due_date.toISOString().slice(0, 10) : "",
      dueDate: r.due_date ? r.due_date.toISOString().slice(0, 10) : "",
      return_date: r.return_date ? r.return_date.toISOString().slice(0, 10) : null,
      returnDate: r.return_date ? r.return_date.toISOString().slice(0, 10) : null,
      late_fee_charged: Number(r.late_fee_charged || 0),
      lateFee: Number(r.late_fee_charged || 0),
      amount: Number(r.monthly_fee || 0),
      item_condition_on_return: r.condition_on_return || "Pending"
    }));

    res.json(mapped);
  } catch (err) {
    console.error("Rentals fetch error:", err);
    res.status(500).json({ error: "Failed to fetch rental transactions from database." });
  }
});

// POST /api/rentals (Issue / Checkout Rental)
router.post("/", async (req, res) => {
  try {
    const x = req.body;
    const customerIdentifier = x.customer_id || x.member_id || x.memberId || x.customer;
    const itemIdentifier = x.item_id || x.itemId || x.item || x.item_code;

    if (!customerIdentifier || !itemIdentifier) {
      return res.status(400).json({ error: "Customer and item are required to issue a rental." });
    }

    const result = await executeTransaction(async (conn) => {
      // 1. Lock customer row for quota calculation
      const [customers] = await conn.query(
        `SELECT c.*, p.name as plan_name, p.max_total_items 
         FROM customers c 
         LEFT JOIN membership_plans p ON c.subscription_plan_id = p.id 
         WHERE c.id = ? OR c.member_code = ? OR c.full_name = ? FOR UPDATE`,
        [Number(customerIdentifier) || 0, customerIdentifier, customerIdentifier]
      );

      if (!customers.length) {
        throw new Error("Customer not found.");
      }
      const customer = customers[0];

      if (customer.status === "Suspended") {
        throw new Error("Customer account is Suspended due to unpaid dues or overdue items. Cannot issue rental.");
      }
      if (customer.status === "Expired") {
        throw new Error("Customer subscription plan has expired. Please renew first.");
      }

      // Check current active borrowings against quota
      const [activeRentals] = await conn.query(
        "SELECT COUNT(*) as count FROM rentals WHERE customer_id = ? AND status IN ('Active', 'Due Soon', 'Overdue')",
        [customer.id]
      );
      const activeCount = activeRentals[0].count;
      const quota = customer.max_items_allowed || (customer.max_total_items || 2);

      if (activeCount >= quota) {
        throw new Error(`Customer quota reached (${activeCount}/${quota} items currently borrowed). Return an item first.`);
      }

      // 2. Lock item row and verify stock
      const [items] = await conn.query(
        `SELECT * FROM inventory_items 
         WHERE id = ? OR item_code = ? OR title = ? FOR UPDATE`,
        [Number(itemIdentifier) || 0, itemIdentifier, itemIdentifier]
      );

      if (!items.length) {
        throw new Error("Inventory item not found.");
      }
      const item = items[0];

      if (item.rental_status === "Maintenance") {
        throw new Error(`Item ${item.item_code} is currently under Maintenance.`);
      }
      if (item.rental_status === "Retired") {
        throw new Error(`Item ${item.item_code} has been Retired from rental catalog.`);
      }
      if (item.available_quantity < 1 || item.rental_status === "Rented") {
        throw new Error(`Item "${item.title}" is currently out of stock or already rented out.`);
      }

      // 3. Decrement available quantity
      const newAvailable = Math.max(0, item.available_quantity - 1);
      const newStatus = newAvailable === 0 ? "Rented" : "Available";

      await conn.query(
        "UPDATE inventory_items SET available_quantity = ?, rental_status = ? WHERE id = ?",
        [newAvailable, newStatus, item.id]
      );

      // 4. Generate Rental Code
      const [rentalCount] = await conn.query("SELECT COUNT(*) as c FROM rentals");
      const rentalCode = `R800${(rentalCount[0].c || 0) + 1}`;

      const rentDate = x.rent_date || x.date || new Date().toISOString().slice(0, 10);
      let dueDate = x.due_date || x.dueDate;
      if (!dueDate) {
        const d = new Date(rentDate);
        d.setDate(d.getDate() + 30);
        dueDate = d.toISOString().slice(0, 10);
      }

      const monthlyFee = Number(x.amount || x.monthly_fee || item.monthly_rental_fee || 3.00);

      // 5. Insert Rental Record
      const [rRes] = await conn.query(
        `INSERT INTO rentals 
         (rental_code, customer_id, member_code, customer_name, item_id, item_code, item_title, rent_date, due_date, status, delivery_status, monthly_fee, late_fee_charged, deposit_held, condition_on_issue, condition_on_return, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active', 'Order Placed', ?, 0.00, ?, ?, 'Pending', ?)`,
        [
          rentalCode,
          customer.id,
          customer.member_code,
          customer.full_name,
          item.id,
          item.item_code,
          item.title,
          rentDate,
          dueDate,
          monthlyFee,
          item.security_deposit || 0.00,
          item.condition_status || "Good",
          x.notes || "Standard issue"
        ]
      );

      const rentalId = rRes.insertId;

      // 6. Automatically generate Payment / Invoice record
      const [payCount] = await conn.query("SELECT COUNT(*) as c FROM payments");
      const invoiceNumber = `INV-${rentalCode.replace("R", "") || (payCount[0].c + 8000)}`;

      await conn.query(
        `INSERT INTO payments 
         (invoice_number, rental_id, customer_id, customer_name, amount, payment_type, payment_method, status, transaction_ref, notes, payment_date)
         VALUES (?, ?, ?, ?, ?, 'Rental_Fee', 'Credit Card', 'Completed', ?, ?, ?)`,
        [
          invoiceNumber,
          rentalId,
          customer.id,
          customer.full_name,
          monthlyFee,
          `TXN-${Math.floor(Math.random() * 899999 + 100000)}`,
          `Rental checkout fee for ${item.title} (${item.item_code})`,
          rentDate
        ]
      );

      // 7. Notification
      await conn.query(
        `INSERT INTO notifications (customer_id, title, message, type)
         VALUES (?, 'Rental Order Placed', ?, 'info')`,
        [customer.id, `Rental ${rentalCode} for "${item.title}" successfully recorded. Due on ${dueDate}.`]
      );

      return { rentalId, rentalCode, customer, item, rentDate, dueDate, monthlyFee };
    });

    res.status(201).json({
      success: true,
      message: `Rental order ${result.rentalCode} issued successfully.`,
      rental_id: result.rentalCode,
      code: result.rentalCode,
      customer: result.customer.full_name,
      item: result.item.title,
      dueDate: result.dueDate,
      amount: result.monthlyFee
    });
  } catch (err) {
    console.error("Issue rental error:", err);
    res.status(400).json({ error: err.message || "Failed to process rental." });
  }
});

// PATCH /api/rentals/:id/return (Process Return & Inspect Condition)
router.patch("/:id/return", async (req, res) => {
  try {
    const idOrCode = req.params.id;
    const { condition, return_date, notes } = req.body;

    const result = await executeTransaction(async (conn) => {
      // 1. Fetch and lock rental record
      const [rentals] = await conn.query(
        "SELECT * FROM rentals WHERE id = ? OR rental_code = ? FOR UPDATE",
        [Number(idOrCode) || 0, idOrCode]
      );

      if (!rentals.length) {
        throw new Error("Rental record not found.");
      }
      const rental = rentals[0];

      if (rental.status === "Returned") {
        return { alreadyReturned: true, rental };
      }

      const returnDate = return_date || new Date().toISOString().slice(0, 10);
      const dueDate = new Date(rental.due_date);
      const retDateObj = new Date(returnDate);

      // 2. Automatic Late Fee Calculation: ₹50.00 per day overdue
      let lateFee = 0.00;
      if (retDateObj > dueDate) {
        const diffMs = retDateObj - dueDate;
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays > 0) {
          lateFee = Number((diffDays * 50.00).toFixed(2));
        }
      }

      const returnCondition = condition || "Good (Inspected)";

      // 3. Update rental record
      await conn.query(
        `UPDATE rentals 
         SET status = 'Returned', delivery_status = 'Returned to Store', 
             return_date = ?, late_fee_charged = ?, condition_on_return = ?, notes = COALESCE(?, notes)
         WHERE id = ?`,
        [returnDate, lateFee, returnCondition, notes, rental.id]
      );

      // 4. Restore inventory item stock
      const [items] = await conn.query("SELECT * FROM inventory_items WHERE id = ? FOR UPDATE", [rental.item_id]);
      if (items.length) {
        const item = items[0];
        const newAvailable = Math.min(item.total_quantity, item.available_quantity + 1);
        await conn.query(
          "UPDATE inventory_items SET available_quantity = ?, rental_status = 'Available' WHERE id = ?",
          [newAvailable, item.id]
        );
      }

      // 5. If late fee occurred, generate an invoice for the late fee
      if (lateFee > 0) {
        const lateInvNumber = `INV-LATE-${rental.rental_code.replace("R", "")}`;
        await conn.query(
          `INSERT INTO payments 
           (invoice_number, rental_id, customer_id, customer_name, amount, payment_type, payment_method, status, notes, payment_date)
           VALUES (?, ?, ?, ?, ?, 'Late_Fee', 'Credit Card', 'Completed', ?, ?)`,
          [
            lateInvNumber,
            rental.id,
            rental.customer_id,
            rental.customer_name,
            lateFee,
            `Automated overdue late fee for rental ${rental.rental_code}`,
            returnDate
          ]
        );
      }

      return { rental, returnDate, lateFee, returnCondition };
    });

    res.json({
      success: true,
      message: result.alreadyReturned
        ? "Rental already marked as returned."
        : `Item returned successfully.${result.lateFee > 0 ? ` Overdue late fee of ₹${result.lateFee} charged.` : ""}`,
      lateFee: result.lateFee || 0.00,
      returnDate: result.returnDate
    });
  } catch (err) {
    console.error("Process return error:", err);
    res.status(400).json({ error: err.message || "Failed to process return." });
  }
});

// PATCH /api/rentals/:id/delivery
router.patch("/:id/delivery", async (req, res) => {
  try {
    const idOrCode = req.params.id;
    const { deliveryStatus } = req.body;
    if (!deliveryStatus) {
      return res.status(400).json({ error: "Delivery status is required." });
    }

    await query(
      "UPDATE rentals SET delivery_status = ? WHERE id = ? OR rental_code = ?",
      [deliveryStatus, Number(idOrCode) || 0, idOrCode]
    );

    res.json({ success: true, message: `Delivery status updated to ${deliveryStatus}.` });
  } catch (err) {
    res.status(500).json({ error: "Failed to update delivery status." });
  }
});

// DELETE /api/rentals/:id
router.delete("/:id", async (req, res) => {
  try {
    const idOrCode = req.params.id;
    const rentals = await query("SELECT * FROM rentals WHERE id = ? OR rental_code = ?", [Number(idOrCode) || 0, idOrCode]);
    if (!rentals.length) {
      return res.status(404).json({ error: "Rental record not found." });
    }
    const rental = rentals[0];

    // If deleting an Active rental, restore stock
    if (rental.status !== "Returned") {
      await query(
        "UPDATE inventory_items SET available_quantity = available_quantity + 1, rental_status = 'Available' WHERE id = ?",
        [rental.item_id]
      );
    }

    await query("DELETE FROM rentals WHERE id = ?", [rental.id]);
    res.json({ success: true, message: `Rental record ${rental.rental_code} deleted successfully.` });
  } catch (err) {
    console.error("Delete rental error:", err);
    res.status(500).json({ error: "Failed to delete rental record." });
  }
});

export default router;
