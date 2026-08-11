import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import {
  MdDashboard, MdPeople, MdInventory2, MdWarehouse,
  MdReceipt, MdSupervisedUserCircle, MdBarChart
} from "react-icons/md";
import SidebarNavigation from "../components/SidebarNavigation";
import PageHeader from "../components/PageHeader";
import DashboardErrorAlert from "../components/DashboardErrorAlert";
import ReportCardHeader from "../components/reports/ReportCardHeader";
import ReportEmptyState from "../components/reports/ReportEmptyState";
import ReportStatCard from "../components/reports/ReportStatCard";
import { getStoredUser } from "../config/permissions";

const ReportsPage = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "https://case-study-backend-3cb3.onrender.com/api";

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [challans, setChallans] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [user, setUser] = useState(null);

  const getToken = () =>
    localStorage.getItem("tradeflow_token");

  // 
  // FETCH HELPER
  // 

  const fetchAPI = async (endpoint) => {
    const token = getToken();

    const response = await fetch(
      `${API_URL}${endpoint}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          data.error ||
          "Unable to fetch report data."
      );
    }

    return data;
  };

  // 
  // FETCH REPORT DATA
  // 

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");

      if (!getToken()) {
        navigate("/login", { replace: true });
        return;
      }

      const [customerData, productData, challanData] =
        await Promise.all([
          fetchAPI("/customers?limit=1000"),
          fetchAPI("/products?limit=1000"),
          fetchAPI("/challans?limit=1000"),
        ]);

      const customerList =
        customerData.data?.customers ||
        customerData.customers ||
        customerData.data ||
        [];

      const productList =
        productData.data?.products ||
        productData.products ||
        productData.data ||
        [];

      const challanList =
        challanData.data?.challans ||
        challanData.challans ||
        challanData.data ||
        [];

      setCustomers(
        Array.isArray(customerList)
          ? customerList
          : []
      );

      setProducts(
        Array.isArray(productList)
          ? productList
          : []
      );

      setChallans(
        Array.isArray(challanList)
          ? challanList
          : []
      );
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to load reports."
      );
    } finally {
      setLoading(false);
    }
  };

  // 
  // LOAD USER
  // 

  useEffect(() => {
    try {
      const storedUser =
        localStorage.getItem(
          "tradeflow_user"
        );

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error(err);
    }

    fetchReports();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 
  // REPORT CALCULATIONS
  // 

  const stats = useMemo(() => {
    const confirmed = challans.filter(
      (item) =>
        String(item.status).toUpperCase() ===
        "CONFIRMED"
    );

    const drafts = challans.filter(
      (item) =>
        String(item.status).toUpperCase() ===
        "DRAFT"
    );

    const cancelled = challans.filter(
      (item) =>
        String(item.status).toUpperCase() ===
        "CANCELLED"
    );

    const totalQuantity = confirmed.reduce(
      (sum, challan) =>
        sum +
        Number(
          challan.total_quantity || 0
        ),
      0
    );

    const currentStock = products.reduce(
      (sum, product) =>
        sum +
        Number(
          product.current_stock || 0
        ),
      0
    );

    const lowStock = products.filter(
      (product) =>
        Number(
          product.current_stock || 0
        ) <=
        Number(
          product.minimum_stock_quantity ??
            product.min_stock_quantity ??
            product.minimum_stock_alert_quantity ??
            0
        )
    );

    return {
      totalCustomers: customers.length,
      totalProducts: products.length,
      totalChallans: challans.length,
      confirmedChallans: confirmed.length,
      draftChallans: drafts.length,
      cancelledChallans: cancelled.length,
      totalQuantity,
      currentStock,
      lowStock: lowStock.length,
    };
  }, [
    customers,
    products,
    challans,
  ]);

  // 
  // CUSTOMER STATUS
  // 

  const customerStats = useMemo(() => {
    return {
      lead: customers.filter(
        (item) =>
          String(item.status).toUpperCase() ===
          "LEAD"
      ).length,

      active: customers.filter(
        (item) =>
          String(item.status).toUpperCase() ===
          "ACTIVE"
      ).length,

      inactive: customers.filter(
        (item) =>
          String(item.status).toUpperCase() ===
          "INACTIVE"
      ).length,
    };
  }, [customers]);

  // 
  // PRODUCT CATEGORY REPORT
  // 

  const categoryReport = useMemo(() => {
    const categories = {};

    products.forEach((product) => {
      const category =
        product.category || "Uncategorized";

      if (!categories[category]) {
        categories[category] = {
          products: 0,
          stock: 0,
        };
      }

      categories[category].products += 1;

      categories[category].stock +=
        Number(
          product.current_stock || 0
        );
    });

    return Object.entries(categories)
      .map(([name, value]) => ({
        name,
        ...value,
      }))
      .sort(
        (a, b) =>
          b.stock - a.stock
      );
  }, [products]);

  // 
  // TOP PRODUCTS BY STOCK
  // 

  const topProducts = useMemo(() => {
    return [...products]
      .sort(
        (a, b) =>
          Number(
            b.current_stock || 0
          ) -
          Number(
            a.current_stock || 0
          )
      )
      .slice(0, 5);
  }, [products]);

  // 
  // RECENT CHALLANS
  // 

  const recentChallans = useMemo(() => {
    return [...challans]
      .sort(
        (a, b) =>
          new Date(
            b.created_at ||
              b.createdAt ||
              0
          ) -
          new Date(
            a.created_at ||
              a.createdAt ||
              0
          )
      )
      .slice(0, 6);
  }, [challans]);

  // 
  // DATE FORMAT
  // 

  const formatDate = (date) => {
    if (!date) return "-";

    try {
      return new Date(
        date
      ).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    } catch {
      return "-";
    }
  };

  // 
  // LOGOUT
  // 

  const handleLogout = () => {
    localStorage.removeItem(
      "tradeflow_token"
    );

    localStorage.removeItem(
      "tradeflow_user"
    );

    navigate("/login", {
      replace: true,
    });
  };

  // 
  // LOADING
  // 

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="profile-loading-box">
          Loading reports...
        </div>
      </div>
    );
  }

  // 
  // UI
  // 

  return (
    <div className="dashboard-page">

      {/* SIDEBAR */}

      <aside className="dashboard-sidebar-main">

        <div className="dashboard-brand">
          <div className="dashboard-logo">
            T
          </div>

          <span>
            TradeFlow
          </span>
        </div>

        <SidebarNavigation />

        <nav className="legacy-dashboard-nav" aria-hidden="true">

          <p className="nav-section-title">
            MAIN
          </p>

          <button
            className="dashboard-nav-item"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            <span className="nav-item-icon">
              <MdDashboard />
            </span>
            Dashboard
          </button>

          <button
            className="dashboard-nav-item"
            onClick={() =>
              navigate("/customers")
            }
          >
            <span className="nav-item-icon">
              <MdPeople />
            </span>
            Customers
          </button>

          <button
            className="dashboard-nav-item"
            onClick={() =>
              navigate("/products")
            }
          >
            <span className="nav-item-icon">
              <MdInventory2 />
            </span>
            Products
          </button>

          <button
            className="dashboard-nav-item"
            onClick={() =>
              navigate("/inventory")
            }
          >
            <span className="nav-item-icon">
              <MdWarehouse />
            </span>
            Inventory
          </button>

          <button
            className="dashboard-nav-item"
            onClick={() =>
              navigate("/challans")
            }
          >
            <span className="nav-item-icon">
              <MdReceipt />
            </span>
            Challans
          </button>

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

          <button className="dashboard-nav-item active">
            <span className="nav-item-icon">
              <MdBarChart />
            </span>
            Reports
          </button>

        </nav>

        <div className="dashboard-sidebar-bottom">

          <button
            className="profile-sidebar-user"
            onClick={() =>
              navigate("/profile")
            }
          >
            <div className="sidebar-avatar">
              {(getStoredUser()?.name || "A").charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>
                {getStoredUser()?.name || "User"}
              </strong>

              <span>
                {getStoredUser()?.role || "STAFF"}
              </span>
            </div>
          </button>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            <span>↪</span>
            Logout
          </button>

        </div>

      </aside>


      {/* MAIN CONTENT */}

      <main className="dashboard-content">

        <PageHeader
          breadcrumb="Analytics / Reports"
          title="Reports"
          subtitle="Overview of customers, products, inventory and sales challans."
          actions={
            <button
              className="report-refresh-button"
              onClick={fetchReports}
            >
              ↻ Refresh
            </button>
          }
        />


        {/* ERROR */}

        <DashboardErrorAlert
          message={error}
          onDismiss={() => setError("")}
        />


        {/* KPI CARDS */}

        <section className="report-stats-grid">

          <ReportStatCard
            label="CUSTOMERS"
            value={stats.totalCustomers}
            detail={`${customerStats.active} active`}
          />
          <ReportStatCard
            label="PRODUCTS"
            value={stats.totalProducts}
            detail={`${stats.lowStock} low stock`}
          />
          <ReportStatCard
            label="TOTAL STOCK"
            value={stats.currentStock}
            detail="units currently available"
          />
          <ReportStatCard
            label="CONFIRMED CHALLANS"
            value={stats.confirmedChallans}
            detail={`${stats.totalQuantity} units sold`}
          />

        </section>


        {/* CHALLAN + CUSTOMER REPORT */}

        <section className="reports-two-column">

          <div className="report-card">

            <ReportCardHeader
              eyebrow="SALES"
              title="Challan summary"
            />

            <div className="report-breakdown">

              <div>
                <span>
                  Confirmed
                </span>

                <strong>
                  {stats.confirmedChallans}
                </strong>
              </div>

              <div>
                <span>
                  Draft
                </span>

                <strong>
                  {stats.draftChallans}
                </strong>
              </div>

              <div>
                <span>
                  Cancelled
                </span>

                <strong>
                  {stats.cancelledChallans}
                </strong>
              </div>

              <div>
                <span>
                  Total quantity
                </span>

                <strong>
                  {stats.totalQuantity}
                </strong>
              </div>

            </div>

          </div>


          <div className="report-card">

            <ReportCardHeader
              eyebrow="CRM"
              title="Customer overview"
            />

            <div className="report-breakdown">

              <div>
                <span>
                  Leads
                </span>

                <strong>
                  {customerStats.lead}
                </strong>
              </div>

              <div>
                <span>
                  Active
                </span>

                <strong>
                  {customerStats.active}
                </strong>
              </div>

              <div>
                <span>
                  Inactive
                </span>

                <strong>
                  {customerStats.inactive}
                </strong>
              </div>

            </div>

          </div>

        </section>


        {/* INVENTORY REPORT */}

        <section className="report-card">

          <ReportCardHeader
            eyebrow="INVENTORY"
            title="Stock by category"
            meta={`${categoryReport.length} categories`}
          />


          {categoryReport.length === 0 ? (

            <ReportEmptyState>
              No product category data available.
            </ReportEmptyState>

          ) : (

            <div className="report-category-list">

              {categoryReport.map(
                (category) => {

                  const maxStock =
                    categoryReport[0]
                      ?.stock || 1;

                  const percentage =
                    Math.min(
                      100,
                      (category.stock /
                        maxStock) *
                        100
                    );

                  return (
                    <div
                      className="report-category-row"
                      key={category.name}
                    >

                      <div className="report-category-info">

                        <strong>
                          {category.name}
                        </strong>

                        <span>
                          {category.products}
                          {" "}products
                        </span>

                      </div>

                      <div className="report-progress">

                        <span
                          style={{
                            width:
                              `${percentage}%`,
                          }}
                        />

                      </div>

                      <strong>
                        {category.stock}
                      </strong>

                    </div>
                  );
                }
              )}

            </div>

          )}

        </section>


        {/* BOTTOM TWO COLUMNS */}

        <section className="reports-two-column">

          {/* TOP PRODUCTS */}

          <div className="report-card">

            <ReportCardHeader
              eyebrow="INVENTORY"
              title="Top stock products"
            />


            <div className="report-simple-list">

              {topProducts.length === 0 ? (

                <ReportEmptyState>
                  No products available.
                </ReportEmptyState>

              ) : (

                topProducts.map(
                  (product) => (

                    <div
                      className="report-list-item"
                      key={product.id}
                    >

                      <div>

                        <strong>
                          {product.name}
                        </strong>

                        <span>
                          {product.sku ||
                            product.code ||
                            "No SKU"}
                        </span>

                      </div>

                      <strong>
                        {product.current_stock || 0}
                      </strong>

                    </div>

                  )
                )

              )}

            </div>

          </div>


          {/* RECENT CHALLANS */}

          <div className="report-card">

            <ReportCardHeader
              eyebrow="SALES"
              title="Recent challans"
              action={
                <button
                  className="report-link-button"
                  onClick={() => navigate("/challans")}
                >
                  View all
                </button>
              }
            />


            <div className="report-simple-list">

              {recentChallans.length ===
              0 ? (

                <ReportEmptyState>
                  No challans available.
                </ReportEmptyState>

              ) : (

                recentChallans.map(
                  (challan) => (

                    <div
                      className="report-list-item"
                      key={challan.id}
                    >

                      <div>

                        <strong>
                          {
                            challan.challan_number ||
                            "Challan"
                          }
                        </strong>

                        <span>
                          {formatDate(
                            challan.created_at ||
                              challan.createdAt
                          )}
                        </span>

                      </div>

                      <span
                        className={
                          `report-status ${
                            String(
                              challan.status ||
                                ""
                            ).toLowerCase()
                          }`
                        }
                      >
                        {challan.status ||
                          "-"}
                      </span>

                    </div>

                  )
                )

              )}

            </div>

          </div>

        </section>

      </main>

    </div>
  );
};

export default ReportsPage;
