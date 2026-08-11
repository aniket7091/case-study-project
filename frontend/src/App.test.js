import {
  MODULES,
  ROLES,
  canAccess
} from "./config/permissions";

test("role permissions match the RBAC matrix", () => {
  expect(canAccess(ROLES.ADMIN, MODULES.USERS)).toBe(true);
  expect(canAccess(ROLES.SALES, MODULES.INVENTORY)).toBe(false);
  expect(canAccess(ROLES.WAREHOUSE, MODULES.CUSTOMERS)).toBe(false);
  expect(canAccess(ROLES.ACCOUNTS, MODULES.CHALLANS)).toBe(true);
});
