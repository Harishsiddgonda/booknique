# 📚 BOOKNIQUE – The Book & Toy Store
### Complete Web & Android Books & Toys Rental Management Ecosystem
**Brand Headquarters:** 4th Floor, Above Titan Eye Plus, Neeladri Road, Electronic City Phase 1, Bengaluru, Karnataka – 560100  
**Customer Helpline:** +91 9000357691 / +91 9731597313  
**Application ID (Android):** `com.booknique.app`  
**Currency Engine:** Indian Rupees (`₹` / `INR`) via `Intl.NumberFormat('en-IN')`

---

## 🚀 1. Executive Summary & Core Deliverables

BOOKNIQUE is an enterprise-grade full-stack Books & Toys Rental Management Platform operating a **shared central backend** and **single cloud database** serving both a responsive marketplace website and a native Android mobile application.

| Deliverable | Location | Description |
| :--- | :--- | :--- |
| **Android Signed Release APK** | [`Booknique-Release.apk`](file:///c:/Users/HarishRuler/Downloads/rsr-books-toys-rental/Booknique-Release.apk) | **3.29 MB** • Production-ready, signed with `booknique-release.keystore`. |
| **Android Debug APK** | [`Booknique-Debug.apk`](file:///c:/Users/HarishRuler/Downloads/rsr-books-toys-rental/Booknique-Debug.apk) | **4.38 MB** • Fast test build for ADB and emulator installs. |
| **Gradle Release Artifact** | [`app-release.apk`](file:///c:/Users/HarishRuler/Downloads/rsr-books-toys-rental/frontend/android/app/build/outputs/apk/release/app-release.apk) | Direct output from Gradle `assembleRelease`. |
| **Gradle Debug Artifact** | [`app-debug.apk`](file:///c:/Users/HarishRuler/Downloads/rsr-books-toys-rental/frontend/android/app/build/outputs/apk/debug/app-debug.apk) | Direct output from Gradle `assembleDebug`. |
| **Cloud Deployment Blueprint** | [`render.yaml`](file:///c:/Users/HarishRuler/Downloads/rsr-books-toys-rental/render.yaml) | 1-Click Render Cloud Deployment configuration. |
| **Relational Database DDL** | [`database_schema.sql`](file:///c:/Users/HarishRuler/Downloads/rsr-books-toys-rental/database_schema.sql) | 16 Normalized SQL entities with dual PostgreSQL & MySQL support. |
| **Android Installation Guide**| [`ANDROID_APP_GUIDE.md`](file:///c:/Users/HarishRuler/Downloads/rsr-books-toys-rental/ANDROID_APP_GUIDE.md) | Step-by-step phone install and WiFi IP guide. |

---

## 🏛️ 2. System Architecture & Single-Source Principle

The website and the Android mobile application use the **EXACT SAME**:
1. **REST API Backend**: Node.js & Express (`0.0.0.0:5000` locally, or Render Cloud at `https://booknique-api.onrender.com`).
2. **Central Cloud Database**: Managed PostgreSQL on Render (or MySQL 8.0 locally) with unified state.
3. **Authentication & User Accounts**: Shared JWT session authentication with role-based authorization (Admin, Staff, Customer).
4. **Books & Toys Catalog**: Real-time inventory allocation, security deposit computation, and live stock decrement.
5. **Rental Orders & Transactions**: A rental placed on the website is instantly visible in the Android app upon refresh, and vice versa.
6. **Payment History**: Razorpay order IDs, UPI transactions, and downloadable PDF-ready receipts.

```
                          ┌────────────────────────┐
                          │   PostgreSQL Database  │
                          │ (Render / Local MySQL) │
                          └───────────┬────────────┘
                                      │
                                      ▼
                          ┌────────────────────────┐
                          │   Node.js REST API     │
                          │   (Express 4.21 / JWT) │
                          └─────┬────────────┬─────┘
                                │            │
           ┌────────────────────┴──┐      ┌──┴────────────────────┐
           ▼                       ▼      ▼                       ▼
    [ Web Application ]      [ React UI Bundle ]       [ Android App (Capacitor) ]
   (Vite / Responsive UI)       (Tailwind CSS)          (com.booknique.app APK)
```

---

## 🌐 3. All 21 Website Pages & Views

| # | Page Name | Route / Active View | Key Functionalities |
| :---: | :--- | :--- | :--- |
| **1** | **Home** | `customer_home` | Hero banner, quick search, quota meter, categories carousel, trending shelves. |
| **2** | **About Us** | `about_us` | Brand heritage, UVC chamber sanitization process, Bengaluru store location. |
| **3** | **Browse Books** | `customer_catalog` (type: Book) | Filter books by Board Books, Picture Books, Fantasy, STEM; age group chips. |
| **4** | **Browse Toys** | `customer_catalog` (type: Toy) | Filter toys by Lego, Wooden Railways, Infant Development, STEM science kits. |
| **5** | **Categories Explorer**| `categories` | Visual grid of all Book & Toy categories with live stock counters. |
| **6** | **Book Details** | `ProductQuickView` | Author, ISBN, monthly rental fee, deposit, condition, Add to Bag / Rent Now. |
| **7** | **Toy Details** | `ProductQuickView` | Brand, model, age recommendation, replacement cost, sanitized guarantee. |
| **8** | **Rental Plans** | `customer_subscription` | Basic (₹299), Premium (₹599), Toddler (₹399), Family Mega (₹999). |
| **9** | **Shopping Cart (Bag)**| `CartDrawer` | 15 vs 30-day duration selector, refundable deposit tally, quota validation. |
| **10**| **Checkout** | `CartDrawer` Checkout | Doorstep address selection, coupon code, Razorpay / UPI payment simulation. |
| **11**| **Login** | `AuthModal` (mode: login) | Email + Password, Remember Me checkbox, password visibility toggle, demo logins. |
| **12**| **Registration** | `AuthModal` (mode: register)| Full name, Bengaluru phone number, doorstep delivery address, auto-login. |
| **13**| **Customer Dashboard** | `customer_home` | Live borrow meter, active countdown timer, delivery status pills. |
| **14**| **My Rentals** | `customer_rentals` (Active)| Due date countdown, return request, renewal request, overdue badges. |
| **15**| **Rental History** | `customer_rentals` (History) | Past check-ins, return condition, total rentals completed. |
| **16**| **Invoices & Payments** | `customer_invoices` | Transaction ledger, payment method, tax invoice modal with print layout. |
| **17**| **Profile Settings** | `customer_profile` | Edit address, phone number, Dark/Light mode toggle, Android API Host selector. |
| **18**| **Contact Store Desk** | `contact_us` | Interactive contact form, phone helplines, operating hours, store map. |
| **19**| **FAQ & Guidelines** | `faq` | Accordion answering hygiene, deposit refund timeline, delivery regions. |
| **20**| **Privacy Policy** | `terms_privacy` (Privacy) | Data protection, RBI payment compliance, local JWT token storage. |
| **21**| **Terms & Conditions** | `terms_privacy` (Terms) | Rental durations, ₹30/day late fee rules, item condition standards. |

---

## 👑 4. All 19 Administrative Modules

| # | Admin Module | View / Route | Operational Scope |
| :---: | :--- | :--- | :--- |
| **1** | **Admin Authentication** | `AuthModal` / Role Switcher | Secure JWT token with admin role check. |
| **2** | **Dashboard Overview** | `dashboard` | Real database metrics from `/api/admin/overview`: active rentals, revenue, overdue items. |
| **3** | **User Management** | `users_admin` | View all accounts, change roles (Admin, Staff, Customer), toggle Active/Suspended. |
| **4** | **Customer Management** | `members` | Member profiles, assigned quota, subscription tier, contact information. |
| **5** | **Book Management** | `inventory` (Filter: Books) | Add new book, edit title, author, ISBN, rental fee in ₹, shelf location. |
| **6** | **Toy Management** | `inventory` (Filter: Toys) | Add new toy, set age group, brand, security deposit, replacement cost in ₹. |
| **7** | **Category Management** | `categories` | Create new categories, view item counts, slug generation. |
| **8** | **Inventory Management**| `inventory` | Stock level tracking, available vs total quantity, condition status. |
| **9** | **Rental Management** | `rentals` | All active and historic borrowings, customer name, rent date, due date. |
| **10**| **Booking Management** | `bookings` | Incoming reservations, stock reservation, rental code assignment. |
| **11**| **Payment Management** | `payments` | Full financial ledger, invoice numbers, payment methods (UPI, Razorpay, CC). |
| **12**| **Return Management** | `returns_admin` | Check-in returned items, verify completeness, auto-calculate late fees. |
| **13**| **Late Return Control** | `returns_admin` | Auto-charges ₹30/day for overdue days, updates rental record. |
| **14**| **Damage & Repairs** | `damages_admin` | Log broken/missing items, track repair costs, flag item for Maintenance. |
| **15**| **Discount Management** | `discounts_admin` | Create coupons (`WELCOME10`, `DIWALI50`), percentage or flat ₹ discounts, usage limit. |
| **16**| **Reports & Analytics** | `reports` | Revenue graphs, top rented books and toys, monthly financial summary. |
| **17**| **Notifications Center**| Header Notifications | Broadcast announcements, stock alerts, mark-all-as-read. |
| **18**| **Store & Cloud Settings**| `settings_admin` | Edit store address, support phone, late fee rates; view Cloud/Render health. |
| **19**| **Audit Logs Explorer** | `audit_logs_admin` | Immutable activity trail of administrative actions, user logins, and mutations. |

---

## 📡 5. Complete REST API Reference

All endpoints return JSON and are accessible from both Web and Android.

### Authentication & Users
- `POST /api/auth/login`: Authenticate with email & password; returns JWT token + user + customer profile.
- `POST /api/auth/register`: Create new user and linked customer profile.
- `GET /api/auth/me`: Validate JWT token and retrieve current session profile.
- `GET /api/auth/switch-demo/:roleOrEmail`: Instant demo login for testing.
- `GET /api/users`: List all users with role and status filtering.
- `PATCH /api/users/:id/role`: Update user role (`admin`, `staff`, `customer`).
- `PATCH /api/users/:id/status`: Update account status (`Active`, `Suspended`).

### Catalog & Categories
- `GET /api/books`: Filter books by category, age group, status, or title search.
- `GET /api/books/:id`: Detail view of specific book.
- `POST /api/books`: Create new book record.
- `GET /api/toys`: Filter toys by category, age group, status, or brand search.
- `GET /api/toys/:id`: Detail view of specific toy.
- `POST /api/toys`: Create new toy record.
- `GET /api/categories`: List all categories with associated item count.
- `POST /api/categories`: Create new category.
- `GET /api/inventory`: Full unified inventory collection.

### Rentals & Returns
- `GET /api/rentals`: Full rental orders ledger.
- `POST /api/rentals/issue`: Issue book or toy to customer.
- `POST /api/rentals/return`: Complete return check-in.
- `GET /api/returns/pending`: List all currently rented items awaiting return.
- `POST /api/returns/process`: Process item return with physical condition inspection and ₹30/day overdue penalty calculation.
- `PATCH /api/rentals/:id/delivery`: Update delivery stage (`Order Placed` ➔ `Packed` ➔ `Out for Delivery` ➔ `Delivered`).

### Payments & Razorpay
- `GET /api/payments`: Financial transactions and tax invoice records.
- `GET /api/payments/:id`: Detailed invoice view with customer address and rental details.
- `POST /api/payments/razorpay/create-order`: Generate Razorpay Order in paise (₹ INR) with automatic sandbox fallback.
- `POST /api/payments/razorpay/verify`: Server-side HMAC-SHA256 signature verification and automated invoice generation.

### Admin & Intelligence
- `GET /api/health`: System health, DB connection status, database driver (`mysql` or `postgres`), uptime.
- `GET /api/admin/overview`: Real-time database metrics (active rentals, total revenue, inventory counts).
- `GET /api/admin/damages`: List logged damage incidents.
- `POST /api/admin/damages`: Log damage incident and flag item for maintenance.
- `GET /api/admin/discounts`: List promotional discount coupons.
- `POST /api/admin/discounts`: Create new discount coupon.
- `GET /api/admin/settings`: Retrieve configurable store parameters.
- `PUT /api/admin/settings`: Update store settings.
- `GET /api/admin/audit-logs`: System audit trail.

---

## ☁️ 6. Render Cloud Deployment Guide (Phase 7)

A complete **Render Blueprint** [`render.yaml`](file:///c:/Users/HarishRuler/Downloads/rsr-books-toys-rental/render.yaml) is included in the project root.

### Step 1: Push Project to GitHub
```bash
git add .
git commit -m "Deploy Booknique full-stack platform"
git push origin master
```

### Step 2: Deploy on Render via Blueprint
1. Open [Render Dashboard](https://dashboard.render.com).
2. Click **New +** ➜ Select **Blueprint**.
3. Connect your GitHub repository.
4. Render will automatically detect [`render.yaml`](file:///c:/Users/HarishRuler/Downloads/rsr-books-toys-rental/render.yaml) and provision:
   - `booknique-db`: Managed PostgreSQL database.
   - `booknique-api`: Node.js Web Service running on `0.0.0.0:10000`.
   - `booknique-web`: React Vite Static Site with client-side SPA rewrites.
5. Click **Apply**. Render will build and deploy the entire stack automatically.

---

## 📱 7. Android Mobile Application Installation

### A. Install on Physical Android Phone
1. Transfer [`Booknique-Release.apk`](file:///c:/Users/HarishRuler/Downloads/rsr-books-toys-rental/Booknique-Release.apk) to your phone via USB cable, WhatsApp, or Google Drive.
2. Tap the file in your phone's *Files* or *Downloads* app.
3. Allow installation from unknown sources when prompted.
4. Tap **Install**.

### B. Install on Android Emulator
```powershell
adb install -r "c:\Users\HarishRuler\Downloads\rsr-books-toys-rental\Booknique-Release.apk"
```

### C. Connect Mobile App to Backend
The app includes a built-in **Intelligent Host Resolver**:
- **Render Cloud Backend**: Default production mode connects to `https://booknique-api.onrender.com`.
- **Local Testing**: Go to **Profile** ➜ **Android API Host IP** ➜ switch between `Render Cloud`, `10.0.2.2 (Emulator)`, or your PC's WiFi LAN IP (e.g. `192.168.1.2`).

---

## 💻 8. Local Run Instructions

### 1. Prerequisites
- **Node.js**: v18+ or v20+
- **MySQL**: 8.0+ running on `127.0.0.1:3306` (or PostgreSQL)

### 2. Run Backend & Frontend Concurrently
From the project root:
```powershell
npm run dev
```
- **Backend API**: `http://localhost:5000` (Health check: `http://localhost:5000/api/health`)
- **Frontend Web**: `http://localhost:5173`

### 3. Rebuild Android APKs
Run the included build script:
```cmd
c:\Users\HarishRuler\Downloads\rsr-books-toys-rental\scripts\build_android_apk.bat
```
Compiles both `Booknique-Debug.apk` and signed `Booknique-Release.apk` in ~2 minutes.
