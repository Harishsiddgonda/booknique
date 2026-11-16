-- ============================================================================
-- BOOKNIQUE - The Book & Toy Store
-- Relational MySQL Database Schema & Initial Data Seed (INR Currency)
-- Target Engine: MySQL 8.0+ / MariaDB 10.5+
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `rsr_rental_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `rsr_rental_db`;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Users Table (Authentication & RBAC)
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(120) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'staff', 'customer') DEFAULT 'customer',
  `phone` VARCHAR(25),
  `avatar` VARCHAR(255),
  `status` ENUM('Active', 'Suspended', 'Inactive') DEFAULT 'Active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_user_email` (`email`),
  INDEX `idx_user_role` (`role`)
) ENGINE=InnoDB;

-- 2. Membership Plans Table
DROP TABLE IF EXISTS `membership_plans`;
CREATE TABLE `membership_plans` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(30) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `duration_days` INT DEFAULT 30,
  `max_books` INT DEFAULT 2,
  `max_toys` INT DEFAULT 1,
  `max_total_items` INT DEFAULT 3,
  `description` TEXT,
  `status` ENUM('Active', 'Inactive') DEFAULT 'Active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Customers / Members Table
DROP TABLE IF EXISTS `customers`;
CREATE TABLE `customers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NULL,
  `member_code` VARCHAR(30) NOT NULL UNIQUE,
  `full_name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(120) NOT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `address` VARCHAR(255),
  `city` VARCHAR(100) DEFAULT 'Bengaluru',
  `subscription_plan_id` INT NULL,
  `join_date` DATE NOT NULL,
  `expiration_date` DATE NULL,
  `status` ENUM('Active', 'Suspended', 'Expired') DEFAULT 'Active',
  `max_items_allowed` INT DEFAULT 2,
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`subscription_plan_id`) REFERENCES `membership_plans`(`id`) ON DELETE SET NULL,
  INDEX `idx_member_code` (`member_code`),
  INDEX `idx_cust_status` (`status`)
) ENGINE=InnoDB;

-- 4. Categories Table
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `type` ENUM('Book', 'Toy', 'General') DEFAULT 'General',
  `slug` VARCHAR(120) NOT NULL UNIQUE,
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 5. Inventory Items Table (Books & Toys)
DROP TABLE IF EXISTS `inventory_items`;
CREATE TABLE `inventory_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `item_code` VARCHAR(30) NOT NULL UNIQUE,
  `title` VARCHAR(200) NOT NULL,
  `type` ENUM('Book', 'Toy') NOT NULL,
  `category_id` INT NULL,
  `category_name` VARCHAR(100),
  `age_group` VARCHAR(50) DEFAULT 'All ages',
  `author_or_brand` VARCHAR(120),
  `isbn_or_model` VARCHAR(100),
  `monthly_rental_fee` DECIMAL(10,2) NOT NULL DEFAULT 3.00,
  `security_deposit` DECIMAL(10,2) DEFAULT 0.00,
  `replacement_cost` DECIMAL(10,2) DEFAULT 25.00,
  `total_quantity` INT DEFAULT 1,
  `available_quantity` INT DEFAULT 1,
  `condition_status` ENUM('New', 'Excellent', 'Good', 'Needs Inspection', 'Damaged') DEFAULT 'Good',
  `rental_status` ENUM('Available', 'Rented', 'Maintenance', 'Retired') DEFAULT 'Available',
  `shelf_location` VARCHAR(50),
  `description` TEXT,
  `image_url` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL,
  INDEX `idx_item_code` (`item_code`),
  INDEX `idx_item_type` (`type`),
  INDEX `idx_item_status` (`rental_status`)
) ENGINE=InnoDB;

-- 6. Suppliers Table
DROP TABLE IF EXISTS `suppliers`;
CREATE TABLE `suppliers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `contact_person` VARCHAR(100),
  `email` VARCHAR(120),
  `phone` VARCHAR(40),
  `address` VARCHAR(255),
  `items_supplied` VARCHAR(255),
  `status` ENUM('Active', 'Inactive') DEFAULT 'Active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 7. Procurement Orders Table
DROP TABLE IF EXISTS `procurement_orders`;
CREATE TABLE `procurement_orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_number` VARCHAR(50) NOT NULL UNIQUE,
  `supplier_id` INT NULL,
  `order_date` DATE NOT NULL,
  `expected_date` DATE,
  `received_date` DATE,
  `total_amount` DECIMAL(10,2) DEFAULT 0.00,
  `payment_status` ENUM('Unpaid', 'Partial', 'Paid') DEFAULT 'Unpaid',
  `status` ENUM('Ordered', 'Received', 'Cancelled') DEFAULT 'Ordered',
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 8. Procurement Items Table
DROP TABLE IF EXISTS `procurement_items`;
CREATE TABLE `procurement_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `procurement_id` INT NOT NULL,
  `item_id` INT NULL,
  `item_title` VARCHAR(200) NOT NULL,
  `quantity` INT DEFAULT 1,
  `unit_cost` DECIMAL(10,2) DEFAULT 0.00,
  `total_cost` DECIMAL(10,2) DEFAULT 0.00,
  FOREIGN KEY (`procurement_id`) REFERENCES `procurement_orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`item_id`) REFERENCES `inventory_items`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 9. Rental Transactions Table
