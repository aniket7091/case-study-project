import React from "react";
import LandingPage from "./pages/LandingPage";
import "./App.css";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProtectedRoute from "./components/ProtectedRoute";
import CustomersPage from "./pages/CustomersPage";
import ProductsPage from "./pages/ProductsPage";
import ChallansPage from "./pages/ChallansPage";
import UsersPage from "./pages/UsersPage";
import InventoryPage from "./pages/InventoryPage";
import ProfilePage from "./pages/ProfilePage";
import ReportsPage from "./pages/ReportsPage";
import { MODULES } from "./config/permissions";
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";




function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<LandingPage />} />
        <Route path="/features" element={<LandingPage />} />
        <Route path="/workflow" element={<LandingPage />} />
        <Route path="/roles" element={<LandingPage />} />
        <Route path="/about" element={<LandingPage />} />
        <Route path="/contact" element={<LandingPage />} />

        {/* for the login page */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute module={MODULES.DASHBOARD} />}>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>
        <Route element={<ProtectedRoute module={MODULES.CUSTOMERS} />}>
          <Route path="/customers" element={<CustomersPage />} />
        </Route>
        <Route element={<ProtectedRoute module={MODULES.PRODUCTS} />}>
          <Route path="/products" element={<ProductsPage />} />
        </Route>
        <Route element={<ProtectedRoute module={MODULES.CHALLANS} />}>
          <Route path="/challans" element={<ChallansPage />} />
        </Route>
        <Route element={<ProtectedRoute module={MODULES.USERS} />}>
          <Route path="/users" element={<UsersPage />} />
        </Route>
        <Route element={<ProtectedRoute module={MODULES.INVENTORY} />}>
          <Route path="/inventory" element={<InventoryPage />} />
        </Route>
        <Route element={<ProtectedRoute module={MODULES.PROFILE} />}>
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
        <Route element={<ProtectedRoute module={MODULES.REPORTS} />}>
          <Route path="/reports" element={<ReportsPage />} />
        </Route>





      </Routes>

    </BrowserRouter>
  );
}

export default App;
