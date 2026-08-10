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

1. **Role-Based Access Control (RBAC):** While roles (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`) are stored during registration and present in the token payload, strict endpoint-level role authorization (`authorize` middleware) might not be fully enforced across every single sub-route yet, though major routes require the `ADMIN` role.
2. **Supabase Client Usage:** The database connection exports a single Supabase client initialized with the `SUPABASE_SECRET_KEY` (service role key), bypassing Row Level Security (RLS). All security and authorization is currently handled at the Express application layer.
3. **Pagination:** Some endpoints support pagination (`page` and `limit` queries), but advanced filtering (like date-ranges) is not yet implemented for all lists.
4. **Data Soft Deletion:** Most tables do not currently implement "soft deletes" (e.g. an `is_deleted` column). Deletions or cancellations are either hard deletes or status updates.

---

## 📚 API Reference

> **Base URL:** `http://localhost:3000`  
> **Auth:** All protected routes require an `Authorization: Bearer <token>` header.

### 🔐 Auth APIs (`/api/auth`)

- **`POST /api/auth/register`** (Public)
  - **Purpose**: Register a new user in the system.
  - **Payload**: `{ "name": "John", "email": "john@example.com", "password": "pass", "role": "ADMIN" }`
- **`POST /api/auth/login`** (Public)
  - **Purpose**: Authenticate user and receive a token.
  - **Payload**: `{ "email": "john@example.com", "password": "pass" }`
  - **Response**: Returns the user data and a `token` (JWT).
- **`GET /api/auth/me`** (Protected)
  - **Purpose**: Get the profile of the currently logged-in user.
- **`PUT /api/auth/change-password`** (Protected)
  - **Purpose**: Update the logged-in user's password.
- **`POST /api/auth/logout`** (Protected)
  - **Purpose**: Log the user out (client-side token invalidation recommended as backend uses stateless JWT).

### 👥 User Management APIs (`/api/users`)
*Requires Authentication & ADMIN Role*

- **`POST /api/users`**
  - **Purpose**: Create a new user (admin only).
- **`GET /api/users`**
  - **Purpose**: List all registered users in the system.
- **`GET /api/users/:id`**
  - **Purpose**: Get specific user details by ID.
- **`PATCH /api/users/:id/role`**
  - **Purpose**: Update the role of a user.
- **`PATCH /api/users/:id/status`**
  - **Purpose**: Update user status (e.g., active/inactive).

### 👑 Admin APIs (`/api/admin`)
*Requires Authentication & ADMIN Role*

- **`GET /api/admin/dashboard`**
  - **Purpose**: Fetch top-level dashboard statistics, aggregated metrics, and summaries.

### 👤 Customer CRM APIs (`/api/customers`)
*Requires Authentication & ADMIN Role*

- **`POST /api/customers`**
  - **Purpose**: Create a new customer record.
- **`GET /api/customers`**
  - **Purpose**: List all customers. Supports query parameters for `search`, `status`, `customer_type`, `page`, `limit`.
- **`GET /api/customers/:id`**
  - **Purpose**: Get a customer's detailed record by ID.
- **`PUT /api/customers/:id`**
  - **Purpose**: Update an existing customer's details.
- **`POST /api/customers/:id/followups`**
  - **Purpose**: Add a follow-up note/interaction to a customer's timeline.

### 📦 Product & Inventory APIs (`/api/products`)
*Requires Authentication & ADMIN Role*

- **`POST /api/products`**
  - **Purpose**: Create a new product.
- **`GET /api/products`**
  - **Purpose**: List products. Supports query parameters for `search`, `category`, `low_stock`, `page`, `limit`.
- **`GET /api/products/:id`**
  - **Purpose**: Get product details by ID.
- **`PUT /api/products/:id`**
  - **Purpose**: Update product information (name, description, category, etc.).
- **`POST /api/products/:id/stock`**
  - **Purpose**: Record a manual stock movement (`IN` / `OUT`) to adjust inventory levels.
- **`GET /api/products/:id/stock`**
  - **Purpose**: View the chronological history of stock movements for a particular product.

### 🧾 Sales Challan APIs (`/api/challans`)
*Requires Authentication & ADMIN Role*

- **`POST /api/challans`**
  - **Purpose**: Create a new sales challan (draft or confirmed).
  - **Note**: If `status` is passed as `CONFIRMED`, the system instantly deducts product stock using an atomic SQL transaction.
- **`GET /api/challans`**
  - **Purpose**: List challans. Supports query parameters for `search`, `status`, `page`, `limit`.
- **`GET /api/challans/:id`**
  - **Purpose**: Fetch details of a specific challan, including line items.
- **`PATCH /api/challans/:id/confirm`**
  - **Purpose**: Confirm a `DRAFT` challan. This action mathematically deducts the stock required for the challan atomically.
- **`PATCH /api/challans/:id/cancel`**
  - **Purpose**: Cancel a `DRAFT` challan.
