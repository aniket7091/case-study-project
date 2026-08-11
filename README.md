# TradeFlow – ERP & CRM System
### Project Documentation

This document has been compiled from the project's `README.md` file to present the setup, deployment, and operational details of TradeFlow in a clear, written form.

---

## Table of Contents
1. Project Overview
2. Architecture Overview
3. Role-Based Access Control (RBAC)
4. How the Server Was Set Up
5. How Environment Variables Are Managed
6. How to Run the Project Locally
7. How to Deploy the Project
8. Live Application Links
9. Test Login Credentials
10. API Documentation
11. Assumptions Made
12. Recent Fixes & Improvements
13. Known Limitations / Incomplete Parts

---

## 1. Project Overview

TradeFlow is a comprehensive, web-based Enterprise Resource Planning (ERP) and Customer Relationship Management (CRM) system. It has been built to streamline core business operations such as inventory management, customer tracking, and sales document (challan) generation, bringing these functions together into a single platform.

---

## 2. Architecture Overview

TradeFlow follows a standard client-server architecture made up of three main parts:

- **Frontend (Client):** Built using React.js, the frontend is responsible for the user interface, page routing, and state management. It also enforces strict, granular Role-Based Access Control (RBAC) that goes down to the level of individual buttons on the screen, not just entire pages.
- **Backend (Server):** Built using Node.js and Express.js as a REST API, the backend takes care of authentication, business logic, fine-grained access control, and data validation. It acts as the bridge connecting the frontend to the database.
- **Database:** Supabase, which is built on PostgreSQL, is used as the relational database for the system. The backend communicates with Supabase through the official `@supabase/supabase-js` client library.

---

## 3. Role-Based Access Control (RBAC)

Access to each module in TradeFlow depends on the logged-in user's role. Where a user does not have permission to perform an action, the corresponding UI element (Add, Edit, Delete, Update) is hidden entirely rather than simply disabled, so unauthorized users see a genuinely read-only interface.

| Module | ADMIN | SALES | WAREHOUSE | ACCOUNTS |
|---|---|---|---|---|
| Dashboard | Full stats | Own view | Own view | Own view |
| Customers | Full CRUD | Full CRUD | No Access | Read only |
| Products | Full CRUD | Read only | Read + Stock | No Access |
| Challans | Full CRUD | Full CRUD | No Access | Read only |
| Inventory | Full Access | No Access | Full CRUD | No Access |
| Reports | Full Access | No Access | No Access | Full Access |
| Users | Full Access | No Access | No Access | No Access |

---

## 4. How the Server Was Set Up

The server (backend) is a Node.js and Express.js REST API. Its responsibilities include handling user authentication, enforcing business logic, applying fine-grained access control per role, validating incoming data, and serving as the bridge between the React frontend and the Supabase database. All communication with the database is done through the official `@supabase/supabase-js` client library rather than raw SQL connections.

To set the server up, the following prerequisites are needed:
- Node.js (v16 or higher)
- npm or yarn
- A Supabase account and project

Once the prerequisites are in place, the backend is configured with its own `.env` file (described in the next section) and started using the commands covered under "How to Run the Project Locally" below, which brings the API server up on `http://localhost:5000`.

---

## 5. How Environment Variables Are Managed

Environment variables are kept separately for the backend and the frontend, each in its own `.env` file.

**Backend** – a `.env` file inside the `backend` directory contains:
```env
PORT=5000
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret_key
```
- `PORT` sets the port the Express server runs on.
- `SUPABASE_URL` and `SUPABASE_KEY` connect the backend to the correct Supabase project using the service role key.
- `JWT_SECRET` is the secret key used to sign and verify JWT authentication tokens.

**Frontend** – a `.env` file inside the `frontend` directory contains:
```env
REACT_APP_API_URL=http://localhost:5000/api
```
- `REACT_APP_API_URL` tells the React app where the backend API lives. Locally this points to `http://localhost:5000/api`; in production it is changed to point at the live backend URL instead.

---

## 6. How to Run the Project Locally

**Running the Backend Server:**
```bash
cd backend
npm install
npm run dev
# The server will start on http://localhost:5000
```

**Running the Frontend Development Server:**
```bash
cd frontend
npm install
npm start
# The app will open at http://localhost:3000
```

The backend should generally be started first so that the frontend has an API to connect to once it launches.

---

## 7. How to Deploy the Project

**Deploying the Backend** (e.g., to Render or Railway):
1. Connect the GitHub repository to the hosting provider.
2. Set the root directory to `backend/`.
3. Add the required environment variables: `SUPABASE_URL`, `SUPABASE_KEY`, and `JWT_SECRET`.
4. Set the build command to `npm install` and the start command to `node src/server.js`.

