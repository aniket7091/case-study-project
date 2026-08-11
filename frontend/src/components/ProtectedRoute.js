import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import AccessDeniedPage from "../pages/AccessDeniedPage";
import { canAccess, getStoredRole } from "../config/permissions";

const ProtectedRoute = ({ module }) => {
  const token = localStorage.getItem("tradeflow_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (module && !canAccess(getStoredRole(), module)) {
    return <AccessDeniedPage />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
