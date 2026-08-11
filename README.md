# TradeFlow - ERP & CRM System

TradeFlow is a comprehensive web-based Enterprise Resource Planning (ERP) and Customer Relationship Management (CRM) system designed to streamline business operations, inventory management, customer tracking, and sales (challan) generation.

## Live Demo

- **Frontend URL:** [TradeFlow Frontend (Vercel/Netlify/Local)] *(Add your frontend URL here if deployed)*
- **Backend API URL:** `https://case-study-backend-3cb3.onrender.com/api`

### Test Login Credentials
| Role | Email | Password |
|------|-------|----------|
| **Admin** | `aniketkumar7091315698@gmail.com` | `Aniket@123` |
| **Sales** | `sales@test.com` | `password123` |
| **Warehouse** | `warehouse@test.com` | `password123` |

*(Note: Replace with actual credentials if different during manual seeding)*

---

##  Architecture Overview

The project follows a standard **Client-Server Architecture**:
1. **Frontend (Client):** Built with React.js (Create React App/Vite). It handles the user interface, routing (react-router-dom), and state management. The UI uses custom CSS variables for consistent theming and `react-icons` (Material Design) for iconography.
2. **Backend (Server):** A Node.js and Express.js REST API. It handles authentication, business logic, data validation, and serves as the bridge between the frontend and the database.
3. **Database:** Supabase (PostgreSQL) is used as the relational database. The backend communicates with Supabase via the official `@supabase/supabase-js` client.

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
*(Note: The `SUPABASE_KEY` must be the **service_role** key to bypass RLS policies if enforced, or the `anon` key depending on your database setup).*

**Frontend (`frontend/.env`):**
Create a `.env` file in the `frontend` directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
# Or VITE_API_URL if using Vite
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

**Deploying the Backend (e.g., Render, Railway, Heroku):**
1. Connect your GitHub repository to the hosting provider.
2. Set the root directory to `backend/`.
3. Add the required Environment Variables (`SUPABASE_URL`, `SUPABASE_KEY`, `JWT_SECRET`).
4. Set the build command to `npm install` and the start command to `node src/server.js`.

**Deploying the Frontend (e.g., Vercel, Netlify):**
1. Connect your GitHub repository to Vercel/Netlify.
2. Set the root directory to `frontend/`.
3. Add the Environment Variable (`REACT_APP_API_URL` or `VITE_API_URL`) pointing to your live backend URL (e.g., `https://case-study-backend-3cb3.onrender.com/api`).
4. Deploy the project.

---

##  API Documentation

All API endpoints are prefixed with `/api`. Authentication is handled via JWT Bearer tokens in the `Authorization` header.

### Authentication
- `POST /auth/login` - Authenticate a user and return a JWT and user data.

### Dashboard & Analytics
- `GET /admin/dashboard` - Get high-level stats (Total customers, active products, challans). *Requires ADMIN role.*
- `GET /reports/sales` - Get detailed sales reports and revenue data over time.

### Customers (CRM)
- `GET /customers` - Retrieve all customers with pagination.
- `POST /customers` - Add a new customer.
- `PUT /customers/:id` - Update customer details.

### Inventory (Products)
- `GET /products` - Retrieve all products, including stock levels.
- `POST /products` - Add a new product to the catalog.
- `PUT /products/:id` - Update product details (price, minimum stock).
- `POST /inventory/stock` - Add or subtract stock for a specific product.

### Challans (Sales Operations)
- `GET /challans` - Get a list of all challans.
- `POST /challans` - Create a new challan with line items.
- `PUT /challans/:id/status` - Update the status of a challan (e.g., Draft -> Confirmed).

---

##  Assumptions Made

1. **Role-Based Access Control (RBAC):** It is assumed that roles (`ADMIN`, `SALES`, `WAREHOUSE`) are strictly enforced at both the UI routing level and the Backend middleware level.
2. **Supabase Setup:** Assumed that the Supabase database schema (tables for `users`, `customers`, `products`, `challans`, `challan_items`) is already defined and intact.
3. **Currency:** All financial figures are assumed to be in INR (₹) as styled on the frontend.
4. **Invoice Generation:** The invoice PDF generation relies on browser-native print functionality formatted via CSS `@media print` rather than server-side PDF generation (e.g., Puppeteer/PDFKit) to reduce backend load and dependencies.

---

##  Known Limitations or Incomplete Parts

- **Password Reset:** The "Forgot Password" flow is currently not implemented on the backend.
- **Server-Side PDF Generation:** Invoices are generated on the client-side. A robust enterprise solution might eventually require server-side PDF generation for strict archiving and email attachments.
- **Advanced Filtering:** The data tables on the frontend currently support basic pagination, but advanced multi-field filtering and sorting are limited.
- **Real-time Updates:** Stock updates and challan status changes require a page refresh (or manual re-fetch) on the dashboard; WebSockets/Supabase Realtime subscriptions are not currently implemented.