**Deploying the Frontend** (e.g., to Netlify or Vercel):
1. Connect the GitHub repository to Netlify.
2. Set the root directory to `frontend/`.
3. Add the environment variable `REACT_APP_API_URL`, pointing it to the live backend URL.
4. Deploy using the build command `npm run build`.

In the live deployment of this project, the backend is hosted on Render and the frontend on Netlify, following this same process.

---

## 8. Live Application Links

- **Frontend URL:** https://tradeflow-f.netlify.app/
- **Backend API URL:** https://case-study-backend-3cb3.onrender.com

---

## 9. Test Login Credentials

The following demo accounts are available for testing each role:

| Role | Email | Password |
|---|---|---|
| Admin | aniketkumar7091315698@gmail.com | Aniket@123 |
| Sales | sales@test.com | password123 |
| Warehouse | warehouse@test.com | password123 |
| Accounts | accounts@test.com | password123 |

---

## 10. API Documentation

All API endpoints are prefixed with `/api`, and authentication is handled through JWT Bearer tokens passed in the `Authorization` header.

**Authentication**
- `POST /auth/login` — authenticates a user and returns a JWT along with the user's data.

**Customers (CRM)**
- `GET /customers` — retrieves all customers, with pagination.
- `POST /customers` — adds a new customer.
- `PUT /customers/:id` — updates a customer's details.
- `DELETE /customers/:id` — deletes a customer.

**Inventory (Products)**
- `GET /products` — retrieves products, with query filters for category, search, and an in-memory filter for `low_stock`.
- `POST /products` — adds a new product to the catalog.
- `PUT /products/:id` — updates product details such as price and minimum stock.
- `POST /inventory/stock` — adds or subtracts stock for a given product.

**Challans (Sales Operations)**
- `GET /challans` — retrieves a list of all challans.
- `POST /challans` — creates a new challan with line items.
- `PUT /challans/:id/status` — updates a challan's status (e.g., Draft → Confirmed).

*Note: the source README documents these endpoints directly but does not include a separate Postman collection file or link — the endpoint list above is the full extent of the API documentation currently available.*

---

## 11. Assumptions Made

1. **Role-Based Access Control:** It is assumed that the roles (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`) are strictly enforced at both the UI routing level and the backend middleware level.
2. **Supabase Setup:** It is assumed that the Supabase database schema — tables for `users`, `customers`, `products`, `challans`, and `challan_items` — is already defined and intact.
3. **Low Stock Filtering:** Because of Supabase's string formatting constraints on direct column comparisons, `low_stock` filtering is handled safely through in-memory server logic instead.
4. **Invoice Generation:** Invoice PDF generation relies on the browser's native print functionality, formatted via CSS `@media print`.

---

## 12. Recent Fixes & Improvements

- **Sidebar Dynamics:** The global sidebar navigation was upgraded to correctly display the dynamically authenticated user's name and role across all pages, replacing previously hardcoded placeholders.
- **Granular Action Protection:** The frontend was extensively overhauled to strictly enforce the CRUD permission matrix on action buttons ("Add", "Edit", "Delete", "Confirm"). Users without the correct write permissions now see a clean, restricted read-only interface.
- **Database Type Errors:** A critical Postgres integer type crash (`invalid input syntax for type integer: "minimum_stock"`) on the Products API route was fixed by moving direct column-to-column comparisons out of the database query and into the server controller.

---

## 13. Known Limitations / Incomplete Parts

The README does not include a dedicated "known limitations" section, but the following points can be drawn directly from its Assumptions and Recent Fixes notes:

- **Invoice generation is browser-dependent:** Since invoices rely on the browser's native print function with `@media print` CSS rather than a dedicated server-side PDF library, output consistency depends on the browser being used rather than being guaranteed by the application itself.
- **Low-stock filtering is a workaround, not a native query:** Due to Supabase's string formatting constraints, `low_stock` filtering happens in-memory on the server instead of as a direct database-level query, which was noted as a deliberate workaround rather than the ideal long-term solution.
- **Database schema is assumed pre-existing:** The system assumes the Supabase schema (`users`, `customers`, `products`, `challans`, `challan_items`) is already set up and intact; the README does not describe schema creation or migration scripts as part of this project.
- **No Postman collection provided:** Only a written list of API endpoints is documented in the README — there is no accompanying Postman collection file or link included with the project.

---

*Document compiled from TradeFlow's `README.md`.*
