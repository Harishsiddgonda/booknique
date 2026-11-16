# BOOKNIQUE – The Book & Toy Store
### Premium Books & Toys Rental Management Platform (Bengaluru, India)

A modern, production-ready full-stack web application and marketplace for children's books and educational toy rentals. Features doorstep delivery across Bengaluru (Electronic City), subscription management, automated overdue late-fee tracking in Indian Rupees (₹), real-time inventory allocation, and administrative controls.

---

## 🌟 Brand & Physical Presence
- **Store Name**: **BOOKNIQUE – The Book & Toy Store**
- **Tagline**: *"Books • Knowledge • A Brighter Tomorrow"*
- **Location**: 4th Floor, Above Titan Eye Plus, Neeladri Road, Electronic City Phase 1, Bengaluru, Karnataka – 560100
- **Helpline**: +91 9000357691 / +91 9731597313

---

## 🛠️ Technology Stack Architecture

- **Frontend**: React.js 18, Vite 6, Tailwind CSS, Lucide React icons, Context API authentication, responsive marketplace and executive dashboard layouts.
- **Backend**: Node.js, Express.js REST APIs, JWT authentication, bcryptjs password hashing, ACID database transactions, environment configuration.
- **Database**: MySQL 8.0+ relational database (`rsr_rental_db`) with 12 structured tables, foreign keys, indexes, and automated schema migration.
- **Currency Engine**: Centralized Indian Rupee (`₹` / `INR`) formatting utility using `Intl.NumberFormat('en-IN')`.

---

## 💰 Indian Rupee (INR) Pricing Structure

| Item Code / Tier | Title / Plan Name | Category / Type | Monthly Rental (₹) | Refundable Deposit (₹) |
|---|---|---|:---:|:---:|
| **B001** | The Very Hungry Caterpillar | Board Book (0-3 yrs) | **₹149** /mo | ₹300 |
| **B002** | Harry Potter & the Sorcerer's Stone | Fantasy Fiction (9-12 yrs) | **₹249** /mo | ₹400 |
| **B003** | Where the Wild Things Are | Picture Book (4-8 yrs) | **₹179** /mo | ₹350 |
| **B004** | Goodnight Moon | Board Book (0-3 yrs) | **₹149** /mo | ₹300 |
| **B005** | Panchatantra Illustrated Tales | Picture Book (4-8 yrs) | **₹149** /mo | ₹300 |
| **B006** | The Magic of the Lost Temple | Fantasy Fiction (7-12 yrs) | **₹199** /mo | ₹350 |
| **T001** | Lego Classic Bricks Box (790 Pcs) | Building Blocks (4+ yrs) | **₹499** /mo | ₹1,200 |
| **T002** | Melissa & Doug Wooden Railway | Playsets / Trains (3-6 yrs) | **₹699** /mo | ₹1,500 |
| **T003** | Fisher-Price Kick & Play Piano | Infant Sensory (0-12 mos) | **₹399** /mo | ₹900 |
| **T004** | Wooden Alphabet & Shape Puzzle | Brainteasers (2-5 yrs) | **₹249** /mo | ₹500 |
| **T005** | Magna-Tiles Magnetic STEM Set | Building Blocks (3+ yrs) | **₹599** /mo | ₹1,200 |
| **T006** | Mechanix Robotic Motion Kit | STEM & Science (8+ yrs) | **₹649** /mo | ₹1,400 |
| **PLAN-BASIC** | Basic (Books Only) | 2 Books simultaneous | **₹499** /mo | — |
| **PLAN-PREMIUM**| Premium (Books + Toys) | 2 Books + 2 Toys (4 items) | **₹999** /mo | — |
| **PLAN-TODDLER**| Toddler Starter | 1 Book + 1 Sensory Toy | **₹749** /mo | — |
| **PLAN-FAMILY** | Family Mega | 4 Books + 4 Toys (8 items) | **₹1,799** /mo | — |
| **LATE FEE** | Overdue Retention Fee | Automatic per day overdue | **₹50.00** /day | — |

---

## 👥 Role-Based Experience

### 1. 👤 Member / Customer Experience
- **Curated Catalog**: Search and filter by Books, Toys, Age Groups, and Categories.
- **Interactive Rental Bag (Cart)**: Select items, choose rental duration (15 or 30 days), review refundable security deposits, and place orders with instant checkout.
- **My Borrowed Items Desk**: Real-time due date countdown, delivery stage tracker, and one-click return request.
- **Tax Invoices & Receipts**: View transaction history and generate official printable tax invoices in Indian Rupees (₹).
- **Delivery Address Settings**: Update doorstep delivery address in Electronic City Phase 1 & 2.

### 2. 👑 Store Administrator Experience
- **Executive Dashboard**: Revenue metrics in ₹, active borrowings, stock health, and monthly revenue trends.
- **Inventory Control**: Full CRUD on books and educational toys, pricing in ₹, shelf locations, and stock intake.
- **Member Directory**: Manage memberships, quotas, and toggle account status (`Active` / `Suspended`).
- **Procurement & Restock**: Manage purchase orders in ₹ from Indian publishers and distributors; receiving an order automatically increments physical stock in MySQL.
- **Financial Reports & CSV Export**: Export accounting reports and rental transactions to CSV.
- **Live SQL Relational Explorer**: Interactive 3-way SQL relational JOIN query across `rentals`, `customers`, `membership_plans`, and `inventory_items`.

### 3. 👔 Operations Staff Experience
- **Issue & Return Desk**: Verify member quotas, issue rentals, and process returns with condition checks.
- **Automated Late Fee Engine**: Overdue items automatically calculate dues at ₹50.00/day.
- **Delivery Kanban**: Advance fulfillment stages (`Order Placed` ➔ `Packed` ➔ `Out for Delivery` ➔ `Delivered`).

---

## 🔑 Demo Login Credentials (or use 1-Click Top Bar Switcher)

| Role | Email | Password | Identifier / Notes |
|---|---|---|---|
| **Admin** | `admin@rsr.com` | `Admin@123` | Full Store Administrator Access |
| **Staff** | `staff@rsr.com` | `Staff@123` | Operational Desk Access |
| **Customer** | `david.chen@example.com` | `Customer@123` | Member M102 (Premium Plan, 4 items allowed) |
| **Customer** | `sarah.jenkins@example.com` | `Customer@123` | Member M101 (Basic Plan, 2 items allowed) |
| **Customer** | `elena.rostova@example.com` | `Customer@123` | Member M103 (*Suspended* account with overdue fee) |
| **Customer** | `marcus.brody@example.com` | `Customer@123` | Member M104 (Family Mega Plan, 8 items allowed) |

---

## 🚀 How to Run the Platform

### 1. Prerequisites
- **Node.js** v18+ or v20+
- **MySQL Server 8.0+** running on `127.0.0.1:3306`

### 2. Configure Backend `.env`
File located at `backend/.env`:
```env
PORT=5000
NODE_ENV=development

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=rsr_rental_db

JWT_SECRET=rsr_rental_super_secure_jwt_secret_key_2026
JWT_EXPIRES_IN=7d
```

### 3. Launch Development Server
From the root workspace directory:
```powershell
npm run dev
```
Starts:
- **Backend REST API**: `http://localhost:5000`
- **Frontend Application**: `http://localhost:5173`

### 4. Build Production Bundle
```powershell
npm run build
```
Generates production assets in `frontend/dist/`.
