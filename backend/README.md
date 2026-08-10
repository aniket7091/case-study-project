# 🚀 Case Study Backend

A robust Node.js and Express.js backend system tailored for Customer CRM, Product & Inventory Management, and Sales Challan processing. 

The backend relies on **Supabase (PostgreSQL)** for the database layer, implementing atomic database transactions for business-critical operations like stock deduction via PostgreSQL RPC functions.

---

## 🏗 Architecture & Tech Stack

- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Database:** PostgreSQL (via Supabase)
- **Authentication:** JWT (JSON Web Tokens) with bcrypt password hashing
- **Containerization:** Docker

### Key Design Decisions
1. **Supabase as DBaaS:** We use Supabase strictly as a PostgreSQL database. The backend handles its own authentication via JWT, instead of relying on Supabase Auth.
2. **Atomic Transactions via RPC:** Operations that require multi-table locking and consistency (like creating a confirmed Sales Challan that must simultaneously reduce product stock) are handled via raw PostgreSQL RPC (Stored Procedures). This prevents race conditions and ensures inventory integrity.
3. **Modular Architecture:** The codebase follows an MVC-like structure (`controllers`, `services`, `routes`, `validators`, `middleware`) separating business logic from routing.

---

## 🛠 Setup & Deployment Instructions

### Prerequisites
- Node.js (v18+)
- A Supabase account and project
- Docker (optional, for containerized deployment)

### 1. Database Setup
Ensure your Supabase PostgreSQL instance has the necessary schemas. You need to run the `challan_schema.sql` (and other related SQL creation scripts) directly in your Supabase SQL Editor to create tables, sequences, and RPC functions (`generate_challan_number` and `confirm_sales_challan`).

### 2. Environment Variables
Create a `.env` file in the root directory:
```env
PORT=3000
SUPABASE_URL=https://<your-project-id>.supabase.co
SUPABASE_SECRET_KEY=<your-service-role-key>
JWT_SECRET=<your-super-secret-jwt-key>
JWT_EXPIRES_IN=7d
```

### 3. Running Locally (Without Docker)

Install dependencies:
```bash
npm install
```

Start the development server (with hot reload):
```bash
npm run dev
```

Start the production server:
```bash
npm start
```

### 4. Running with Docker

Build the Docker image:
```bash
docker build -t case-study-backend .
```

Run the container (passing environment variables):
```bash
docker run -p 3000:3000 --env-file .env case-study-backend
```

---

## ⚠️ Known Limitations / Incomplete Parts

1. **Role-Based Access Control (RBAC):** While roles (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`) are stored during registration and present in the token payload, strict endpoint-level role authorization (`authorize` middleware) isn't fully enforced across every route yet.
2. **Supabase Client Usage:** The `database.js` file exports a single Supabase client initialized with the `SUPABASE_SECRET_KEY` (service role key), bypassing Row Level Security (RLS). All security and authorization is currently handled at the Express application layer.
3. **Pagination:** Some endpoints support pagination (`page` and `limit` queries), but advanced filtering (like date-ranges) is not yet implemented for all lists.
4. **Data Soft Deletion:** Most tables do not currently implement "soft deletes" (e.g. an `is_deleted` column). Deletions or cancellations are either hard deletes or status updates.

---

## 📚 API Reference

> **Base URL:** `http://localhost:3000`  
> **Auth:** All protected routes require `Authorization: Bearer <token>` header.

### 🔐 Auth APIs

- `POST /api/auth/register` - Register a new user (`name`, `email`, `password`, `role`)
- `POST /api/auth/login` - Login (`email`, `password`) -> Returns JWT
- `GET /api/auth/me` - Get current user profile (Protected)
- `PUT /api/auth/change-password` - Update password (Protected)
- `POST /api/auth/logout` - Logout (Protected)

### 👤 Customer CRM APIs (Protected)

- `POST /api/customers` - Create customer
- `GET /api/customers` - List all customers (Supports `search`, `status`, `customer_type`, `page`, `limit`)
- `GET /api/customers/:id` - Get customer by ID
- `PUT /api/customers/:id` - Update customer
- `POST /api/customers/:id/followups` - Add a follow-up note

### 📦 Product & Inventory APIs (Protected)

- `POST /api/products` - Create product
- `GET /api/products` - List products (Supports `search`, `category`, `low_stock`, `page`, `limit`)
- `GET /api/products/:id` - Get product by ID
- `PUT /api/products/:id` - Update product
- `POST /api/products/:id/stock` - Add stock movement (`IN` / `OUT`)
- `GET /api/products/:id/stock` - Get stock movement history

### 🧾 Sales Challan APIs (Protected)

- `POST /api/challans` - Create challan. If `status` is passed as `CONFIRMED`, it will instantly deduct stock via SQL transaction.
- `GET /api/challans` - List challans (Supports `search`, `status`, `page`, `limit`)
- `GET /api/challans/:id` - Get challan by ID
- `PATCH /api/challans/:id/confirm` - Confirm a `DRAFT` challan (deducts stock atomically)
- `PATCH /api/challans/:id/cancel` - Cancel a `DRAFT` challan

*(Detailed JSON payloads and response structures are documented in the supplementary API documentation files or Postman collections).*
