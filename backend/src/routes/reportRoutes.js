import express from "express";
import { query } from "../config/db.js";

const router = express.Router();

router.get("/summary", async (req, res) => {
  try {
    // 1. Overall stats
    const [finance] = await query(`
      SELECT 
        COALESCE(SUM(amount), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN payment_type = 'Subscription' THEN amount ELSE 0 END), 0) as subscription_revenue,
        COALESCE(SUM(CASE WHEN payment_type = 'Rental_Fee' THEN amount ELSE 0 END), 0) as rental_fee_revenue,
        COALESCE(SUM(CASE WHEN payment_type = 'Late_Fee' THEN amount ELSE 0 END), 0) as late_fee_revenue,
        COUNT(*) as total_transactions
      FROM payments 
      WHERE status = 'Completed'
    `);

    // 2. Inventory Utilization
    const utilization = await query(`
      SELECT 
        type, 
        COUNT(*) as total_titles,
        SUM(total_quantity) as total_units,
        SUM(available_quantity) as available_units,
        SUM(total_quantity - available_quantity) as rented_units,
        ROUND((SUM(total_quantity - available_quantity) / SUM(total_quantity)) * 100, 1) as utilization_pct
      FROM inventory_items
      GROUP BY type
    `);

    // 3. Top Rented Items
    const topRented = await query(`
      SELECT 
        i.item_code, i.title, i.type, i.category_name, 
        COUNT(r.id) as total_times_rented,
        SUM(r.monthly_fee) as total_rental_earnings
      FROM inventory_items i
      JOIN rentals r ON r.item_id = i.id
      GROUP BY i.id
      ORDER BY total_times_rented DESC
      LIMIT 5
    `);

    // 4. Overdue Accounts Breakdown
    const overdueList = await query(`
      SELECT 
        r.rental_code, r.customer_name, r.member_code, r.item_title, r.rent_date, r.due_date,
        DATEDIFF(CURDATE(), r.due_date) as days_overdue,
        ROUND(DATEDIFF(CURDATE(), r.due_date) * 1.00, 2) as estimated_late_fee
      FROM rentals r
      WHERE (r.status = 'Overdue' OR (r.status = 'Active' AND r.due_date < CURDATE())) AND r.return_date IS NULL
      ORDER BY days_overdue DESC
    `);

    res.json({
      finance: {
        totalRevenue: Number(finance.total_revenue),
        subscriptionRevenue: Number(finance.subscription_revenue),
        rentalFeeRevenue: Number(finance.rental_fee_revenue),
        lateFeeRevenue: Number(finance.late_fee_revenue),
        totalTransactions: Number(finance.total_transactions)
      },
      utilization,
      topRented,
      overdueList
    });
  } catch (err) {
    console.error("Report summary error:", err);
    res.status(500).json({ error: "Failed to generate report summary." });
  }
});

export default router;