DROP TABLE IF EXISTS `rentals`;
CREATE TABLE `rentals` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `rental_code` VARCHAR(40) NOT NULL UNIQUE,
  `customer_id` INT NOT NULL,
  `member_code` VARCHAR(30) NOT NULL,
  `customer_name` VARCHAR(120) NOT NULL,
  `item_id` INT NOT NULL,
  `item_code` VARCHAR(30) NOT NULL,
  `item_title` VARCHAR(200) NOT NULL,
  `rent_date` DATE NOT NULL,
  `due_date` DATE NOT NULL,
  `return_date` DATE NULL,
  `status` ENUM('Active', 'Due Soon', 'Overdue', 'Returned', 'Cancelled') DEFAULT 'Active',
  `delivery_status` ENUM('Order Placed', 'Packed', 'Out for Delivery', 'Delivered', 'Returned to Store') DEFAULT 'Order Placed',
  `monthly_fee` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `late_fee_charged` DECIMAL(10,2) DEFAULT 0.00,
  `deposit_held` DECIMAL(10,2) DEFAULT 0.00,
  `condition_on_issue` VARCHAR(50) DEFAULT 'Good',
  `condition_on_return` VARCHAR(100) DEFAULT 'Pending',
  `issue_staff_id` INT NULL,
  `return_staff_id` INT NULL,
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`item_id`) REFERENCES `inventory_items`(`id`) ON DELETE RESTRICT,
  INDEX `idx_rental_code` (`rental_code`),
  INDEX `idx_rental_status` (`status`),
  INDEX `idx_rent_due` (`due_date`)
) ENGINE=InnoDB;

-- 10. Payments & Invoices Table
DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `invoice_number` VARCHAR(50) NOT NULL UNIQUE,
  `rental_id` INT NULL,
  `customer_id` INT NULL,
  `customer_name` VARCHAR(120) NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `payment_type` ENUM('Subscription', 'Rental_Fee', 'Late_Fee', 'Deposit', 'Damage_Fee', 'Deposit_Refund') DEFAULT 'Rental_Fee',
  `payment_method` ENUM('Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Cash', 'PayPal', 'Apple Pay') DEFAULT 'Credit Card',
  `status` ENUM('Completed', 'Pending', 'Failed', 'Refunded') DEFAULT 'Completed',
  `transaction_ref` VARCHAR(100),
  `notes` TEXT,
  `payment_date` DATE NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`rental_id`) REFERENCES `rentals`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE SET NULL,
  INDEX `idx_inv_num` (`invoice_number`),
  INDEX `idx_pay_date` (`payment_date`)
) ENGINE=InnoDB;

-- 11. Notifications Table
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NULL,
  `customer_id` INT NULL,
  `title` VARCHAR(150) NOT NULL,
  `message` TEXT NOT NULL,
  `type` ENUM('info', 'success', 'warning', 'danger') DEFAULT 'info',
  `is_read` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 12. Audit Logs Table
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NULL,
  `user_name` VARCHAR(100),
  `action` VARCHAR(80) NOT NULL,
  `entity_type` VARCHAR(60),
  `entity_id` VARCHAR(60),
  `details` TEXT,
  `ip_address` VARCHAR(45),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 13. Damages & Maintenance Table
DROP TABLE IF EXISTS `damages`;
CREATE TABLE `damages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `rental_id` INT NULL,
  `item_id` INT NOT NULL,
  `customer_id` INT NULL,
  `damage_type` VARCHAR(80) NOT NULL,
  `severity` ENUM('Low', 'Medium', 'Critical') DEFAULT 'Low',
  `repair_cost` DECIMAL(10,2) DEFAULT 0.00,
  `fee_charged` DECIMAL(10,2) DEFAULT 0.00,
  `fee_status` ENUM('Unpaid', 'Paid', 'Waived') DEFAULT 'Unpaid',
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`item_id`) REFERENCES `inventory_items`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 14. Promotional Discounts & Coupons Table
DROP TABLE IF EXISTS `discounts`;
CREATE TABLE `discounts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `discount_percent` DECIMAL(5,2) DEFAULT 0.00,
  `fixed_amount` DECIMAL(10,2) DEFAULT 0.00,
  `min_order_amount` DECIMAL(10,2) DEFAULT 0.00,
  `max_discount_amount` DECIMAL(10,2) DEFAULT 0.00,
  `expiry_date` DATE,
  `usage_limit` INT DEFAULT 100,
  `used_count` INT DEFAULT 0,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 15. Product Reviews & Ratings Table
DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `item_id` INT NOT NULL,
  `customer_name` VARCHAR(120) NOT NULL,
  `rating` INT NOT NULL DEFAULT 5,
  `comment` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`item_id`) REFERENCES `inventory_items`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 16. Store & Global Parameters Table
DROP TABLE IF EXISTS `store_settings`;
CREATE TABLE `store_settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `setting_key` VARCHAR(100) NOT NULL UNIQUE,
  `setting_value` TEXT,
  `description` VARCHAR(255),
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;
