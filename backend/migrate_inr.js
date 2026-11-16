import { initDatabase, query } from './src/config/db.js';

async function run() {
  await initDatabase();
  console.log("Migrating MySQL database to Indian Rupees (INR)...");

  // Update membership plans
  await query("UPDATE membership_plans SET price = 499.00 WHERE code = 'PLAN-BASIC'");
  await query("UPDATE membership_plans SET price = 999.00 WHERE code = 'PLAN-PREMIUM'");
  await query("UPDATE membership_plans SET price = 749.00 WHERE code = 'PLAN-TODDLER'");
  await query("UPDATE membership_plans SET price = 1799.00 WHERE code = 'PLAN-FAMILY'");

  // Update inventory items with high-res cover images and INR pricing
  await query(`
    UPDATE inventory_items 
    SET monthly_rental_fee = 149.00, security_deposit = 300.00, replacement_cost = 650.00, 
        image_url = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80' 
    WHERE item_code = 'B001'
  `);
  await query(`
    UPDATE inventory_items 
    SET monthly_rental_fee = 249.00, security_deposit = 400.00, replacement_cost = 850.00, 
        image_url = 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80' 
    WHERE item_code = 'B002'
  `);
  await query(`
    UPDATE inventory_items 
    SET monthly_rental_fee = 179.00, security_deposit = 350.00, replacement_cost = 700.00, 
        image_url = 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80' 
    WHERE item_code = 'B003'
  `);
  await query(`
    UPDATE inventory_items 
    SET monthly_rental_fee = 149.00, security_deposit = 300.00, replacement_cost = 600.00, 
        image_url = 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=600&q=80' 
    WHERE item_code = 'B004'
  `);
  await query(`
    UPDATE inventory_items 
    SET monthly_rental_fee = 499.00, security_deposit = 1200.00, replacement_cost = 3200.00, 
        image_url = 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=600&q=80' 
    WHERE item_code = 'T001'
  `);
  await query(`
    UPDATE inventory_items 
    SET monthly_rental_fee = 699.00, security_deposit = 1500.00, replacement_cost = 4500.00, 
        image_url = 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80' 
    WHERE item_code = 'T002'
  `);
  await query(`
    UPDATE inventory_items 
    SET monthly_rental_fee = 399.00, security_deposit = 900.00, replacement_cost = 2800.00, 
        image_url = 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=600&q=80' 
    WHERE item_code = 'T003'
  `);
  await query(`
    UPDATE inventory_items 
    SET monthly_rental_fee = 249.00, security_deposit = 500.00, replacement_cost = 1400.00, 
        image_url = 'https://images.unsplash.com/photo-1500990702037-7620ccb6a60a?auto=format&fit=crop&w=600&q=80' 
    WHERE item_code = 'T004'
  `);

  // Insert additional items if missing
  await query(`
    INSERT IGNORE INTO inventory_items (item_code, title, type, category_id, category_name, age_group, author_or_brand, isbn_or_model, monthly_rental_fee, security_deposit, replacement_cost, total_quantity, available_quantity, condition_status, rental_status, shelf_location, description, image_url)
    VALUES 
    ('B005', 'Panchatantra Illustrated Tales', 'Book', 3, 'Picture Book', '4-8 years', 'Vishnu Sharma / ACK', '978-8184820003', 149.00, 300.00, 550.00, 3, 3, 'Excellent', 'Available', 'Shelf A-3', 'Classic Indian moral fables with rich colorful illustrations.', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80'),
    ('B006', 'The Magic of the Lost Temple', 'Book', 2, 'Fantasy Fiction', '7-12 years', 'Sudha Murty', '978-0143333165', 199.00, 350.00, 650.00, 2, 2, 'New', 'Available', 'Shelf B-1', 'Exciting adventure story set in an ancient Karnataka village.', 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=600&q=80'),
    ('T005', 'Magna-Tiles Magnetic STEM Set', 'Toy', 5, 'Building Blocks', '3+ years', 'Magna-Tiles', 'MT-32PC', 599.00, 1200.00, 3500.00, 2, 2, 'Excellent', 'Available', 'Bin T-10', '32 translucent magnetic shapes for 3D spatial creativity and architectural play.', 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=600&q=80'),
    ('T006', 'Mechanix Robotic Motion Kit', 'Toy', 4, 'STEM & Science', '8+ years', 'Zephyr Toys', 'MX-ROBO4', 649.00, 1400.00, 3800.00, 2, 2, 'New', 'Available', 'Bin T-15', 'Engineering construction kit with motors, gears, and robotics assemblies.', 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80')
  `);

  // Update existing rentals
  await query("UPDATE rentals SET monthly_fee = 149.00, deposit_held = 300.00, late_fee_charged = 0.00 WHERE rental_code = 'R8001'");
  await query("UPDATE rentals SET monthly_fee = 699.00, deposit_held = 1500.00, late_fee_charged = 0.00 WHERE rental_code = 'R8002'");
  await query("UPDATE rentals SET monthly_fee = 399.00, deposit_held = 900.00, late_fee_charged = 250.00 WHERE rental_code = 'R8003'");
  await query("UPDATE rentals SET monthly_fee = 249.00, deposit_held = 400.00, late_fee_charged = 0.00 WHERE rental_code = 'R8004'");

  // Update existing payments
  await query("UPDATE payments SET amount = 149.00, notes = 'Monthly rental checkout for B001' WHERE invoice_number = 'INV-8001'");
  await query("UPDATE payments SET amount = 699.00, notes = 'Monthly rental checkout for T002' WHERE invoice_number = 'INV-8002'");
  await query("UPDATE payments SET amount = 649.00, notes = 'Includes ₹399 rental fee + ₹250 overdue fee (5 days @ ₹50/day)' WHERE invoice_number = 'INV-8003'");
  await query("UPDATE payments SET amount = 249.00, notes = 'Monthly rental checkout for B002' WHERE invoice_number = 'INV-8004'");

  // Update procurement
  await query("UPDATE procurement_orders SET total_amount = 24500.00, notes = 'Restock 35 copies of bestselling early-reader and STEM titles.' WHERE order_number = 'PO-2026-001'");
  await query("UPDATE procurement_orders SET total_amount = 65000.00, notes = 'Procurement of 25 building block and robotics kits for holiday season.' WHERE order_number = 'PO-2026-002'");

  // Update customer addresses to Electronic City Bengaluru (matching user's uploaded banner)
  await query("UPDATE customers SET address = '4th Floor, Above Titan Eye Plus, Neeladri Road, ECITY-1', city = 'Bengaluru', phone = '+91 9731597313' WHERE member_code = 'M101'");
  await query("UPDATE customers SET address = 'Flat 402, Shriram Summit, Neeladri Road, Electronic City Phase 1', city = 'Bengaluru', phone = '+91 9845012345' WHERE member_code = 'M102'");
  await query("UPDATE customers SET address = 'Villa 18, Concorde Silicon Valley, Electronic City', city = 'Bengaluru', phone = '+91 9900112233' WHERE member_code = 'M103'");
  await query("UPDATE customers SET address = 'Apt 12B, Prestige Sunrise Park, Neo Town, ECITY-1', city = 'Bengaluru', phone = '+91 9000357691' WHERE member_code = 'M104'");

  // Update suppliers
  await query("UPDATE suppliers SET name = 'Scholastic India Pvt Ltd', contact_person = 'Emily Watson', phone = '+91 80 4123 4567', address = 'Koramangala 4th Block, Bengaluru, Karnataka' WHERE id = 1");
  await query("UPDATE suppliers SET name = 'Lego India Distribution', contact_person = 'Henrik Larsen', phone = '+91 80 6789 0123', address = 'Whitefield Main Road, Bengaluru, Karnataka' WHERE id = 2");
  await query("UPDATE suppliers SET name = 'Melissa & Doug India Trade', contact_person = 'Rebecca Miller', phone = '+91 80 2345 6789', address = 'Indiranagar 100ft Road, Bengaluru, Karnataka' WHERE id = 3");
  await query("UPDATE suppliers SET name = 'Mattel & Fisher-Price India', contact_person = 'Carlos Santos', phone = '+91 80 3456 7890', address = 'HSR Layout Sector 1, Bengaluru, Karnataka' WHERE id = 4");

  console.log("MySQL INR Migration successfully applied!");
  process.exit(0);
}

run().catch(err => {
  console.error("Migration error:", err);
  process.exit(1);
});
