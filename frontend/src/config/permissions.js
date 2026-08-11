import React from "react";
import {
  MdDashboard,
  MdPeople,
  MdInventory2,
  MdWarehouse,
  MdReceipt,
  MdSupervisedUserCircle,
  MdBarChart,
} from "react-icons/md";

export const ROLES = {
  ADMIN: "ADMIN",
  SALES: "SALES",
  WAREHOUSE: "WAREHOUSE",
  ACCOUNTS: "ACCOUNTS"
};

export const MODULES = {
  DASHBOARD: "dashboard",
  CUSTOMERS: "customers",
  PRODUCTS: "products",
  CHALLANS: "challans",
  USERS: "users",
  INVENTORY: "inventory",
  REPORTS: "reports",
  PROFILE: "profile"
};

const ALL_MODULES = Object.values(MODULES);

export const ROLE_PERMISSIONS = {
  // ADMIN: full access to everything
  [ROLES.ADMIN]: ALL_MODULES,

  // SALES: manage customers & challans, read-only products (to pick items in challan)
  [ROLES.SALES]: [
    MODULES.DASHBOARD,
    MODULES.CUSTOMERS,
    MODULES.CHALLANS,
    MODULES.PRODUCTS,
    MODULES.PROFILE
  ],

  // WAREHOUSE: manage products & stock movements, view inventory
  [ROLES.WAREHOUSE]: [
    MODULES.DASHBOARD,
    MODULES.PRODUCTS,
    MODULES.INVENTORY,
    MODULES.PROFILE
  ],

  // ACCOUNTS: read customers & challans for reconciliation, view reports
  [ROLES.ACCOUNTS]: [
    MODULES.DASHBOARD,
    MODULES.CUSTOMERS,
    MODULES.CHALLANS,
    MODULES.REPORTS,
    MODULES.PROFILE
  ]
};

export const NAVIGATION_ITEMS = [
  { module: MODULES.DASHBOARD, label: "Dashboard",  path: "/dashboard", icon: <MdDashboard />,          section: "main"  },
  { module: MODULES.CUSTOMERS, label: "Customers",  path: "/customers", icon: <MdPeople />,              section: "main"  },
  { module: MODULES.PRODUCTS,  label: "Products",   path: "/products",  icon: <MdInventory2 />,          section: "main"  },
  { module: MODULES.INVENTORY, label: "Inventory",  path: "/inventory", icon: <MdWarehouse />,           section: "main"  },
  { module: MODULES.CHALLANS,  label: "Challans",   path: "/challans",  icon: <MdReceipt />,             section: "main"  },
  { module: MODULES.USERS,     label: "Users",      path: "/users",     icon: <MdSupervisedUserCircle />,section: "admin" },
  { module: MODULES.REPORTS,   label: "Reports",    path: "/reports",   icon: <MdBarChart />,            section: "admin" },
];

const getJwtPayload = (token) => {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
};

export const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem("tradeflow_user");
    if (storedUser) return JSON.parse(storedUser);
  } catch {
    // Fall through to the JWT payload when stored user data is malformed.
  }

  const token = localStorage.getItem("tradeflow_token");
  return token ? getJwtPayload(token) : null;
};

export const getStoredRole = () => {
  const user = getStoredUser();
  return String(user?.role || user?.userRole || "").toUpperCase();
};

export const canAccess = (role, module) =>
  ROLE_PERMISSIONS[role]?.includes(module) || false;

export const canManageCustomers = (role) => [ROLES.ADMIN, ROLES.SALES].includes(role);
export const canManageProducts = (role) => [ROLES.ADMIN].includes(role);
export const canUpdateStock = (role) => [ROLES.ADMIN, ROLES.WAREHOUSE].includes(role);
export const canManageChallans = (role) => [ROLES.ADMIN, ROLES.SALES].includes(role);
export const canManageInventory = (role) => [ROLES.ADMIN, ROLES.WAREHOUSE].includes(role);
export const canManageUsers = (role) => [ROLES.ADMIN].includes(role);
