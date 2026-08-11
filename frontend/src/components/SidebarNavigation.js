import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  NAVIGATION_ITEMS,
  canAccess,
  getStoredRole
} from "../config/permissions";

const SidebarNavigation = ({ onNavigate }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = getStoredRole();

  const itemsFor = (section) =>
    NAVIGATION_ITEMS.filter(
      (item) => item.section === section && canAccess(role, item.module)
    );

  const renderItems = (items) =>
    items.map((item) => (
      <button
        key={item.module}
        type="button"
        className={`dashboard-nav-item${location.pathname === item.path ? " active" : ""}`}
        onClick={() => {
          navigate(item.path);
          onNavigate?.();
        }}
      >
        <span className="nav-item-icon">{item.icon}</span>
        {item.label}
      </button>
    ));

  const mainItems = itemsFor("main");
  const adminItems = itemsFor("admin");

  return (
    <nav className="dashboard-nav" aria-label="Main navigation">
      {mainItems.length > 0 && <p className="nav-section-title">MAIN</p>}
      {renderItems(mainItems)}

      {adminItems.length > 0 && (
        <>
          <p className="nav-section-title second">
            {canAccess(role, "users") ? "ADMIN" : "INSIGHTS"}
          </p>
          {renderItems(adminItems)}
        </>
      )}
    </nav>
  );
};

export default SidebarNavigation;
