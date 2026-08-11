import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarNavigation from "../components/SidebarNavigation";
import PageHeader from "../components/PageHeader";
import DashboardErrorAlert from "../components/DashboardErrorAlert";
import {
  MdDashboard, MdPeople, MdInventory2, MdWarehouse,
  MdReceipt, MdSupervisedUserCircle, MdBarChart,
  MdArrowForward
} from "react-icons/md";
import "../App.css";

const DashboardPageHeader = PageHeader;

const DashboardPage = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "https://case-study-backend-3cb3.onrender.com/api";

  useEffect(() => {
    const storedUser = localStorage.getItem("tradeflow_user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Invalid user data");
      }
    }

    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const token =
        localStorage.getItem("tradeflow_token");

      if (!token) {
        navigate("/login");
        return;
      }

      const storedUser =
        localStorage.getItem("tradeflow_user");

      let currentUser = null;

      if (storedUser) {
        currentUser = JSON.parse(storedUser);
      }

      /*
       * Admin dashboard API
       *
       * GET /api/admin/dashboard
       */

      if (
        currentUser?.role === "ADMIN" ||
        currentUser?.role === "admin"
      ) {
        const response = await fetch(
          `${API_URL}/admin/dashboard`,
          {
            method: "GET",

            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
            "Unable to load dashboard"
          );
        }

        setStats(
          data.data ||
          data.dashboard ||
          data
        );
      }

    } catch (err) {
      console.error(err);

      setError(
        err.message ||
        "Unable to load dashboard data."
      );

    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("tradeflow_token");
    localStorage.removeItem("tradeflow_user");

    navigate("/login", {
      replace: true
    });
  };

  const getUserName = () => {
    if (!user) {
      return "User";
    }

    return (
      user.name ||
      user.full_name ||
      user.email?.split("@")[0] ||
      "User"
    );
  };

  const getRole = () => {
    if (!user?.role) {
      return "USER";
    }

    return user.role.toUpperCase();
  };

  return (
    <div className="dashboard-page">

      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 
          SIDEBAR
       */}

      <aside className={`dashboard-sidebar-main${sidebarOpen ? " sidebar-open" : ""}`}>

        <button
          type="button"
          className="mobile-menu-close"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu"
        >
          <span aria-hidden="true">✕</span>
          Close menu
        </button>

        <div className="dashboard-brand">

          <div className="dashboard-logo">
            T
          </div>

          <span>
            TradeFlow
          </span>

        </div>

        {/* Mobile-only profile card inside sidebar */}
        <div
          className="sidebar-mobile-profile profile-link-trigger"
          onClick={() => {
            setSidebarOpen(false);
            navigate("/profile");
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setSidebarOpen(false);
              navigate("/profile");
            }
          }}
          role="button"
          tabIndex={0}
        >

          <div className="sidebar-avatar">
            {getUserName().charAt(0).toUpperCase()}
          </div>

          <div>
            <strong>{getUserName()}</strong>
            <span>{getRole()}</span>
          </div>

          <button
            className="sidebar-mobile-close"
            onClick={(event) => {
              event.stopPropagation();
              setSidebarOpen(false);
            }}
            aria-label="Close"
          >
            ✕
          </button>

        </div>


        {/* Navigation */}

        <SidebarNavigation
          onNavigate={() => setSidebarOpen(false)}
        />

        <nav className="legacy-dashboard-nav" aria-hidden="true">

          <p className="nav-section-title">
            MAIN
          </p>

          <button
            className="dashboard-nav-item active"
            onClick={() => setSidebarOpen(false)}
          >
            <span className="nav-item-icon">
              <MdDashboard />
            </span>

            Dashboard
          </button>


          <button
            className="dashboard-nav-item"
            onClick={() => { navigate("/customers"); setSidebarOpen(false); }}
          >
            <span className="nav-item-icon">
              <MdPeople />
            </span>

            Customers
          </button>


          <button
            className="dashboard-nav-item"
            onClick={() => { navigate("/products"); setSidebarOpen(false); }}
          >
            <span className="nav-item-icon">
              <MdInventory2 />
            </span>

            Products
          </button>


          <button
            className="dashboard-nav-item"
            onClick={() => { navigate("/inventory"); setSidebarOpen(false); }}
          >
            <span className="nav-item-icon">
              <MdWarehouse />
            </span>

            Inventory
          </button>


          <button
            className="dashboard-nav-item"
            onClick={() => { navigate("/challans"); setSidebarOpen(false); }}
          >
            <span className="nav-item-icon">
              <MdReceipt />
            </span>

            Challans
          </button>


          {getRole() === "ADMIN" && (
            <>
              <p className="nav-section-title second">
                ADMIN
              </p>

              <button
                className="dashboard-nav-item"
                onClick={() =>
                  navigate("/users")
                }
              >
                <span className="nav-item-icon">
                  <MdSupervisedUserCircle />
                </span>

                Users
              </button>

              <button
                className="dashboard-nav-item"
                onClick={() =>
                  navigate("/reports")
                }
              >
                <span className="nav-item-icon">
                  <MdBarChart />
                </span>

                Reports
              </button>
            </>
          )}

        </nav>


        {/* Bottom */}

        <div className="dashboard-sidebar-bottom">

          <button
            type="button"
            className="sidebar-user-mini profile-link-trigger"
            onClick={() => navigate("/profile")}
          >

            <div className="sidebar-avatar">
              {getUserName()
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <strong>
                {getUserName()}
              </strong>

              <span>
                {getRole()}
              </span>
            </div>

          </button>


          <button
            className="logout-button"
            onClick={handleLogout}
          >
            <span>
              ↪
            </span>

            Logout
          </button>

        </div>

      </aside>


      {/* 
          MAIN CONTENT
       */}

      <main className="dashboard-content">

        {/* Header */}

        <DashboardPageHeader
          breadcrumb="Overview"
          title={`Good morning, ${getUserName()}`}
          subtitle="Here's what's happening with your business today."
          leading={
            <button
              className="hamburger-btn"
              onClick={() => setSidebarOpen((prev) => !prev)}
              aria-label={sidebarOpen ? "Close navigation" : "Open navigation"}
            >
              {sidebarOpen ? (
                <span className="hamburger-close">✕</span>
              ) : (
                <><span /><span /><span /></>
              )}
            </button>
          }
          actions={
            <>
              <button className="notification-button" title="Notifications">♢</button>
              <button
                type="button"
                className="header-user header-user-desktop profile-link-trigger"
                onClick={() => navigate("/profile")}
              >
                <div className="header-avatar">
                  {getUserName().charAt(0).toUpperCase()}
                </div>
                <div>
                  <strong>{getUserName()}</strong>
                  <span>{getRole()}</span>
                </div>
              </button>
            </>
          }
        />


        {/* Error */}

        {React.createElement(DashboardErrorAlert, { message: error })}


        {/* 
            ADMIN STATS
         */}

        {getRole() === "ADMIN" && (

          <section className="dashboard-stats">

            <div className="dashboard-stat-card">

              <div className="stat-card-top">
                <span>
                  Total Customers
                </span>

                <div className="stat-icon">
                  <MdPeople />
                </div>
              </div>

              <h2>
                {loading
                  ? "..."
                  : stats?.customers?.total ?? 0}
              </h2>

              <p>
                <span className="stat-positive">
                  {stats?.customers?.active ?? 0}
                </span>

                {" "}active customers
              </p>

            </div>


            <div className="dashboard-stat-card">

              <div className="stat-card-top">
                <span>
                  Total Products
                </span>

                <div className="stat-icon">
                  <MdInventory2 />
                </div>
              </div>

              <h2>
                {loading
                  ? "..."
                  : stats?.products?.total ?? 0}
              </h2>

              <p>
                <span className="stat-warning">
                  {stats?.products?.low_stock ?? 0}
                </span>

                {" "}low stock
              </p>

            </div>


            <div className="dashboard-stat-card">

              <div className="stat-card-top">
                <span>
                  Total Challans
                </span>

                <div className="stat-icon">
                  <MdReceipt />
                </div>
              </div>

              <h2>
                {loading
                  ? "..."
                  : stats?.challans?.total ?? 0}
              </h2>

              <p>
                <span className="stat-positive">
                  {stats?.challans?.confirmed ?? 0}
                </span>

                {" "}confirmed
              </p>

            </div>


            <div className="dashboard-stat-card">

              <div className="stat-card-top">
                <span>
                  Active Users
                </span>

                <div className="stat-icon">
                  <MdSupervisedUserCircle />
                </div>
              </div>

              <h2>
                {loading
                  ? "..."
                  : stats?.users?.active ?? 0}
              </h2>

              <p>
                out of{" "}
                {stats?.users?.total ?? 0}
                {" "}users
              </p>

            </div>

          </section>
        )}


        {/* 
            ROLE WELCOME
         */}

        {getRole() !== "ADMIN" && (

          <section className="role-overview">

            <div className="role-overview-content">

              <span className="role-overview-label">
                {getRole()} WORKSPACE
              </span>

              <h2>
                Welcome to your
                <br />
                <span>
                  TradeFlow workspace.
                </span>
              </h2>

              <p>
                Use the navigation to manage the
                operations available to your role.
              </p>

            </div>

            <div className="role-overview-icon">
              {getRole().charAt(0)}
            </div>

          </section>
        )}


        {/* 
            QUICK ACTIONS
         */}

        <section className="dashboard-section">

          <div className="section-title-row">

            <div>
              <p>
                QUICK ACTIONS
              </p>

              <h2>
                What would you like to do?
              </h2>
            </div>

          </div>


          <div className="quick-actions">

            {/* Customer */}

            {(getRole() === "ADMIN" ||
              getRole() === "SALES") && (

                <button
                  className="quick-action-card"
                  onClick={() =>
                    navigate("/customers")
                  }
                >

                  <div className="quick-action-icon">
                    <MdPeople />
                  </div>

                  <div>
                    <h3>
                      Manage Customers
                    </h3>

                    <p>
                      Add and manage customer
                      relationships.
                    </p>
                  </div>

                  <span>
                    <MdArrowForward />
                  </span>

                </button>
              )}


            {/* Products */}

            {(getRole() === "ADMIN" ||
              getRole() === "WAREHOUSE" ||
              getRole() === "SALES") && (

                <button
                  className="quick-action-card"
                  onClick={() =>
                    navigate("/products")
                  }
                >

                  <div className="quick-action-icon">
                    <MdInventory2 />
                  </div>

                  <div>
                    <h3>
                      Manage Products
                    </h3>

                    <p>
                      Manage products and pricing.
                    </p>
                  </div>

                  <span>
                    <MdArrowForward />
                  </span>

                </button>
              )}


            {/* Inventory */}

            {(getRole() === "ADMIN" ||
              getRole() === "WAREHOUSE") && (

                <button
                  className="quick-action-card"
                  onClick={() =>
                    navigate("/inventory")
                  }
                >

                  <div className="quick-action-icon">
                    <MdWarehouse />
                  </div>

                  <div>
                    <h3>
                      Inventory
                    </h3>

                    <p>
                      Track stock and movements.
                    </p>
                  </div>

                  <span>
                    →
                  </span>

                </button>
              )}


            {/* Challans */}

            {(getRole() === "ADMIN" ||
              getRole() === "SALES") && (

                <button
                  className="quick-action-card"
                  onClick={() =>
                    navigate("/challans")
                  }
                >

                  <div className="quick-action-icon">
                    <MdReceipt />
                  </div>

                  <div>
                    <h3>
                      Sales Challans
                    </h3>

                    <p>
                      Create and manage challans.
                    </p>
                  </div>

                  <span>
                    →
                  </span>

                </button>
              )}

          </div>

        </section>


        {/* 
            ADMIN BUSINESS OVERVIEW
         */}

        {getRole() === "ADMIN" && (

          <section className="dashboard-lower-grid">

            {/* Challans */}

            <div className="dashboard-panel">

              <div className="panel-header">

                <div>
                  <p>
                    SALES
                  </p>

                  <h2>
                    Challan Overview
                  </h2>
                </div>

                <button
                  onClick={() =>
                    navigate("/challans")
                  }
                >
                  View all →
                </button>

              </div>


              <div className="challan-stats">

                <div>
                  <strong>
                    {stats?.challans?.draft ?? 0}
                  </strong>

                  <span>
                    Draft
                  </span>
                </div>

                <div>
                  <strong>
                    {stats?.challans?.confirmed ?? 0}
                  </strong>

                  <span>
                    Confirmed
                  </span>
                </div>

                <div>
                  <strong>
                    {stats?.challans?.cancelled ?? 0}
                  </strong>

                  <span>
                    Cancelled
                  </span>
                </div>

              </div>

            </div>


            {/* Customers */}

            <div className="dashboard-panel">

              <div className="panel-header">

                <div>
                  <p>
                    CRM
                  </p>

                  <h2>
                    Customer Overview
                  </h2>
                </div>

                <button
                  onClick={() =>
                    navigate("/customers")
                  }
                >
                  View all →
                </button>

              </div>


              <div className="customer-summary">

                <div className="customer-summary-number">
                  {stats?.customers?.total ?? 0}
                </div>

                <div>

                  <span>
                    Total customers
                  </span>

                  <p>
                    {stats?.customers?.leads ?? 0}
                    {" "}leads currently in CRM
                  </p>

                </div>

              </div>

            </div>

          </section>
        )}


        {/* Footer */}

        <footer className="dashboard-footer">

          <span>
            © 2026 TradeFlow
          </span>

          <span>
            ERP & CRM Operations Portal
          </span>

        </footer>

      </main>

    </div>
  );
};
export default DashboardPage;
