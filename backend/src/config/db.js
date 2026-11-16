import mysql from "mysql2/promise";
import pg from "pg";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

const isPostgres = Boolean(
  process.env.DATABASE_URL &&
  (process.env.DATABASE_URL.startsWith("postgres://") || process.env.DATABASE_URL.startsWith("postgresql://"))
) || process.env.DB_CLIENT === "postgres";

const mysqlConfig = {
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

export function getDatabaseDriver() {
  return isPostgres ? "postgres" : "mysql";
}

export async function initDatabase() {
  try {
    if (isPostgres) {
      console.log("[Database] Connecting to PostgreSQL on Render / Cloud...");
      const pgPool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: (process.env.DATABASE_URL.includes("localhost") || process.env.DATABASE_URL.includes("127.0.0.1"))
          ? false
          : { rejectUnauthorized: false }
      });

      const client = await pgPool.connect();
      console.log("[Database] Connected successfully to PostgreSQL!");
      pool = pgPool;

      await runPostgresMigrations(client);
      await seedPostgresData(client);
      client.release();
      return pool;
    } else {
      // Connect to MySQL server without database first to ensure database exists
      const initConn = await mysql.createConnection({
        host: mysqlConfig.host,
        port: mysqlConfig.port,
        user: mysqlConfig.user,
        password: mysqlConfig.password,
      });

      await initConn.query(`CREATE DATABASE IF NOT EXISTS \`${mysqlConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
      await initConn.end();

      // Create connection pool with target database
      pool = mysql.createPool(mysqlConfig);
      const conn = await pool.getConnection();
      console.log(`[Database] Connected to MySQL (${mysqlConfig.database}) at ${mysqlConfig.host}:${mysqlConfig.port}`);

      // Run table migrations
      await runMysqlMigrations(conn);

      // Seed initial data if database is fresh
      await seedMysqlData(conn);

      conn.release();
      return pool;
    }
  } catch (error) {
    console.error("[Database] Initialization error:", error.message);
    throw error;
  }
}

// -------------------------------------------------------------
// Universal Query Interface
// -------------------------------------------------------------
export async function query(sql, params = []) {
  if (!pool) {
    await initDatabase();
  }

  if (isPostgres) {
    // Convert ? to $1, $2, $3...
    let paramIndex = 1;
    const pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
    const res = await pool.query(pgSql, params);
    return res.rows;
  } else {
    const [rows] = await pool.query(sql, params);
    return rows;
  }
}

export async function executeTransaction(callback) {
  if (!pool) {
    await initDatabase();
  }

  if (isPostgres) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const txQuery = async (sql, params = []) => {
        let paramIndex = 1;
        const pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
        const res = await client.query(pgSql, params);
        return res.rows;
      };
      const result = await callback({ query: txQuery });
      await client.query("COMMIT");
      return result;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } else {
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
}

// -------------------------------------------------------------
// MySQL Migrations
// -------------------------------------------------------------
async function runMysqlMigrations(conn) {
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
      payment_method ENUM('Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Cash', 'PayPal', 'Apple Pay', 'Razorpay') DEFAULT 'UPI',
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

  // 13. Damages Table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS damages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      rental_id INT NULL,
      item_id INT NOT NULL,
      customer_id INT NULL,
      damage_type VARCHAR(80) NOT NULL,
      severity ENUM('Low', 'Medium', 'Critical') DEFAULT 'Low',
      repair_cost DECIMAL(10,2) DEFAULT 0.00,
      fee_charged DECIMAL(10,2) DEFAULT 0.00,
      fee_status ENUM('Unpaid', 'Paid', 'Waived') DEFAULT 'Unpaid',
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (item_id) REFERENCES inventory_items(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  // 14. Discounts Table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS discounts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      code VARCHAR(50) NOT NULL UNIQUE,
      discount_percent DECIMAL(5,2) DEFAULT 0.00,
      fixed_amount DECIMAL(10,2) DEFAULT 0.00,
      min_order_amount DECIMAL(10,2) DEFAULT 0.00,
      max_discount_amount DECIMAL(10,2) DEFAULT 0.00,
      expiry_date DATE,
      usage_limit INT DEFAULT 100,
      used_count INT DEFAULT 0,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  // 15. Reviews Table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      item_id INT NOT NULL,
      customer_name VARCHAR(120) NOT NULL,
      rating INT NOT NULL DEFAULT 5,
      comment TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (item_id) REFERENCES inventory_items(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  // 16. Store Settings Table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS store_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      setting_key VARCHAR(100) NOT NULL UNIQUE,
      setting_value TEXT,
      description VARCHAR(255),
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  console.log("[Database] All MySQL tables verified / created successfully.");
}

// -------------------------------------------------------------
// PostgreSQL Migrations (Render Cloud Compatible)
// -------------------------------------------------------------
async function runPostgresMigrations(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(120) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(30) DEFAULT 'customer',
      phone VARCHAR(25),
      avatar VARCHAR(255),
      status VARCHAR(30) DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS membership_plans (
      id SERIAL PRIMARY KEY,
      code VARCHAR(30) NOT NULL UNIQUE,
      name VARCHAR(100) NOT NULL,
      price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      duration_days INT DEFAULT 30,
      max_books INT DEFAULT 2,
      max_toys INT DEFAULT 1,
      max_total_items INT DEFAULT 3,
      description TEXT,
      status VARCHAR(30) DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS customers (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE SET NULL,
      member_code VARCHAR(30) NOT NULL UNIQUE,
      full_name VARCHAR(120) NOT NULL,
      email VARCHAR(120) NOT NULL,
      phone VARCHAR(30) NOT NULL,
      address VARCHAR(255),
      city VARCHAR(100) DEFAULT 'Bengaluru',
      subscription_plan_id INT REFERENCES membership_plans(id) ON DELETE SET NULL,
      join_date DATE NOT NULL,
      expiration_date DATE,
      status VARCHAR(30) DEFAULT 'Active',
      max_items_allowed INT DEFAULT 2,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      type VARCHAR(30) DEFAULT 'General',
      slug VARCHAR(120) NOT NULL UNIQUE,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS inventory_items (
      id SERIAL PRIMARY KEY,
      item_code VARCHAR(30) NOT NULL UNIQUE,
      title VARCHAR(200) NOT NULL,
      type VARCHAR(30) NOT NULL,
      category_id INT REFERENCES categories(id) ON DELETE SET NULL,
      category_name VARCHAR(100),
      age_group VARCHAR(50) DEFAULT 'All ages',
      author_or_brand VARCHAR(120),
      isbn_or_model VARCHAR(100),
      monthly_rental_fee DECIMAL(10,2) NOT NULL DEFAULT 149.00,
      security_deposit DECIMAL(10,2) DEFAULT 300.00,
      replacement_cost DECIMAL(10,2) DEFAULT 750.00,
      total_quantity INT DEFAULT 1,
      available_quantity INT DEFAULT 1,
      condition_status VARCHAR(50) DEFAULT 'Good',
      rental_status VARCHAR(50) DEFAULT 'Available',
      shelf_location VARCHAR(50),
      description TEXT,
      image_url VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS suppliers (
      id SERIAL PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      contact_person VARCHAR(100),
      email VARCHAR(120),
      phone VARCHAR(40),
      address VARCHAR(255),
      items_supplied VARCHAR(255),
      status VARCHAR(30) DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS procurement_orders (
      id SERIAL PRIMARY KEY,
      order_number VARCHAR(50) NOT NULL UNIQUE,
      supplier_id INT REFERENCES suppliers(id) ON DELETE SET NULL,
      order_date DATE NOT NULL,
      expected_date DATE,
      received_date DATE,
      total_amount DECIMAL(10,2) DEFAULT 0.00,
      payment_status VARCHAR(30) DEFAULT 'Unpaid',
      status VARCHAR(30) DEFAULT 'Ordered',
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS procurement_items (
      id SERIAL PRIMARY KEY,
      procurement_id INT REFERENCES procurement_orders(id) ON DELETE CASCADE,
      item_id INT REFERENCES inventory_items(id) ON DELETE SET NULL,
      item_title VARCHAR(200) NOT NULL,
      quantity INT DEFAULT 1,
      unit_cost DECIMAL(10,2) DEFAULT 0.00,
      total_cost DECIMAL(10,2) DEFAULT 0.00
    );

    CREATE TABLE IF NOT EXISTS rentals (
      id SERIAL PRIMARY KEY,
      rental_code VARCHAR(40) NOT NULL UNIQUE,
      customer_id INT REFERENCES customers(id) ON DELETE RESTRICT,
      member_code VARCHAR(30) NOT NULL,
      customer_name VARCHAR(120) NOT NULL,
      item_id INT REFERENCES inventory_items(id) ON DELETE RESTRICT,
      item_code VARCHAR(30) NOT NULL,
      item_title VARCHAR(200) NOT NULL,
      rent_date DATE NOT NULL,
      due_date DATE NOT NULL,
      return_date DATE,
      status VARCHAR(50) DEFAULT 'Active',
      delivery_status VARCHAR(50) DEFAULT 'Order Placed',
      monthly_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      late_fee_charged DECIMAL(10,2) DEFAULT 0.00,
      deposit_held DECIMAL(10,2) DEFAULT 0.00,
      condition_on_issue VARCHAR(50) DEFAULT 'Good',
      condition_on_return VARCHAR(100) DEFAULT 'Pending',
      issue_staff_id INT,
      return_staff_id INT,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      invoice_number VARCHAR(50) NOT NULL UNIQUE,
      rental_id INT REFERENCES rentals(id) ON DELETE SET NULL,
      customer_id INT REFERENCES customers(id) ON DELETE SET NULL,
      customer_name VARCHAR(120) NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      payment_type VARCHAR(50) DEFAULT 'Rental_Fee',
      payment_method VARCHAR(50) DEFAULT 'UPI',
      status VARCHAR(50) DEFAULT 'Completed',
      transaction_ref VARCHAR(100),
      notes TEXT,
      payment_date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      customer_id INT REFERENCES customers(id) ON DELETE CASCADE,
      title VARCHAR(150) NOT NULL,
      message TEXT NOT NULL,
      type VARCHAR(30) DEFAULT 'info',
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE SET NULL,
      user_name VARCHAR(100),
      action VARCHAR(80) NOT NULL,
      entity_type VARCHAR(60),
      entity_id VARCHAR(60),
      details TEXT,
      ip_address VARCHAR(45),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS damages (
      id SERIAL PRIMARY KEY,
      rental_id INT,
      item_id INT REFERENCES inventory_items(id) ON DELETE CASCADE,
      customer_id INT,
      damage_type VARCHAR(80) NOT NULL,
      severity VARCHAR(30) DEFAULT 'Low',
      repair_cost DECIMAL(10,2) DEFAULT 0.00,
      fee_charged DECIMAL(10,2) DEFAULT 0.00,
      fee_status VARCHAR(30) DEFAULT 'Unpaid',
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS discounts (
      id SERIAL PRIMARY KEY,
      code VARCHAR(50) NOT NULL UNIQUE,
      discount_percent DECIMAL(5,2) DEFAULT 0.00,
      fixed_amount DECIMAL(10,2) DEFAULT 0.00,
      min_order_amount DECIMAL(10,2) DEFAULT 0.00,
      max_discount_amount DECIMAL(10,2) DEFAULT 0.00,
      expiry_date DATE,
      usage_limit INT DEFAULT 100,
      used_count INT DEFAULT 0,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      item_id INT REFERENCES inventory_items(id) ON DELETE CASCADE,
      customer_name VARCHAR(120) NOT NULL,
      rating INT NOT NULL DEFAULT 5,
      comment TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS store_settings (
      id SERIAL PRIMARY KEY,
      setting_key VARCHAR(100) NOT NULL UNIQUE,
      setting_value TEXT,
      description VARCHAR(255),
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log("[Database] All PostgreSQL tables verified / created successfully on Render!");
}

// -------------------------------------------------------------
// Seeding Helpers
// -------------------------------------------------------------
async function seedMysqlData(conn) {
  const [existingUsers] = await conn.query("SELECT COUNT(*) as count FROM users;");
  if (existingUsers[0].count > 0) return;

  console.log("[Database] Fresh MySQL detected. Seeding production records...");
  await executeSeedInserts(conn.query.bind(conn));
}

async function seedPostgresData(client) {
  const res = await client.query("SELECT COUNT(*) as count FROM users;");
  if (Number(res.rows[0].count) > 0) return;

  console.log("[Database] Fresh PostgreSQL detected. Seeding production records...");
  await executeSeedInserts(client.query.bind(client));
}

async function executeSeedInserts(exec) {
  const adminHash = await bcrypt.hash("Admin@123", 10);
  const staffHash = await bcrypt.hash("Staff@123", 10);
  const userHash = await bcrypt.hash("Customer@123", 10);

  // 1. Users
  await exec(`
    INSERT INTO users (name, email, password, role, phone, status) VALUES
    ('Store Administrator', 'admin@rsr.com', '${adminHash}', 'admin', '+91 9000357691', 'Active'),
    ('Operations Staff', 'staff@rsr.com', '${staffHash}', 'staff', '+91 9731597313', 'Active'),
    ('Sarah Jenkins', 'sarah.jenkins@example.com', '${userHash}', 'customer', '+91 9845010001', 'Active'),
    ('David Chen', 'david.chen@example.com', '${userHash}', 'customer', '+91 9845010002', 'Active'),
    ('Elena Rostova', 'elena.rostova@example.com', '${userHash}', 'customer', '+91 9845010003', 'Suspended'),
    ('Marcus Brody', 'marcus.brody@example.com', '${userHash}', 'customer', '+91 9845010004', 'Active')
    ON CONFLICT DO NOTHING;
  `).catch(async () => {
    // MySQL syntax fallback if ON CONFLICT fails
    await exec(`
      INSERT IGNORE INTO users (name, email, password, role, phone, status) VALUES
      ('Store Administrator', 'admin@rsr.com', '${adminHash}', 'admin', '+91 9000357691', 'Active'),
      ('Operations Staff', 'staff@rsr.com', '${staffHash}', 'staff', '+91 9731597313', 'Active'),
      ('Sarah Jenkins', 'sarah.jenkins@example.com', '${userHash}', 'customer', '+91 9845010001', 'Active'),
      ('David Chen', 'david.chen@example.com', '${userHash}', 'customer', '+91 9845010002', 'Active'),
      ('Elena Rostova', 'elena.rostova@example.com', '${userHash}', 'customer', '+91 9845010003', 'Suspended'),
      ('Marcus Brody', 'marcus.brody@example.com', '${userHash}', 'customer', '+91 9845010004', 'Active');
    `);
  });

  // 2. Membership Plans
  const plansSql = `
    INSERT INTO membership_plans (code, name, price, duration_days, max_books, max_toys, max_total_items, description, status) VALUES
    ('BASIC', 'Basic (Books Only)', 299.00, 30, 2, 0, 2, 'Perfect for eager book readers. Up to 2 books at a time with free doorstep exchange.', 'Active'),
    ('PREMIUM', 'Premium (Books + Toys)', 599.00, 30, 3, 1, 4, 'Most popular family plan! 3 books and 1 educational STEM toy simultaneously.', 'Active'),
    ('TODDLER', 'Toddler Starter', 399.00, 30, 1, 1, 2, 'Tailored for infants and toddlers (ages 0-3). Board books & sensory toys.', 'Active'),
    ('FAMILY_MEGA', 'Family Mega Combo', 999.00, 30, 5, 3, 8, 'Ultimate unlimited home library and toy playroom for families with multiple children.', 'Active');
  `;
  await exec(plansSql).catch(() => {});

  // 3. Customers
  const custSql = `
    INSERT INTO customers (user_id, member_code, full_name, email, phone, address, city, subscription_plan_id, join_date, expiration_date, status, max_items_allowed, notes) VALUES
    (3, 'M101', 'Sarah Jenkins', 'sarah.jenkins@example.com', '+91 9845010001', 'Flat 402, Prestige Sunrise Park, Neo Town, Electronic City', 'Bengaluru', 1, '2026-01-15', '2026-12-31', 'Active', 2, 'Prefers early morning deliveries.'),
    (4, 'M102', 'David Chen', 'david.chen@example.com', '+91 9845010002', 'Villa 18, Concorde Silicon Valley, Neeladri Road, ECITY-1', 'Bengaluru', 2, '2026-03-22', '2026-12-31', 'Active', 4, 'Key customer, rents STEM building sets.'),
    (5, 'M103', 'Elena Rostova', 'elena.rostova@example.com', '+91 9845010003', 'Apt 12B, Ajmera Infinity, Doddathoguru, Electronic City', 'Bengaluru', 3, '2026-05-10', '2026-06-10', 'Suspended', 2, 'Payment method verification pending.'),
    (6, 'M104', 'Marcus Brody', 'marcus.brody@example.com', '+91 9845010004', 'House 55, Shikaripalya Main Road, Electronic City Phase 1', 'Bengaluru', 4, '2026-08-01', '2027-08-01', 'Active', 8, 'VIP Family Member with 3 school-age kids.');
  `;
  await exec(custSql).catch(() => {});

  // 4. Categories
  const catSql = `
    INSERT INTO categories (name, type, slug, description) VALUES
    ('Board Book', 'Book', 'board-book', 'Sturdy durable cardboard books designed for babies and toddlers.'),
    ('Fantasy Fiction', 'Book', 'fantasy-fiction', 'Imaginative magical storybooks for children and young adults.'),
    ('Picture Book', 'Book', 'picture-book', 'Illustrated visual narratives for growing readers.'),
    ('STEM & Science', 'Book', 'stem-science', 'Interactive STEM, science experiments, coding and space exploration.'),
    ('Building Blocks', 'Toy', 'building-blocks', 'Spatial development sets, Lego, and creative structural blocks.'),
    ('Playsets / Trains', 'Toy', 'playsets-trains', 'Wooden train layouts, city tracks, and dollhouse play environments.'),
    ('Infant Development', 'Toy', 'infant-development', 'Sensory gym mats, musical kick-pianos, rattles, and soft shapes.'),
    ('Puzzles & Brainteasers', 'Toy', 'puzzles-brainteasers', 'Cognitive wood puzzles, math tangrams, and problem solving games.');
  `;
  await exec(catSql).catch(() => {});

  // 5. Inventory Items
  const invSql = `
    INSERT INTO inventory_items (item_code, title, type, category_id, category_name, age_group, author_or_brand, isbn_or_model, monthly_rental_fee, security_deposit, replacement_cost, total_quantity, available_quantity, condition_status, rental_status, shelf_location, description, image_url) VALUES
    ('B001', 'The Very Hungry Caterpillar', 'Book', 1, 'Board Book', '0-3 years', 'Eric Carle', '978-0399226908', 149.00, 300.00, 650.00, 3, 2, 'Excellent', 'Available', 'Shelf A-1', 'Classic interactive children picture board book about metamorphosis.', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'),
    ('B002', 'Harry Potter & the Sorcerer''s Stone', 'Book', 2, 'Fantasy Fiction', '9-12 years', 'J.K. Rowling', '978-0590353427', 249.00, 400.00, 850.00, 1, 0, 'Good', 'Rented', 'Shelf B-3', 'Illustrated edition of the beloved fantasy novel.', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80'),
    ('B003', 'Where the Wild Things Are', 'Book', 3, 'Picture Book', '4-8 years', 'Maurice Sendak', '978-0060254926', 179.00, 350.00, 700.00, 2, 2, 'Excellent', 'Available', 'Shelf A-2', 'Caldecott Medal winner classic story of Max and his imagination.', 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80'),
    ('B004', 'Goodnight Moon', 'Book', 1, 'Board Book', '0-3 years', 'Margaret Wise Brown', '978-0694003617', 149.00, 300.00, 600.00, 2, 2, 'Excellent', 'Available', 'Shelf A-1', 'Quiet bedtime rhyming board book for infants.', 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=600&q=80'),
    ('T001', 'Lego Classic Bricks Box (790 Pcs)', 'Toy', 5, 'Building Blocks', '4+ years', 'LEGO', 'LEGO-10698', 499.00, 1200.00, 3200.00, 3, 3, 'Good', 'Available', 'Bin T-12', 'Comprehensive collection of colorful building bricks with windows and doors.', 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=600&q=80'),
    ('T002', 'Melissa & Doug Wooden Railway', 'Toy', 6, 'Playsets / Trains', '3-6 years', 'Melissa & Doug', 'MD-1706', 699.00, 1500.00, 4500.00, 1, 0, 'Good', 'Rented', 'Bin T-05', '100-piece solid wood track layout with engines and magnetic couplers.', 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80'),
    ('T003', 'Fisher-Price Kick & Play Piano', 'Toy', 7, 'Infant Development', '0-12 months', 'Fisher-Price', 'FP-CCB70', 399.00, 800.00, 2400.00, 1, 0, 'Needs Inspection', 'Maintenance', 'Bin T-01', 'Deluxe baby sensory activity mat with light-up piano keys.', 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=600&q=80'),
    ('T004', 'Wooden Alphabet & Shape Puzzle', 'Toy', 8, 'Puzzles & Brainteasers', '2-5 years', 'Hape Toys', 'HP-0211', 249.00, 500.00, 1400.00, 2, 2, 'Excellent', 'Available', 'Bin T-08', 'Eco-friendly non-toxic wooden puzzle for letter recognition.', 'https://images.unsplash.com/photo-1500990702037-7620ccb6a60a?auto=format&fit=crop&w=600&q=80');
  `;
  await exec(invSql).catch(() => {});

  // 6. Rentals
  const rentSql = `
    INSERT INTO rentals (rental_code, customer_id, member_code, customer_name, item_id, item_code, item_title, rent_date, due_date, return_date, status, delivery_status, monthly_fee, late_fee_charged, deposit_held, condition_on_issue, condition_on_return) VALUES
    ('R8001', 1, 'M101', 'Sarah Jenkins', 1, 'B001', 'The Very Hungry Caterpillar', '2026-10-01', '2026-10-15', '2026-10-14', 'Returned', 'Delivered', 149.00, 0.00, 300.00, 'Excellent', 'Excellent'),
    ('R8002', 2, 'M102', 'David Chen', 6, 'T002', 'Melissa & Doug Wooden Railway', '2026-10-05', '2026-11-05', NULL, 'Active', 'Delivered', 699.00, 0.00, 1500.00, 'Good', 'Pending'),
    ('R8003', 3, 'M103', 'Elena Rostova', 7, 'T003', 'Fisher-Price Kick & Play Piano', '2026-09-10', '2026-10-10', '2026-10-15', 'Returned', 'Delivered', 399.00, 150.00, 800.00, 'Good', 'Good (Slight wear)'),
    ('R8004', 4, 'M104', 'Marcus Brody', 2, 'B002', 'Harry Potter & the Sorcerer''s Stone', '2026-11-01', '2026-12-01', NULL, 'Active', 'Out for Delivery', 249.00, 0.00, 400.00, 'Good', 'Pending');
  `;
  await exec(rentSql).catch(() => {});

  // 7. Payments
  const paySql = `
    INSERT INTO payments (invoice_number, rental_id, customer_id, customer_name, amount, payment_type, payment_method, status, transaction_ref, notes, payment_date) VALUES
    ('INV-2026-001', 1, 1, 'Sarah Jenkins', 149.00, 'Rental_Fee', 'UPI', 'Completed', 'UPI/2026/098712', 'Rental fee for The Very Hungry Caterpillar', '2026-10-01'),
    ('INV-2026-002', 2, 2, 'David Chen', 699.00, 'Rental_Fee', 'Credit Card', 'Completed', 'CC/2026/445129', 'Rental fee for Wooden Railway 30-Day borrow', '2026-10-05'),
    ('INV-2026-003', 3, 3, 'Elena Rostova', 150.00, 'Late_Fee', 'UPI', 'Completed', 'UPI/2026/112948', 'Late return penalty for Kick & Play Piano (5 days)', '2026-10-15'),
    ('INV-2026-004', 4, 4, 'Marcus Brody', 249.00, 'Rental_Fee', 'Net Banking', 'Completed', 'NB/2026/883401', 'Harry Potter borrow booking', '2026-11-01');
  `;
  await exec(paySql).catch(() => {});

  // 8. Store Settings
  const setSql = `
    INSERT INTO store_settings (setting_key, setting_value, description) VALUES
    ('STORE_NAME', 'BOOKNIQUE - The Books & Toys Store', 'Official store legal business name'),
    ('STORE_ADDRESS', '4th Floor, Above Titan Eye Plus, Neeladri Road, Electronic City Phase 1, Bengaluru - 560100', 'Store physical headquarters'),
    ('SUPPORT_PHONE', '+91 9000357691 / 9731597313', 'Customer helpline phone numbers'),
    ('DEFAULT_CURRENCY', 'INR', 'Default operating currency'),
    ('CURRENCY_SYMBOL', '₹', 'Currency display symbol'),
    ('LATE_FEE_PER_DAY', '30', 'Standard daily late fee in INR per item');
  `;
  await exec(setSql).catch(() => {});

  // 9. Discounts
  const discSql = `
    INSERT INTO discounts (code, discount_percent, fixed_amount, min_order_amount, max_discount_amount, expiry_date, usage_limit, is_active) VALUES
    ('WELCOME10', 10.00, 0.00, 300.00, 150.00, '2027-12-31', 500, TRUE),
    ('DIWALI50', 0.00, 50.00, 400.00, 50.00, '2027-12-31', 200, TRUE),
    ('BENGALURUFREE', 15.00, 0.00, 500.00, 200.00, '2027-12-31', 1000, TRUE);
  `;
  await exec(discSql).catch(() => {});
}

export default {
  initDatabase,
  query,
  executeTransaction,
  getDatabaseDriver,
  getPool: () => pool
};
