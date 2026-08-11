import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarNavigation from "../components/SidebarNavigation";

import "../App.css";
import {
  MdDashboard, MdPeople, MdInventory2, MdWarehouse,
  MdReceipt, MdSupervisedUserCircle, MdBarChart
} from "react-icons/md";

const SidebarNavigationComponent = SidebarNavigation;

const DEFAULT_API_URL =
  "https://case-study-backend-3cb3.onrender.com/api";

const readApiResponse = async (response) => {
  const body = await response.text();

  try {
    return body ? JSON.parse(body) : {};
  } catch {
    throw new Error(
      response.status === 404
        ? "Inventory API endpoint was not found."
        : "Inventory service returned an unexpected response."
    );
  }
};

const InventoryPage = () => {
  const navigate = useNavigate();

  const API_URL =
    process.env.REACT_APP_API_URL ||
    DEFAULT_API_URL;

  // 
  // PRODUCTS
  // 

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // 
  // SEARCH
  // 

  const [search, setSearch] = useState("");

  const [lowStockOnly, setLowStockOnly] =
    useState(false);

  // 
  // PAGINATION
  // 

  const [page, setPage] = useState(1);

  const limit = 10;

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  // 
  // STOCK MOVEMENT MODAL
  // 

  const [showStockModal, setShowStockModal] =
    useState(false);

  const [selectedProduct, setSelectedProduct] =
    useState(null);

  // 
  // STOCK HISTORY MODAL
  // 

  const [showHistoryModal, setShowHistoryModal] =
    useState(false);

  const [stockHistory, setStockHistory] =
    useState([]);

  const [historyLoading, setHistoryLoading] =
    useState(false);

  // 
  // STOCK FORM
  // 

  const [stockForm, setStockForm] = useState({
    movement_type: "IN",
    quantity: 1,
    reason: ""
  });

  // 
  // SUBMITTING
  // 

  const [submitting, setSubmitting] =
    useState(false);

  // 
  // CURRENT USER
  // 

  const [currentUser, setCurrentUser] =
    useState(null);

  // 
  // TOKEN
  // 

  const getToken = () => {
    return localStorage.getItem(
      "tradeflow_token"
    );
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
      replace: true
    });
  };

  // 
  // CURRENT USER
  // 

  const loadCurrentUser = () => {
    try {
      const storedUser =
        localStorage.getItem(
          "tradeflow_user"
        );

      if (storedUser) {
        setCurrentUser(
          JSON.parse(storedUser)
        );
      }
    } catch (err) {
      console.error(
        "Current user error:",
        err
      );
    }
  };

  // 
  // FETCH PRODUCTS
  // 

  const fetchProducts = async () => {
    try {
      setLoading(true);

      setError("");

      const token = getToken();

      if (!token) {
        navigate("/login", {
          replace: true
        });

        return;
      }

      const params = new URLSearchParams();

      if (search.trim()) {
        params.append(
          "search",
          search.trim()
        );
      }

      if (lowStockOnly) {
        params.append(
          "low_stock",
          "true"
        );
      }

      params.append(
        "page",
        page
      );

      params.append(
        "limit",
        limit
      );

      const response = await fetch(
        `${API_URL}/products?${params.toString()}`,
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${token}`,

            "Content-Type":
              "application/json"
          }
        }
      );

      const data =
        await readApiResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Unable to fetch inventory."
        );
      }

      const productData =
        data.data?.products ||
        data.products ||
        data.data ||
        [];

      setProducts(
        Array.isArray(productData)
          ? productData
          : []
      );

      const paginationData =
        data.data?.pagination ||
        data.pagination ||
        {};

      const total =
        paginationData.total ||
        data.total ||
        productData.length;

      setPagination({
        page:
          paginationData.page ||
          data.page ||
          page,

        limit:
          paginationData.limit ||
          data.limit ||
          limit,

        total,

        totalPages:
          paginationData.totalPages ||
          data.totalPages ||
          Math.max(
            1,
            Math.ceil(
              total / limit
            )
          )
      });

    } catch (err) {
      console.error(
        "Inventory fetch error:",
        err
      );

      setError(
        err.message ||
          "Unable to load inventory."
      );
    } finally {
      setLoading(false);
    }
  };

  // 
  // INITIAL LOAD
  // 

  useEffect(() => {
    loadCurrentUser();

    fetchProducts();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    page,
    lowStockOnly
  ]);

  // 
  // SEARCH
  // 

  const handleSearch = (e) => {
    e.preventDefault();

    setPage(1);

    fetchProducts();
  };

  // 
  // RESET
  // 

  const resetFilters = () => {
    setSearch("");

    setLowStockOnly(false);

    setPage(1);
  };

  // 
  // STOCK STATS
  // 

  const totalStock = useMemo(() => {
    return products.reduce(
      (total, product) =>
        total +
        Number(
          product.current_stock || 0
        ),
      0
    );
  }, [products]);

  const lowStockProducts = useMemo(() => {
    return products.filter(
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
  }, [products]);

  const outOfStockProducts = useMemo(() => {
    return products.filter(
      (product) =>
        Number(
          product.current_stock || 0
        ) <= 0
    );
  }, [products]);

  // 
  // OPEN STOCK MODAL
  // 

  const openStockModal = (product) => {
    setSelectedProduct(product);

    setStockForm({
      movement_type: "IN",
      quantity: 1,
      reason: ""
    });

    setError("");

    setShowStockModal(true);
  };

  // 
  // STOCK FORM CHANGE
  // 

  const handleStockFormChange = (e) => {
    const {
      name,
      value
    } = e.target;

    setStockForm((prev) => ({
      ...prev,

      [name]:
        name === "quantity"
          ? Number(value)
          : value
    }));
  };

  // 
  // ADD STOCK MOVEMENT
  // 

  const handleStockMovement = async (e) => {
    e.preventDefault();

    if (!selectedProduct) {
      return;
    }

    setSubmitting(true);

    setError("");

    try {
      const token = getToken();

      if (!token) {
        navigate("/login", {
          replace: true
        });

        return;
      }

      const quantity =
        Number(
          stockForm.quantity
        );

      if (quantity <= 0) {
        throw new Error(
          "Quantity must be greater than 0."
        );
      }

      if (
        !stockForm.reason.trim()
      ) {
        throw new Error(
          "Please provide a reason for the stock movement."
        );
      }

      /*
       * Extra frontend validation for OUT.
       *
       * Backend remains the final authority.
       */

      if (
        stockForm.movement_type ===
          "OUT" &&
        quantity >
          Number(
            selectedProduct.current_stock ||
              0
          )
      ) {
        throw new Error(
          `Insufficient stock. Available stock: ${selectedProduct.current_stock || 0}`
        );
      }

      const payload = {
        quantity,

        movement_type:
          stockForm.movement_type,

        reason:
          stockForm.reason.trim()
      };

      const response = await fetch(
        `${API_URL}/products/${selectedProduct.id}/stock`,
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${token}`,

            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify(payload)
        }
      );

      const data =
        await readApiResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Unable to update stock."
        );
      }

      setShowStockModal(false);

      setSelectedProduct(null);

      setStockForm({
        movement_type: "IN",
        quantity: 1,
        reason: ""
      });

      await fetchProducts();

    } catch (err) {
      console.error(
        "Stock movement error:",
        err
      );

      setError(
        err.message ||
          "Unable to update stock."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // 
  // FETCH STOCK HISTORY
  // 

  const viewStockHistory = async (
    product
  ) => {
    setSelectedProduct(product);

    setShowHistoryModal(true);

    setHistoryLoading(true);

    setStockHistory([]);

    setError("");

    try {
      const token = getToken();

      const response = await fetch(
        `${API_URL}/products/${product.id}/stock`,
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${token}`,

            "Content-Type":
              "application/json"
          }
        }
      );

      const data =
        await readApiResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Unable to fetch stock history."
        );
      }

      const history =
        data.data?.movements ||
        data.data?.stockMovements ||
        data.movements ||
        data.stockMovements ||
        data.data ||
        [];

      setStockHistory(
        Array.isArray(history)
          ? history
          : []
      );

    } catch (err) {
      console.error(
        "Stock history error:",
        err
      );

      setError(
        err.message ||
          "Unable to load stock history."
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  // 
  // FORMAT DATE
  // 

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    try {
      return new Date(
        date
      ).toLocaleString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        }
      );
    } catch {
      return date;
    }
  };

  // 
  // STOCK STATUS
  // 

  const getStockStatus = (
    product
  ) => {
    const stock =
      Number(
        product.current_stock || 0
      );

    const minimum =
      Number(
        product.minimum_stock_quantity ??
          product.min_stock_quantity ??
          product.minimum_stock_alert_quantity ??
          0
      );

    if (stock <= 0) {
      return {
        label: "Out of stock",
        className:
          "inventory-stock out"
      };
    }

    if (stock <= minimum) {
      return {
        label: "Low stock",
        className:
          "inventory-stock low"
      };
    }

    return {
      label: "In stock",
      className:
        "inventory-stock good"
    };
  };

  // 
  // RENDER
  // 

  return (
    <div className="dashboard-page inventory-page">

      {/* 
          SIDEBAR
       */}

      <aside className="dashboard-sidebar-main">

        <div className="dashboard-brand">

          <div className="dashboard-logo">
            T
          </div>

          <span>
            TradeFlow
          </span>

        </div>


        {React.createElement(SidebarNavigationComponent)}

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


          <button className="dashboard-nav-item active">
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

        </nav>


        <div className="dashboard-sidebar-bottom">

          <div className="sidebar-user-mini">

            <div className="sidebar-avatar">
              {(
                currentUser?.name ||
                "A"
              )
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>

              <strong>
                {
                  currentUser?.name ||
                  "Admin"
                }
              </strong>

              <span>
                {
                  currentUser?.role ||
                  "ADMIN"
                }
              </span>

            </div>

          </div>


          <button
            className="logout-button"
            onClick={
              handleLogout
            }
          >
            <span>
              ↪
            </span>

            Logout
          </button>

        </div>

      </aside>


      {/* 
          MAIN
       */}

      <main className="dashboard-content">

        <header className="dashboard-header">

          <div>

            <p className="dashboard-breadcrumb">
              Inventory / Stock
            </p>

            <h1>
              Inventory
            </h1>

            <p className="dashboard-subtitle">
              Monitor stock levels and manage
              stock movements.
            </p>

          </div>


          <div className="dashboard-header-right">

            <button
              className="notification-button"
            >
              ♢
            </button>

          </div>

        </header>


        {/* 
            ERROR
         */}

        {error && (

          <div className="dashboard-error">

            <span>
              !
            </span>

            {error}

            <button
              onClick={() =>
                setError("")
              }
            >
              ×
            </button>

          </div>

        )}


        {/* 
            STATS
         */}

        <section className="inventory-stats">

          <div className="inventory-stat-card">

            <div className="inventory-stat-icon">
              ◇
            </div>

            <div>

              <span>
                TOTAL PRODUCTS
              </span>

              <strong>
                {pagination.total}
              </strong>

            </div>

          </div>


          <div className="inventory-stat-card">

            <div className="inventory-stat-icon">
              ▣
            </div>

            <div>

              <span>
                CURRENT STOCK
              </span>

              <strong>
                {totalStock}
              </strong>

            </div>

          </div>


          <div className="inventory-stat-card warning">

            <div className="inventory-stat-icon">
              !
            </div>

            <div>

              <span>
                LOW STOCK
              </span>

              <strong>
                {lowStockProducts.length}
              </strong>

            </div>

          </div>


          <div className="inventory-stat-card danger">

            <div className="inventory-stat-icon">
              ×
            </div>

            <div>

              <span>
                OUT OF STOCK
              </span>

              <strong>
                {outOfStockProducts.length}
              </strong>

            </div>

          </div>

        </section>


        {/* 
            FILTERS
         */}

        <section className="customer-filters">

          <form
            className="customer-search"
            onSubmit={
              handleSearch
            }
          >

            <span>
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search product or SKU..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

            <button type="submit">
              Search
            </button>

          </form>


          <button
            className={
              lowStockOnly
                ? "inventory-filter-button active"
                : "inventory-filter-button"
            }
            onClick={() => {

              setLowStockOnly(
                (prev) => !prev
              );

              setPage(1);

            }}
          >
            {lowStockOnly
              ? "✓ Low stock only"
              : "Low stock only"}
          </button>


          <button
            className="reset-filter-button"
            onClick={
              resetFilters
            }
          >
            Reset
          </button>

        </section>


        {/* 
            TABLE
         */}

        <section className="customer-table-card">

          <div className="customer-table-header">

            <div>

              <p>
                INVENTORY MANAGEMENT
              </p>

              <h2>
                Stock overview
              </h2>

            </div>

            <span>
              {pagination.total}
              {" "}products
            </span>

          </div>


          {loading ? (

            <div className="customer-empty">
              Loading inventory...
            </div>

          ) : products.length === 0 ? (

            <div className="customer-empty">

              <div>
                ▣
              </div>

              <h3>
                No products found
              </h3>

              <p>
                Try changing your search or
                filters.
              </p>

            </div>

          ) : (

            <div className="customer-table-wrapper">

              <table className="customer-table">

                <thead>

                  <tr>

                    <th>
                      PRODUCT
                    </th>

                    <th>
                      SKU
                    </th>

                    <th>
                      CATEGORY
                    </th>

                    <th>
                      LOCATION
                    </th>

                    <th>
                      CURRENT STOCK
                    </th>

                    <th>
                      MINIMUM
                    </th>

                    <th>
                      STATUS
                    </th>

                    <th>
                      ACTIONS
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {products.map(
                    (product) => {

                      const stockStatus =
                        getStockStatus(
                          product
                        );

                      const minimum =
                        product.minimum_stock_quantity ??
                        product.min_stock_quantity ??
                        product.minimum_stock_alert_quantity ??
                        0;

                      return (

                        <tr
                          key={
                            product.id
                          }
                        >

                          {/* PRODUCT */}

                          <td>

                            <div className="customer-name-cell">

                              <div className="customer-avatar">
                                {(
                                  product.name ||
                                  "P"
                                )
                                  .charAt(
                                    0
                                  )
                                  .toUpperCase()}
                              </div>

                              <div>

                                <strong>
                                  {
                                    product.name ||
                                    "-"
                                  }
                                </strong>

                                <span>
                                  ID:{" "}
                                  {
                                    product.id
                                  }
                                </span>

                              </div>

                            </div>

                          </td>


                          {/* SKU */}

                          <td>
                            {
                              product.sku ||
                              product.code ||
                              "-"
                            }
                          </td>


                          {/* CATEGORY */}

                          <td>
                            {
                              product.category ||
                              "-"
                            }
                          </td>


                          {/* LOCATION */}

                          <td>
                            {
                              product.location ||
                              product.warehouse ||
                              product.warehouse_location ||
                              "-"
                            }
                          </td>


                          {/* STOCK */}

                          <td>

                            <strong
                              className="inventory-stock-number"
                            >
                              {
                                product.current_stock ??
                                0
                              }
                            </strong>

                          </td>


                          {/* MINIMUM */}

                          <td>
                            {minimum}
                          </td>


                          {/* STATUS */}

                          <td>

                            <span
                              className={
                                stockStatus.className
                              }
                            >

                              <span></span>

                              {
                                stockStatus.label
                              }

                            </span>

                          </td>


                          {/* ACTIONS */}

                          <td>

                            <div className="customer-actions">

                              <button
                                onClick={() =>
                                  openStockModal(
                                    product
                                  )
                                }
                              >
                                Adjust
                              </button>

                              <button
                                onClick={() =>
                                  viewStockHistory(
                                    product
                                  )
                                }
                              >
                                History
                              </button>

                            </div>

                          </td>

                        </tr>

                      );

                    }
                  )}

                </tbody>

              </table>

            </div>

          )}


          {/* ===================================
              PAGINATION
          =================================== */}

          {!loading &&
            products.length > 0 && (

              <div className="customer-pagination">

                <span>
                  Page{" "}
                  {pagination.page}
                  {" "}of{" "}
                  {pagination.totalPages}
                </span>


                <div>

                  <button
                    disabled={
                      page <= 1
                    }
                    onClick={() =>
                      setPage(
                        (prev) =>
                          Math.max(
                            1,
                            prev - 1
                          )
                      )
                    }
                  >
                    ← Previous
                  </button>


                  <button
                    disabled={
                      page >=
                      pagination.totalPages
                    }
                    onClick={() =>
                      setPage(
                        (prev) =>
                          prev + 1
                      )
                    }
                  >
                    Next →
                  </button>

                </div>

              </div>

            )}

        </section>

      </main>


      {/* 
          STOCK MOVEMENT MODAL
       */}

      {showStockModal && (

        <div className="customer-modal-overlay">

          <div className="customer-modal">

            <div className="customer-modal-header">

              <div>

                <p>
                  INVENTORY
                </p>

                <h2>
                  Stock adjustment
                </h2>

              </div>

              <button
                onClick={() =>
                  setShowStockModal(
                    false
                  )
                }
              >
                ×
              </button>

            </div>


            {selectedProduct && (

              <form
                className="customer-form"
                onSubmit={
                  handleStockMovement
                }
              >

                {/* PRODUCT */}

                <div className="inventory-selected-product">

                  <div className="customer-avatar">
                    {(
                      selectedProduct.name ||
                      "P"
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>

                    <strong>
                      {
                        selectedProduct.name
                      }
                    </strong>

                    <span>
                      SKU:{" "}
                      {
                        selectedProduct.sku ||
                        selectedProduct.code ||
                        "-"
                      }
                    </span>

                  </div>

                  <div className="inventory-current-stock">

                    <span>
                      Current stock
                    </span>

                    <strong>
                      {
                        selectedProduct.current_stock ??
                        0
                      }
                    </strong>

                  </div>

                </div>


                {/* MOVEMENT TYPE */}

                <div className="customer-form-group full">

                  <label>
                    Movement type *
                  </label>

                  <div className="stock-type-selector">

                    <button
                      type="button"
                      className={
                        stockForm.movement_type ===
                        "IN"
                          ? "selected in"
                          : ""
                      }
                      onClick={() =>
                        setStockForm(
                          (prev) => ({
                            ...prev,
                            movement_type:
                              "IN"
                          })
                        )
                      }
                    >
                      <span>
                        ↑
                      </span>

                      Stock IN
                    </button>


                    <button
                      type="button"
                      className={
                        stockForm.movement_type ===
                        "OUT"
                          ? "selected out"
                          : ""
                      }
                      onClick={() =>
                        setStockForm(
                          (prev) => ({
                            ...prev,
                            movement_type:
                              "OUT"
                          })
                        )
                      }
                    >
                      <span>
                        ↓
                      </span>

                      Stock OUT
                    </button>

                  </div>

                </div>


                {/* QUANTITY */}

                <div className="customer-form-group full">

                  <label>
                    Quantity *
                  </label>

                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    value={
                      stockForm.quantity
                    }
                    onChange={
                      handleStockFormChange
                    }
                    required
                  />

                  {stockForm.movement_type ===
                    "OUT" && (

                    <small className="form-help">
                      Available stock:{" "}
                      {
                        selectedProduct.current_stock ??
                        0
                      }
                    </small>

                  )}

                </div>


                {/* REASON */}

                <div className="customer-form-group full">

                  <label>
                    Reason *
                  </label>

                  <textarea
                    name="reason"
                    value={
                      stockForm.reason
                    }
                    onChange={
                      handleStockFormChange
                    }
                    placeholder={
                      stockForm.movement_type ===
                      "IN"
                        ? "e.g. New supplier delivery"
                        : "e.g. Damaged goods / Sales order"
                    }
                    rows="3"
                    required
                  />

                </div>


                {/* FOOTER */}

                <div className="customer-form-footer">

                  <button
                    type="button"
                    className="modal-cancel-button"
                    onClick={() =>
                      setShowStockModal(
                        false
                      )
                    }
                  >
                    Cancel
                  </button>


                  <button
                    type="submit"
                    className="modal-submit-button"
                    disabled={
                      submitting
                    }
                  >
                    {submitting
                      ? "Updating..."
                      : "Update stock"}
                  </button>

                </div>

              </form>

            )}

          </div>

        </div>

      )}


      {/* 
          STOCK HISTORY MODAL
       */}

      {showHistoryModal && (

        <div className="customer-modal-overlay">

          <div className="inventory-history-modal">

            <div className="customer-modal-header">

              <div>

                <p>
                  INVENTORY
                </p>

                <h2>
                  Stock movement history
                </h2>

              </div>

              <button
                onClick={() =>
                  setShowHistoryModal(
                    false
                  )
                }
              >
                ×
              </button>

            </div>


            {selectedProduct && (

              <div className="inventory-history-body">

                {/* PRODUCT HEADER */}

                <div className="inventory-selected-product">

                  <div className="customer-avatar">
                    {(
                      selectedProduct.name ||
                      "P"
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>

                    <strong>
                      {
                        selectedProduct.name
                      }
                    </strong>

                    <span>
                      SKU:{" "}
                      {
                        selectedProduct.sku ||
                        selectedProduct.code ||
                        "-"
                      }
                    </span>

                  </div>

                  <div className="inventory-current-stock">

                    <span>
                      Current stock
                    </span>

                    <strong>
                      {
                        selectedProduct.current_stock ??
                        0
                      }
                    </strong>

                  </div>

                </div>


                {/* HISTORY */}

                {historyLoading ? (

                  <div className="customer-empty">
                    Loading stock history...
                  </div>

                ) : stockHistory.length ===
                  0 ? (

                  <div className="customer-empty">

                    <div>
                      ▣
                    </div>

                    <h3>
                      No stock movements
                    </h3>

                    <p>
                      There is no movement
                      history for this product.
                    </p>

                  </div>

                ) : (

                  <div className="inventory-history-list">

                    {stockHistory.map(
                      (
                        movement,
                        index
                      ) => {

                        const movementType =
                          String(
                            movement.movement_type ||
                              movement.type ||
                              ""
                          ).toUpperCase();

                        const isIn =
                          movementType ===
                          "IN";

                        return (

                          <div
                            className="inventory-history-item"
                            key={
                              movement.id ||
                              index
                            }
                          >

                            <div
                              className={
                                isIn
                                  ? "inventory-movement-icon in"
                                  : "inventory-movement-icon out"
                              }
                            >
                              {isIn
                                ? "↑"
                                : "↓"}
                            </div>


                            <div className="inventory-history-main">

                              <div>

                                <strong>
                                  Stock{" "}
                                  {
                                    isIn
                                      ? "IN"
                                      : "OUT"
                                  }
                                </strong>

                                <span>
                                  {
                                    movement.reason ||
                                    "-"
                                  }
                                </span>

                              </div>


                              <div className="inventory-history-meta">

                                <strong
                                  className={
                                    isIn
                                      ? "movement-quantity in"
                                      : "movement-quantity out"
                                  }
                                >
                                  {isIn
                                    ? "+"
                                    : "-"}
                                  {
                                    movement.quantity ??
                                    0
                                  }
                                </strong>

                                <span>
                                  {
                                    formatDate(
                                      movement.created_at ||
                                        movement.timestamp
                                    )
                                  }
                                </span>

                              </div>

                            </div>

                          </div>

                        );

                      }
                    )}

                  </div>

                )}


                <div className="customer-form-footer">

                  <button
                    className="modal-cancel-button"
                    onClick={() =>
                      setShowHistoryModal(
                        false
                      )
                    }
                  >
                    Close
                  </button>

                  <button
                    className="modal-submit-button"
                    onClick={() => {

                      setShowHistoryModal(
                        false
                      );

                      openStockModal(
                        selectedProduct
                      );

                    }}
                  >
                    Adjust stock
                  </button>

                </div>

              </div>

            )}

          </div>

        </div>

      )}

    </div>
  );
};

export default InventoryPage;
