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
  [ROLES.ADMIN]: ALL_MODULES,
  [ROLES.SALES]: [
    MODULES.DASHBOARD,
    MODULES.CUSTOMERS,
    MODULES.CHALLANS,
    MODULES.PRODUCTS,
    MODULES.REPORTS,
    MODULES.PROFILE
  ],
  [ROLES.WAREHOUSE]: [
    MODULES.DASHBOARD,
    MODULES.PRODUCTS,
    MODULES.INVENTORY,
    MODULES.REPORTS,
    MODULES.PROFILE
  ],
  [ROLES.ACCOUNTS]: [
    MODULES.DASHBOARD,
    MODULES.CUSTOMERS,
    MODULES.PRODUCTS,
    MODULES.CHALLANS,
    MODULES.REPORTS,
    MODULES.PROFILE
  ]
};

export const NAVIGATION_ITEMS = [
  { module: MODULES.DASHBOARD, label: "Dashboard", path: "/dashboard", icon: "◉", section: "main" },
  { module: MODULES.CUSTOMERS, label: "Customers", path: "/customers", icon: "◎", section: "main" },
  { module: MODULES.PRODUCTS, label: "Products", path: "/products", icon: "◇", section: "main" },
  { module: MODULES.INVENTORY, label: "Inventory", path: "/inventory", icon: "▣", section: "main" },
  { module: MODULES.CHALLANS, label: "Challans", path: "/challans", icon: "≡", section: "main" },
  { module: MODULES.USERS, label: "Users", path: "/users", icon: "◉", section: "admin" },
  { module: MODULES.REPORTS, label: "Reports", path: "/reports", icon: "↗", section: "admin" }
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
