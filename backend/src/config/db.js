import mysql from "mysql2/promise";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "rsr_rental_db",
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  decimalNumbers: true
};

let pool = null;

export async function initDatabase() {
  try {
    // Step 1: Connect to MySQL server without database to ensure database exists
    const initConn = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
    });

    await initConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await initConn.end();

    // Step 2: Create connection pool with target database
    pool = mysql.createPool(dbConfig);
    const conn = await pool.getConnection();
    console.log(`[Database] Connected to MySQL (${dbConfig.database}) at ${dbConfig.host}:${dbConfig.port}`);

    // Step 3: Run table migrations
    await runMigrations(conn);

    // Step 4: Seed initial data if database is fresh
    await seedInitialData(conn);

    conn.release();
    return pool;
  } catch (error) {
    console.error("[Database] Initialization error:", error.message);
    throw error;
  }
}

async function runMigrations(conn) {
  // 1. Users Table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(120) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('admin', 'staff', 'customer') DEFAULT 'customer',
      phone VARCHAR(25),
      avatar VARCHAR(255),
      status ENUM('Active', 'Suspended', 'Inactive') DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_user_email (email),
      INDEX idx_user_role (role)
    ) ENGINE=InnoDB;
  `);

  // 2. Membership Plans Table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS membership_plans (
      id INT AUTO_INCREMENT PRIMARY KEY,
      code VARCHAR(30) NOT NULL UNIQUE,
      name VARCHAR(100) NOT NULL,
      price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      duration_days INT DEFAULT 30,
      max_books INT DEFAULT 2,
      max_toys INT DEFAULT 1,
      max_total_items INT DEFAULT 3,
      description TEXT,
      status ENUM('Active', 'Inactive') DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  // 3. Customers / Members Table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS customers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NULL,
      member_code VARCHAR(30) NOT NULL UNIQUE,
      full_name VARCHAR(120) NOT NULL,
      email VARCHAR(120) NOT NULL,
      phone VARCHAR(30) NOT NULL,
      address VARCHAR(255),
      city VARCHAR(100) DEFAULT 'Bengaluru',
      subscription_plan_id INT NULL,
      join_date DATE NOT NULL,
      expiration_date DATE NULL,
      status ENUM('Active', 'Suspended', 'Expired') DEFAULT 'Active',
      max_items_allowed INT DEFAULT 2,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (subscription_plan_id) REFERENCES membership_plans(id) ON DELETE SET NULL,
      INDEX idx_member_code (member_code),
      INDEX idx_cust_status (status)
    ) ENGINE=InnoDB;
  `);

  // 4. Categories Table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      type ENUM('Book', 'Toy', 'General') DEFAULT 'General',
      slug VARCHAR(120) NOT NULL UNIQUE,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  // 5. Inventory Items Table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS inventory_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      item_code VARCHAR(30) NOT NULL UNIQUE,
      title VARCHAR(200) NOT NULL,
      type ENUM('Book', 'Toy') NOT NULL,
      category_id INT NULL,
      category_name VARCHAR(100),
      age_group VARCHAR(50) DEFAULT 'All ages',
      author_or_brand VARCHAR(120),
      isbn_or_model VARCHAR(100),
      monthly_rental_fee DECIMAL(10,2) NOT NULL DEFAULT 149.00,
      security_deposit DECIMAL(10,2) DEFAULT 300.00,
      replacement_cost DECIMAL(10,2) DEFAULT 750.00,
      total_quantity INT DEFAULT 1,
      available_quantity INT DEFAULT 1,
      condition_status ENUM('New', 'Excellent', 'Good', 'Needs Inspection', 'Damaged') DEFAULT 'Good',
      rental_status ENUM('Available', 'Rented', 'Maintenance', 'Retired') DEFAULT 'Available',
      shelf_location VARCHAR(50),
      description TEXT,
      image_url VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
      INDEX idx_item_code (item_code),
      INDEX idx_item_type (type),
      INDEX idx_item_status (rental_status)
    ) ENGINE=InnoDB;
  `);

  // 6. Suppliers Table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS suppliers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      contact_person VARCHAR(100),
      email VARCHAR(120),
      phone VARCHAR(40),
      address VARCHAR(255),
      items_supplied VARCHAR(255),
      status ENUM('Active', 'Inactive') DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  // 7. Procurement Orders Table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS procurement_orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_number VARCHAR(50) NOT NULL UNIQUE,
      supplier_id INT NULL,
      order_date DATE NOT NULL,
      expected_date DATE,
      received_date DATE,
      total_amount DECIMAL(10,2) DEFAULT 0.00,
      payment_status ENUM('Unpaid', 'Partial', 'Paid') DEFAULT 'Unpaid',
      status ENUM('Ordered', 'Received', 'Cancelled') DEFAULT 'Ordered',
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
    ) ENGINE=InnoDB;
  `);

  // 8. Procurement Items
  await conn.query(`
    CREATE TABLE IF NOT EXISTS procurement_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      procurement_id INT NOT NULL,
      item_id INT NULL,
      item_title VARCHAR(200) NOT NULL,
      quantity INT DEFAULT 1,
      unit_cost DECIMAL(10,2) DEFAULT 0.00,
      total_cost DECIMAL(10,2) DEFAULT 0.00,
      FOREIGN KEY (procurement_id) REFERENCES procurement_orders(id) ON DELETE CASCADE,
      FOREIGN KEY (item_id) REFERENCES inventory_items(id) ON DELETE SET NULL
    ) ENGINE=InnoDB;
  `);

  // 9. Rental Transactions Table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS rentals (
      id INT AUTO_INCREMENT PRIMARY KEY,
      rental_code VARCHAR(40) NOT NULL UNIQUE,
      customer_id INT NOT NULL,
      member_code VARCHAR(30) NOT NULL,
      customer_name VARCHAR(120) NOT NULL,
      item_id INT NOT NULL,
      item_code VARCHAR(30) NOT NULL,
      item_title VARCHAR(200) NOT NULL,
      rent_date DATE NOT NULL,
      due_date DATE NOT NULL,
      return_date DATE NULL,
      status ENUM('Active', 'Due Soon', 'Overdue', 'Returned', 'Cancelled') DEFAULT 'Active',
      delivery_status ENUM('Order Placed', 'Packed', 'Out for Delivery', 'Delivered', 'Returned to Store') DEFAULT 'Order Placed',
      monthly_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      late_fee_charged DECIMAL(10,2) DEFAULT 0.00,
      deposit_held DECIMAL(10,2) DEFAULT 0.00,
      condition_on_issue VARCHAR(50) DEFAULT 'Good',
      condition_on_return VARCHAR(100) DEFAULT 'Pending',
      issue_staff_id INT NULL,
      return_staff_id INT NULL,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
      FOREIGN KEY (item_id) REFERENCES inventory_items(id) ON DELETE RESTRICT,
      INDEX idx_rental_code (rental_code),
      INDEX idx_rental_status (status),
      INDEX idx_rent_due (due_date)
    ) ENGINE=InnoDB;
  `);

  // 10. Payments & Invoices Table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS payments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      invoice_number VARCHAR(50) NOT NULL UNIQUE,
      rental_id INT NULL,
      customer_id INT NULL,
      customer_name VARCHAR(120) NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      payment_type ENUM('Subscription', 'Rental_Fee', 'Late_Fee', 'Deposit', 'Damage_Fee', 'Deposit_Refund') DEFAULT 'Rental_Fee',
      payment_method ENUM('Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Cash', 'PayPal', 'Apple Pay') DEFAULT 'Credit Card',
      status ENUM('Completed', 'Pending', 'Failed', 'Refunded') DEFAULT 'Completed',
      transaction_ref VARCHAR(100),
      notes TEXT,
      payment_date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (rental_id) REFERENCES rentals(id) ON DELETE SET NULL,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
      INDEX idx_inv_num (invoice_number),
      INDEX idx_pay_date (payment_date)
    ) ENGINE=InnoDB;
  `);

  // 11. Notifications Table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NULL,
      customer_id INT NULL,
      title VARCHAR(150) NOT NULL,
      message TEXT NOT NULL,
      type ENUM('info', 'success', 'warning', 'danger') DEFAULT 'info',
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  // 12. Audit Logs Table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NULL,
      user_name VARCHAR(100),
      action VARCHAR(80) NOT NULL,
      entity_type VARCHAR(60),
      entity_id VARCHAR(60),
      details TEXT,
      ip_address VARCHAR(45),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB;
  `);

  console.log("[Database] All 12 relational tables verified / created successfully.");
}

async function seedInitialData(conn) {
  // Check if users table already seeded
  const [existingUsers] = await conn.query("SELECT COUNT(*) as count FROM users;");
  if (existingUsers[0].count > 0) {
    return; // Already seeded
  }

  console.log("[Database] Fresh database detected. Seeding comprehensive production records...");

  const adminHash = await bcrypt.hash("Admin@123", 10);
  const staffHash = await bcrypt.hash("Staff@123", 10);
  const userHash = await bcrypt.hash("Customer@123", 10);

  // 1. Seed Users
  await conn.query(`
    INSERT INTO users (name, email, password, role, phone, status) VALUES
    ('Store Administrator', 'admin@rsr.com', '${adminHash}', 'admin', '+1-555-0001', 'Active'),
    ('Operations Staff', 'staff@rsr.com', '${staffHash}', 'staff', '+1-555-0002', 'Active'),
    ('Sarah Jenkins', 'sarah.jenkins@example.com', '${userHash}', 'customer', '+1-555-0101', 'Active'),
    ('David Chen', 'david.chen@example.com', '${userHash}', 'customer', '+1-555-0102', 'Active'),
    ('Elena Rostova', 'elena.rostova@example.com', '${userHash}', 'customer', '+1-555-0103', 'Suspended'),
    ('Marcus Brody', 'marcus.brody@example.com', '${userHash}', 'customer', '+1-555-0104', 'Active');
  `);

  // 2. Seed Membership Plans (INR)
  await conn.query(`
    INSERT INTO membership_plans (code, name, price, duration_days, max_books, max_toys, max_total_items, description, status) VALUES
    ('PLAN-BASIC', 'Basic (Books Only)', 499.00, 30, 2, 0, 2, '2 books at a time. Ideal for young readers and book lovers.', 'Active'),
    ('PLAN-PREMIUM', 'Premium (Books + Toys)', 999.00, 30, 2, 2, 4, 'Balanced combination of 2 books and 2 toys with free doorstep collection.', 'Active'),
    ('PLAN-TODDLER', 'Toddler Starter', 749.00, 30, 1, 1, 2, '1 board book + 1 educational sensory toy tailored for ages 0-3 years.', 'Active'),
    ('PLAN-FAMILY', 'Family Mega', 1799.00, 30, 4, 4, 8, 'Up to 8 items simultaneously for siblings and large families.', 'Active');
  `);

  // 3. Seed Categories
  await conn.query(`
    INSERT INTO categories (name, type, slug, description) VALUES
    ('Board Book', 'Book', 'board-book', 'Durable, sturdy books designed for babies and toddlers.'),
    ('Fantasy Fiction', 'Book', 'fantasy-fiction', 'Imaginative magical adventures and middle-grade fiction.'),
    ('Picture Book', 'Book', 'picture-book', 'Richly illustrated storybooks for preschoolers and early readers.'),
    ('STEM & Science', 'Book', 'stem-science', 'Science, engineering, robotics and nature exploration books.'),
    ('Building Blocks', 'Toy', 'building-blocks', 'Lego, wooden blocks and spatial architectural construction toys.'),
    ('Playsets / Trains', 'Toy', 'playsets-trains', 'Vehicle tracks, railway sets and interactive pretend playsets.'),
    ('Infant Development', 'Toy', 'infant-development', 'Sensory gyms, rattles and auditory coordination toys.'),
    ('Puzzles & Brainteasers', 'Toy', 'puzzles', 'Jigsaw, peg puzzles and spatial logic games.');
  `);

  // 4. Seed Customers (linked to users and plans)
  await conn.query(`
    INSERT INTO customers (user_id, member_code, full_name, email, phone, address, city, subscription_plan_id, join_date, expiration_date, status, max_items_allowed, notes) VALUES
    (3, 'M101', 'Sarah Jenkins', 'sarah.jenkins@example.com', '+91 9731597313', '4th Floor, Above Titan Eye Plus, Neeladri Road, ECITY-1', 'Bengaluru', 1, '2026-01-15', '2027-01-15', 'Active', 2, 'Prefers board books and nature stories.'),
    (4, 'M102', 'David Chen', 'david.chen@example.com', '+91 9845012345', 'Flat 402, Shriram Summit, Neeladri Road, Electronic City Phase 1', 'Bengaluru', 2, '2026-03-22', '2027-03-22', 'Active', 4, 'Subscribed to premium mix. Prompt returns.'),
    (5, 'M103', 'Elena Rostova', 'elena.rostova@example.com', '+91 9900112233', 'Villa 18, Concorde Silicon Valley, Electronic City', 'Bengaluru', 3, '2026-05-10', '2027-05-10', 'Suspended', 2, 'Account temporarily suspended due to overdue item and outstanding late fee.'),
    (6, 'M104', 'Marcus Brody', 'marcus.brody@example.com', '+91 9000357691', 'Apt 12B, Prestige Sunrise Park, Neo Town, ECITY-1', 'Bengaluru', 4, '2026-08-01', '2027-08-01', 'Active', 8, 'Family membership with 3 children.');
  `);

  // 5. Seed Inventory Items (matching BookNique catalog)
  await conn.query(`
    INSERT INTO inventory_items (item_code, title, type, category_id, category_name, age_group, author_or_brand, isbn_or_model, monthly_rental_fee, security_deposit, replacement_cost, total_quantity, available_quantity, condition_status, rental_status, shelf_location, description, image_url) VALUES
    ('B001', 'The Very Hungry Caterpillar', 'Book', 1, 'Board Book', '0-3 years', 'Eric Carle', '978-0399226908', 149.00, 300.00, 650.00, 3, 2, 'Excellent', 'Available', 'Shelf A-1', 'Classic interactive children picture board book about metamorphosis.', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'),
    ('B002', 'Harry Potter & the Sorcerer''s Stone', 'Book', 2, 'Fantasy Fiction', '9-12 years', 'J.K. Rowling', '978-0590353427', 249.00, 400.00, 850.00, 1, 0, 'Good', 'Rented', 'Shelf B-3', 'Illustrated edition of the beloved fantasy novel.', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80'),
    ('B003', 'Where the Wild Things Are', 'Book', 3, 'Picture Book', '4-8 years', 'Maurice Sendak', '978-0060254926', 179.00, 350.00, 700.00, 2, 2, 'Excellent', 'Available', 'Shelf A-2', 'Caldecott Medal winner classic story of Max and his imagination.', 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80'),
    ('B004', 'Goodnight Moon', 'Book', 1, 'Board Book', '0-3 years', 'Margaret Wise Brown', '978-0694003617', 149.00, 300.00, 600.00, 2, 2, 'Excellent', 'Available', 'Shelf A-1', 'Quiet bedtime rhyming board book for infants.', 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=600&q=80'),
    ('T001', 'Lego Classic Bricks Box (790 Pcs)', 'Toy', 5, 'Building Blocks', '4+ years', 'LEGO', 'LEGO-10698', 499.00, 1200.00, 3200.00, 3, 3, 'Good', 'Available', 'Bin T-12', 'Comprehensive collection of colorful building bricks with windows and doors.', 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=600&q=80'),
    ('T002', 'Melissa & Doug Wooden Railway', 'Toy', 6, 'Playsets / Trains', '3-6 years', 'Melissa & Doug', 'MD-1706', 699.00, 1500.00, 4500.00, 1, 0, 'Good', 'Rented', 'Bin T-05', '100-piece solid wood track layout with train cars and scenery.', 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80'),
    ('T003', 'Fisher-Price Kick & Play Piano', 'Toy', 7, 'Infant Development', '0-12 months', 'Fisher-Price', 'FP-CCB70', 399.00, 900.00, 2800.00, 1, 0, 'Needs Inspection', 'Maintenance', 'Bin T-01', 'Deluxe baby sensory activity mat with light-up piano keys.', 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=600&q=80'),
    ('T004', 'Wooden Alphabet & Shape Puzzle', 'Toy', 8, 'Puzzles & Brainteasers', '2-5 years', 'Hape Toys', 'HP-0211', 249.00, 500.00, 1400.00, 2, 2, 'Excellent', 'Available', 'Bin T-08', 'Eco-friendly non-toxic wooden puzzle for letter recognition.', 'https://images.unsplash.com/photo-1500990702037-7620ccb6a60a?auto=format&fit=crop&w=600&q=80');
  `);

  // 6. Seed Rental Transactions (INR)
  await conn.query(`
    INSERT INTO rentals (rental_code, customer_id, member_code, customer_name, item_id, item_code, item_title, rent_date, due_date, return_date, status, delivery_status, monthly_fee, late_fee_charged, deposit_held, condition_on_issue, condition_on_return) VALUES
    ('R8001', 1, 'M101', 'Sarah Jenkins', 1, 'B001', 'The Very Hungry Caterpillar', '2026-10-01', '2026-10-15', '2026-10-14', 'Returned', 'Returned to Store', 149.00, 0.00, 300.00, 'Excellent', 'Excellent'),
    ('R8002', 2, 'M102', 'David Chen', 6, 'T002', 'Melissa & Doug Wooden Railway', '2026-10-05', '2026-11-05', NULL, 'Active', 'Delivered', 699.00, 0.00, 1500.00, 'Good', 'Pending'),
    ('R8003', 3, 'M103', 'Elena Rostova', 7, 'T003', 'Fisher-Price Kick & Play Piano', '2026-09-10', '2026-10-10', '2026-10-15', 'Returned', 'Returned to Store', 399.00, 250.00, 900.00, 'Excellent', 'Good (Slight wear)'),
    ('R8004', 4, 'M104', 'Marcus Brody', 2, 'B002', 'Harry Potter & the Sorcerer''s Stone', '2026-11-01', '2026-12-01', NULL, 'Active', 'Out for Delivery', 249.00, 0.00, 400.00, 'Good', 'Pending');
  `);

  // 7. Seed Payments & Invoices (INR)
  await conn.query(`
    INSERT INTO payments (invoice_number, rental_id, customer_id, customer_name, amount, payment_type, payment_method, status, transaction_ref, notes, payment_date) VALUES
    ('INV-8001', 1, 1, 'Sarah Jenkins', 149.00, 'Rental_Fee', 'UPI', 'Completed', 'TXN-998231', 'Monthly rental checkout for B001', '2026-10-01'),
    ('INV-8002', 2, 2, 'David Chen', 699.00, 'Rental_Fee', 'Net Banking', 'Completed', 'TXN-998232', 'Monthly rental checkout for T002', '2026-10-05'),
    ('INV-8003', 3, 3, 'Elena Rostova', 649.00, 'Late_Fee', 'Credit Card', 'Completed', 'TXN-998233', 'Includes ₹399 rental fee + ₹250 overdue fee (5 days @ ₹50/day)', '2026-10-15'),
    ('INV-8004', 4, 4, 'Marcus Brody', 249.00, 'Rental_Fee', 'UPI', 'Completed', 'TXN-998234', 'Monthly rental checkout for B002', '2026-11-01');
  `);

  // 8. Seed Suppliers (Bengaluru / India)
  await conn.query(`
    INSERT INTO suppliers (name, contact_person, email, phone, address, items_supplied, status) VALUES
    ('Scholastic India Pvt Ltd', 'Emily Watson', 'orders@scholastic.co.in', '+91 80 4123 4567', 'Koramangala 4th Block, Bengaluru, Karnataka', 'Children Books, Board Books, Educational Readers', 'Active'),
    ('Lego India Distribution', 'Henrik Larsen', 'b2b@lego.co.in', '+91 80 6789 0123', 'Whitefield Main Road, Bengaluru, Karnataka', 'Lego Classic, Duplo, Technic Kits', 'Active'),
    ('Melissa & Doug India Trade', 'Rebecca Miller', 'wholesale@melissaanddoug.co.in', '+91 80 2345 6789', 'Indiranagar 100ft Road, Bengaluru, Karnataka', 'Wooden railway, puzzles, preschool sets', 'Active'),
    ('Mattel & Fisher-Price India', 'Carlos Santos', 'trade@mattel.co.in', '+91 80 3456 7890', 'HSR Layout Sector 1, Bengaluru, Karnataka', 'Sensory gym, activity pianos, infant toys', 'Active');
  `);

  // 9. Seed Procurement Orders (INR)
  await conn.query(`
    INSERT INTO procurement_orders (order_number, supplier_id, order_date, expected_date, received_date, total_amount, payment_status, status, notes) VALUES
    ('PO-2026-001', 1, '2026-09-15', '2026-09-25', '2026-09-24', 24500.00, 'Paid', 'Received', 'Restock 35 copies of bestselling early-reader and STEM titles.'),
    ('PO-2026-002', 2, '2026-10-20', '2026-11-15', NULL, 65000.00, 'Partial', 'Ordered', 'Procurement of 25 building block and robotics kits for holiday season.');
  `);

  // 10. Seed Notifications
  await conn.query(`
    INSERT INTO notifications (user_id, customer_id, title, message, type) VALUES
    (1, NULL, 'System Initialized', 'RSR Books & Toys Rental Platform connected to MySQL.', 'success'),
    (1, NULL, 'Maintenance Alert', 'Item T003 (Fisher-Price Kick & Play Piano) requires quality inspection.', 'warning'),
    (5, 3, 'Account Suspended Notice', 'Elena Rostova: Your account was suspended due to overdue rental R8003. Contact store.', 'danger'),
    (4, 2, 'Rental Return Reminder', 'David Chen: Melissa & Doug Wooden Railway is due for return soon.', 'info');
  `);

  console.log("[Database] Production dataset seeded successfully!");
}

export async function query(sql, params) {
  if (!pool) {
    await initDatabase();
  }
  const [rows] = await pool.query(sql, params);
  return rows;
}

export async function executeTransaction(callback) {
  if (!pool) {
    await initDatabase();
  }
  const conn = await pool.getConnection();
  await conn.beginTransaction();
  try {
    const result = await callback(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export default {
  initDatabase,
  query,
  executeTransaction,
  getPool: () => pool
};
