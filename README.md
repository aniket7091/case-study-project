# TradeFlow - ERP & CRM System

TradeFlow is a comprehensive web-based Enterprise Resource Planning (ERP) and Customer Relationship Management (CRM) system designed to streamline business operations, inventory management, customer tracking, and sales (challan) generation.

## Live Demo

- **Frontend URL:** https://tradeflow-f.netlify.app/
- **Backend API URL:** https://case-study-backend-3cb3.onrender.com/api

### Test Login Credentials
| Role | Email | Password |
|------|-------|----------|
| **Admin** | `aniketkumar7091315698@gmail.com`  | `Aniket@123` |
| **Sales** | `sales@test.com` | `password123` |
| **Warehouse** | `warehouse@test.com` | `password123` |
| **Accounts** | `accounts@test.com` | `password123` |



---

##  Architecture Overview

The project follows a standard **Client-Server Architecture**:
1. **Frontend (Client):** Built with React.js. It handles the user interface, routing, and state management. The UI enforces strict **Granular Role-Based Access Control (RBAC)** down to individual buttons.
2. **Backend (Server):** A Node.js and Express.js REST API. It handles authentication, business logic, fine-grained access control, data validation, and serves as the bridge between the frontend and the database.
3. **Database:** Supabase (PostgreSQL) is used as the relational database. The backend communicates with Supabase via the official `@supabase/supabase-js` client.

---

## Role-Based Access Control (RBAC) Matrix

TradeFlow enforces strict data and UI action access according to the user's role. If a user lacks permission for an action, the corresponding UI elements (Add, Edit, Delete, Update) are completely hidden, providing a true Read-Only view where applicable.

| Module | ADMIN | SALES | WAREHOUSE | ACCOUNTS |
|---|---|---|---|---|
| **Dashboard** | ✅ Full stats | ✅ Own view | ✅ Own view | ✅ Own view |
| **Customers** | ✅ Full CRUD | ✅ Full CRUD | ❌ No Access | ✅ Read only |
| **Products** | ✅ Full CRUD | ✅ Read only | ✅ Read + Stock | ❌ No Access |
| **Challans** | ✅ Full CRUD | ✅ Full CRUD | ❌ No Access | ✅ Read only |
| **Inventory** | ✅ Full Access | ❌ No Access | ✅ Full CRUD | ❌ No Access |
| **Reports** | ✅ Full Access | ❌ No Access | ❌ No Access | ✅ Full Access |
| **Users** | ✅ Full Access | ❌ No Access | ❌ No Access | ❌ No Access |

---

##  Setup and Deployment Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- A Supabase account and project

### 1. Environment Variables Management

**Backend (`backend/.env`):**
Create a `.env` file in the `backend` directory:
```env
PORT=5000
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret_key
```

**Frontend (`frontend/.env`):**
Create a `.env` file in the `frontend` directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 2. How to run the project locally

**Run the Backend Server:**
```bash
cd backend
npm install
npm run dev
# The server will start on http://localhost:5000
```

**Run the Frontend Development Server:**
```bash
cd frontend
npm install
npm start
# The app will open at http://localhost:3000
```

### 3. How to deploy the project

**Deploying the Backend (e.g., Render, Railway):**
1. Connect your GitHub repository to the hosting provider.
2. Set the root directory to `backend/`.
3. Add the required Environment Variables (`SUPABASE_URL`, `SUPABASE_KEY`, `JWT_SECRET`).
4. Set the build command to `npm install` and the start command to `node src/server.js`.

**Deploying the Frontend (e.g., Netlify, Vercel):**
1. Connect your GitHub repository to Netlify.
2. Set the root directory to `frontend/`.
3. Add the Environment Variable (`REACT_APP_API_URL`) pointing to your live backend URL.
4. Deploy the project using the build command `npm run build`.

---

##  API Documentation

All API endpoints are prefixed with `/api`. Authentication is handled via JWT Bearer tokens in the `Authorization` header.

### Authentication
- `POST /auth/login` - Authenticate a user and return a JWT and user data.

### Customers (CRM)
- `GET /customers` - Retrieve all customers with pagination.
- `POST /customers` - Add a new customer.
- `PUT /customers/:id` - Update customer details.
- `DELETE /customers/:id` - Delete a customer.

### Inventory (Products)
- `GET /products` - Retrieve products, includes query filters for category, search, and dynamic in-memory memory filtering for `low_stock`.
- `POST /products` - Add a new product to the catalog.
- `PUT /products/:id` - Update product details (price, minimum stock).
- `POST /inventory/stock` - Add or subtract stock for a specific product.

### Challans (Sales Operations)
- `GET /challans` - Get a list of all challans.
- `POST /challans` - Create a new challan with line items.
- `PUT /challans/:id/status` - Update the status of a challan (e.g., Draft -> Confirmed).

---

##  Assumptions Made

1. **Role-Based Access Control (RBAC):** It is assumed that roles (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`) are strictly enforced at both the UI routing level and the Backend middleware level.
2. **Supabase Setup:** Assumed that the Supabase database schema (tables for `users`, `customers`, `products`, `challans`, `challan_items`) is already defined and intact.
3. **Low Stock Filtering:** Due to Supabase string formatting constraints with direct column comparisons, the `low_stock` filtering has been safely abstracted to in-memory server logic.
4. **Invoice Generation:** The invoice PDF generation relies on browser-native print functionality formatted via CSS `@media print`.

---

##  Recent Fixes & Improvements

- **Sidebar Dynamics:** The global sidebar navigation has been upgraded to properly display the dynamically authenticated user's name and role across all active pages (instead of hardcoded placeholders).
- **Granular Action Protection:** Extensively overhauled the frontend architecture to strictly enforce the CRUD permission matrix on action buttons (e.g., "Add", "Edit", "Delete", "Confirm"). Users without correct write permissions are served a pristine, restricted Read-Only interface.
- **Database Type Errors:** Corrected a critical Postgres integer type crash (`invalid input syntax for type integer: "minimum_stock"`) on the Products API route by safely offloading direct column-to-column comparisons to the server controller.
