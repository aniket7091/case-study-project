import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarNavigation from "../components/SidebarNavigation";
import PageHeader from "../components/PageHeader";
import DashboardErrorAlert from "../components/DashboardErrorAlert";
import DataListHeader from "../components/DataListHeader";

import "../App.css";
import {
  MdDashboard, MdPeople, MdInventory2, MdWarehouse,
  MdReceipt, MdSupervisedUserCircle, MdBarChart
} from "react-icons/md";

const DEFAULT_API_URL =
  "https://case-study-backend-3cb3.onrender.com/api";

const readApiResponse = async (response) => {
  const body = await response.text();

  try {
    return body ? JSON.parse(body) : {};
  } catch {
    throw new Error(
      response.status === 404
        ? "Product API endpoint was not found."
        : "Product service returned an unexpected response."
    );
  }
};

const ProductsPage = () => {
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

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  // 
  // FILTERS
  // 

  const [search, setSearch] = useState("");

  const [category, setCategory] = useState("");

  const [lowStock, setLowStock] = useState(false);

  const [page, setPage] = useState(1);

  const limit = 10;

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  // 
  // MODALS
  // 

  const [showProductModal, setShowProductModal] =
    useState(false);

  const [showStockModal, setShowStockModal] =
    useState(false);

  const [showMovementModal, setShowMovementModal] =
    useState(false);

  const [selectedProduct, setSelectedProduct] =
    useState(null);

  const [editingProduct, setEditingProduct] =
    useState(null);

  // 
  // SUBMITTING
  // 

  const [submitting, setSubmitting] =
    useState(false);

  // 
  // PRODUCT FORM
  // 

  const [productForm, setProductForm] = useState({
    name: "",
    sku: "",
    category: "",
    unit_price: "",
    current_stock: "",
    minimum_stock_alert_quantity: "",
    location: ""
  });

  // 
  // STOCK FORM
  // 

  const [stockForm, setStockForm] = useState({
    quantity: "",
    movement_type: "IN",
    reason: ""
  });

  // 
  // STOCK MOVEMENTS
  // 

  const [movements, setMovements] = useState([]);

  const [movementLoading, setMovementLoading] =
    useState(false);

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

      if (category) {
        params.append(
          "category",
          category
        );
      }

      if (lowStock) {
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
          "Unable to fetch products."
        );
      }

      /*
       * Support common response structures.
       */

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
        "Product fetch error:",
        err
      );

      setError(
        err.message ||
        "Unable to load products."
      );

    } finally {

      setLoading(false);

    }
  };

  // 
  // LOAD PRODUCTS
  // 

  useEffect(() => {

    fetchProducts();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    page,
    category,
    lowStock
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
  // RESET FILTERS
  // 

  const resetFilters = () => {

    setSearch("");

    setCategory("");

    setLowStock(false);

    setPage(1);
  };

  // 
  // PRODUCT FORM CHANGE
  // 

  const handleProductFormChange = (e) => {

    const {
      name,
      value
    } = e.target;

    setProductForm((prev) => ({
      ...prev,
      [name]: value
    }));
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
      [name]: value
    }));
  };

  // 
  // OPEN ADD PRODUCT
  // 

  const openAddProduct = () => {

    setEditingProduct(null);

    setProductForm({
      name: "",
      sku: "",
      category: "",
      unit_price: "",
      current_stock: "",
      minimum_stock_alert_quantity: "",
      location: ""
    });

    setShowProductModal(true);
  };

  // 
  // OPEN EDIT PRODUCT
  // 

  const openEditProduct = (product) => {

    setEditingProduct(product);

    setProductForm({
      name:
        product.name || "",

      sku:
        product.sku ||
        product.code ||
        "",

      category:
        product.category ||
        "",

      unit_price:
        product.unit_price ??
        "",

      current_stock:
        product.current_stock ??
        "",

      minimum_stock_alert_quantity:
        product.minimum_stock ??
        product.minimum_stock_alert_quantity ??
        product.min_stock_alert_quantity ??
        "",

      location:
        product.warehouse_location ||
        product.location ||
        product.warehouse ||
        ""
    });

    setShowProductModal(true);
  };

  // 
  // CREATE / UPDATE PRODUCT
  // 

  const handleProductSubmit = async (e) => {

    e.preventDefault();

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

      const isEditing =
        Boolean(editingProduct);

      const url = isEditing
        ? `${API_URL}/products/${editingProduct.id}`
        : `${API_URL}/products`;

      const method = isEditing
        ? "PUT"
        : "POST";

      /*
       * Convert numeric fields properly.
       */

      const payload = {
        name:
          productForm.name.trim(),

        sku:
          productForm.sku.trim(),

        category:
          productForm.category.trim(),

        unit_price:
          Number(productForm.unit_price),

        minimum_stock:
          Number(
            productForm.minimum_stock_alert_quantity
          ),

        warehouse_location:
          productForm.location.trim()
      };

      /*
       * Current stock is useful when creating
       * a product.
       *
       * For editing, stock should normally be
       * changed through stock movement API.
       */

      if (!isEditing) {

        payload.current_stock =
          Number(
            productForm.current_stock || 0
          );

      }

      const response = await fetch(
        url,
        {
          method,

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
          `Unable to ${isEditing
            ? "update"
            : "create"
          } product.`
        );
      }

      setShowProductModal(false);

      setEditingProduct(null);

      await fetchProducts();

    } catch (err) {

      console.error(
        "Product submit error:",
        err
      );

      setError(
        err.message ||
        "Unable to save product."
      );

    } finally {

      setSubmitting(false);

    }
  };

  // 
  // OPEN STOCK MODAL
  // 

  const openStockModal = (product) => {

    setSelectedProduct(product);

    setStockForm({
      quantity: "",
      movement_type: "IN",
      reason: ""
    });

    setShowStockModal(true);
  };

  // 
  // STOCK MOVEMENT
  // 

  const handleStockSubmit = async (e) => {

    e.preventDefault();

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

      if (
        Number(stockForm.quantity) <= 0
      ) {
        throw new Error(
          "Quantity must be greater than 0."
        );
      }

      const payload = {
        quantity:
          Number(stockForm.quantity),

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
          "Unable to update stock."
        );
      }

      setShowStockModal(false);

      setSelectedProduct(null);

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
  // FETCH STOCK MOVEMENTS
  // 

  const fetchMovements = async (
    product
  ) => {

    setSelectedProduct(product);

    setShowMovementModal(true);

    setMovementLoading(true);

    setMovements([]);

    setError("");

    try {

      const token = getToken();

      if (!token) {
        navigate("/login", {
          replace: true
        });

        return;
      }

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
          "Unable to fetch stock history."
        );
      }

      const movementData =
        data.data?.movements ||
        data.movements ||
        data.data ||
        [];

      setMovements(
        Array.isArray(movementData)
          ? movementData
          : []
      );

    } catch (err) {

      console.error(
        "Movement fetch error:",
        err
      );

      setError(
        err.message ||
        "Unable to load stock history."
      );

    } finally {

      setMovementLoading(false);

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
      ).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric"
        }
      );

    } catch {

      return date;

    }
  };

  // 
  // FORMAT CURRENCY
  // 

  const formatCurrency = (value) => {

    const number =
      Number(value || 0);

    return number.toLocaleString(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2
      }
    );
  };

  // 
  // LOW STOCK
  // 

  const isLowStock = (product) => {

    const current =
      Number(
        product.current_stock || 0
      );

    const minimum =
      Number(
        product.minimum_stock ??
        product.minimum_stock_alert_quantity ??
        product.min_stock_alert_quantity ??
        0
      );

    return (
      current <= minimum
    );
  };

  // 
  // RENDER
  // 

  return (
    <div className="dashboard-page products-page">

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

        <div className="dashboard-brand">

          <div className="dashboard-logo">
            T
          </div>

          <span>
            TradeFlow
          </span>

        </div>


        {React.createElement(SidebarNavigation, {
          onNavigate: () => setSidebarOpen(false)
        })}

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
            className="dashboard-nav-item active"
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
              A
            </div>

            <div>

              <strong>
                Admin
              </strong>

              <span>
                ADMIN
              </span>

            </div>

          </div>


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

        <PageHeader
          breadcrumb="Inventory / Products"
          title="Products"
          subtitle="Manage products, pricing and stock."
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
              <button className="notification-button">♢</button>
              <button
                className="customer-add-button"
                onClick={openAddProduct}
              >
                + Add product
              </button>
            </>
          }
        />


        {/* 
            ERROR
         */}

        <DashboardErrorAlert
          message={error}
          onDismiss={() => setError("")}
        />


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
              placeholder="Search products..."
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


          <input
            className="product-category-input"
            type="text"
            placeholder="Category"
            value={category}
            onChange={(e) => {

              setCategory(
                e.target.value
              );

              setPage(1);

            }}
          />


          <button
            className={
              lowStock
                ? "low-stock-filter active"
                : "low-stock-filter"
            }
            onClick={() => {

              setLowStock(
                (prev) => !prev
              );

              setPage(1);

            }}
          >
            ⚠ Low stock
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
            PRODUCT TABLE
         */}

        <section className="customer-table-card">

          <DataListHeader
            eyebrow="PRODUCT & INVENTORY"
            title="Product list"
            countLabel={`${pagination.total} products`}
          />


          {loading ? (

            <div className="customer-empty">
              Loading products...
            </div>

          ) : products.length === 0 ? (

            <div className="customer-empty">

              <div>
                ◇
              </div>

              <h3>
                No products found
              </h3>

              <p>
                Try changing your filters
                or add a new product.
              </p>

              <button
                onClick={
                  openAddProduct
                }
              >
                + Add product
              </button>

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
                      UNIT PRICE
                    </th>

                    <th>
                      STOCK
                    </th>

                    <th>
                      LOCATION
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
                    (product) => (

                      <tr
                        key={
                          product.id
                        }
                      >

                        {/* Product */}

                        <td>

                          <div className="customer-name-cell">

                            <div className="customer-avatar">
                              P
                            </div>

                            <div>

                              <strong>
                                {
                                  product.name ||
                                  "-"
                                }
                              </strong>

                              <span>
                                {
                                  product.description ||
                                  "Product"
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


                        {/* Category */}

                        <td>
                          {
                            product.category ||
                            "-"
                          }
                        </td>


                        {/* Price */}

                        <td>
                          {
                            formatCurrency(
                              product.unit_price
                            )
                          }
                        </td>


                        {/* Stock */}

                        <td>

                          <strong
                            className={
                              isLowStock(
                                product
                              )
                                ? "stock-value low"
                                : "stock-value"
                            }
                          >
                            {
                              product.current_stock ??
                              0
                            }
                          </strong>

                          {isLowStock(
                            product
                          ) && (

                              <span className="stock-alert">
                                Low
                              </span>

                            )}

                        </td>


                        {/* Location */}

                        <td>
                          {
                            product.warehouse_location ||
                            product.location ||
                            product.warehouse ||
                            "-"
                          }
                        </td>


                        {/* Status */}

                        <td>

                          <span
                            className={
                              isLowStock(
                                product
                              )
                                ? "customer-status lead"
                                : "customer-status active"
                            }
                          >

                            <span></span>

                            {
                              isLowStock(
                                product
                              )
                                ? "Low stock"
                                : "Healthy"
                            }

                          </span>

                        </td>


                        {/* Actions */}

                        <td>

                          <div className="customer-actions">

                            <button
                              onClick={() =>
                                openEditProduct(
                                  product
                                )
                              }
                            >
                              Edit
                            </button>


                            <button
                              onClick={() =>
                                openStockModal(
                                  product
                                )
                              }
                            >
                              Stock
                            </button>


                            <button
                              onClick={() =>
                                fetchMovements(
                                  product
                                )
                              }
                            >
                              History
                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}


          {/* 
              PAGINATION
           */}

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
          ADD / EDIT PRODUCT MODAL
       */}

      {showProductModal && (

        <div className="customer-modal-overlay">

          <div className="customer-modal">

            <div className="customer-modal-header">

              <div>

                <p>
                  PRODUCT MANAGEMENT
                </p>

                <h2>
                  {editingProduct
                    ? "Edit product"
                    : "Add product"}
                </h2>

              </div>

              <button
                onClick={() =>
                  setShowProductModal(
                    false
                  )
                }
              >
                ×
              </button>

            </div>


            <form
              className="customer-form"
              onSubmit={
                handleProductSubmit
              }
            >

              <div className="customer-form-grid">

                {/* Product name */}

                <div className="customer-form-group">

                  <label>
                    Product name *
                  </label>

                  <input
                    name="name"
                    value={
                      productForm.name
                    }
                    onChange={
                      handleProductFormChange
                    }
                    placeholder="Enter product name"
                    required
                  />

                </div>


                {/* SKU */}

                <div className="customer-form-group">

                  <label>
                    SKU / Code *
                  </label>

                  <input
                    name="sku"
                    value={
                      productForm.sku
                    }
                    onChange={
                      handleProductFormChange
                    }
                    placeholder="e.g. PRD-001"
                    required
                  />

                </div>


                {/* Category */}

                <div className="customer-form-group">

                  <label>
                    Category *
                  </label>

                  <input
                    name="category"
                    value={
                      productForm.category
                    }
                    onChange={
                      handleProductFormChange
                    }
                    placeholder="e.g. Electronics"
                    required
                  />

                </div>


                {/* Unit price */}

                <div className="customer-form-group">

                  <label>
                    Unit price *
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="unit_price"
                    value={
                      productForm.unit_price
                    }
                    onChange={
                      handleProductFormChange
                    }
                    placeholder="0.00"
                    required
                  />

                </div>


                {/* Current stock */}

                <div className="customer-form-group">

                  <label>
                    Current stock
                    {!editingProduct && " *"}
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="current_stock"
                    value={
                      productForm.current_stock
                    }
                    onChange={
                      handleProductFormChange
                    }
                    placeholder="0"
                    disabled={
                      Boolean(editingProduct)
                    }
                    required={
                      !editingProduct
                    }
                  />

                  {editingProduct && (

                    <small className="form-help">
                      Use Stock action to
                      change inventory.
                    </small>

                  )}

                </div>


                {/* Minimum stock */}

                <div className="customer-form-group">

                  <label>
                    Minimum stock alert *
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="minimum_stock_alert_quantity"
                    value={
                      productForm.minimum_stock_alert_quantity
                    }
                    onChange={
                      handleProductFormChange
                    }
                    placeholder="10"
                    required
                  />

                </div>


                {/* Location */}

                <div className="customer-form-group full">

                  <label>
                    Location / Warehouse
                  </label>

                  <input
                    name="location"
                    value={
                      productForm.location
                    }
                    onChange={
                      handleProductFormChange
                    }
                    placeholder="e.g. Warehouse A"
                  />

                </div>

              </div>


              <div className="customer-form-footer">

                <button
                  type="button"
                  className="modal-cancel-button"
                  onClick={() =>
                    setShowProductModal(
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
                    ? "Saving..."
                    : editingProduct
                      ? "Update product"
                      : "Add product"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* 
          STOCK MOVEMENT MODAL
       */}

      {showStockModal &&
        selectedProduct && (

          <div className="customer-modal-overlay">

            <div className="followup-modal">

              <div className="customer-modal-header">

                <div>

                  <p>
                    INVENTORY
                  </p>

                  <h2>
                    Stock movement
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


              <div className="followup-customer-name">

                <div className="customer-avatar">
                  P
                </div>

                <div>

                  <strong>
                    {
                      selectedProduct.name
                    }
                  </strong>

                  <span>
                    Current stock:{" "}
                    {
                      selectedProduct.current_stock ??
                      0
                    }
                  </span>

                </div>

              </div>


              <form
                className="customer-form"
                onSubmit={
                  handleStockSubmit
                }
              >

                {/* Movement type */}

                <div className="customer-form-group full">

                  <label>
                    Movement type *
                  </label>

                  <select
                    name="movement_type"
                    value={
                      stockForm.movement_type
                    }
                    onChange={
                      handleStockFormChange
                    }
                  >

                    <option value="IN">
                      IN — Add stock
                    </option>

                    <option value="OUT">
                      OUT — Remove stock
                    </option>

                  </select>

                </div>


                {/* Quantity */}

                <div className="customer-form-group full">

                  <label>
                    Quantity *
                  </label>

                  <input
                    type="number"
                    min="1"
                    name="quantity"
                    value={
                      stockForm.quantity
                    }
                    onChange={
                      handleStockFormChange
                    }
                    placeholder="Enter quantity"
                    required
                  />

                </div>


                {/* Reason */}

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
                    placeholder="e.g. New stock received"
                    rows="4"
                    required
                  />

                </div>


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

            </div>

          </div>

        )}


      {/* 
          STOCK HISTORY MODAL
       */}

      {showMovementModal &&
        selectedProduct && (

          <div className="customer-modal-overlay">

            <div className="customer-detail-modal">

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
                    setShowMovementModal(
                      false
                    )
                  }
                >
                  ×
                </button>

              </div>


              <div className="customer-detail-body">

                <div className="customer-detail-profile">

                  <div className="customer-detail-avatar">
                    P
                  </div>

                  <div>

                    <h3>
                      {
                        selectedProduct.name
                      }
                    </h3>

                    <span>
                      SKU:{" "}
                      {
                        selectedProduct.sku ||
                        selectedProduct.code ||
                        "-"
                      }
                    </span>

                  </div>

                </div>


                {movementLoading ? (

                  <div className="customer-empty">
                    Loading stock history...
                  </div>

                ) : movements.length === 0 ? (

                  <div className="no-followups">
                    No stock movements found.
                  </div>

                ) : (

                  <div className="stock-movement-list">

                    {movements.map(
                      (
                        movement,
                        index
                      ) => {

                        const type =
                          movement.movement_type ||
                          movement.type;

                        const quantity =
                          movement.quantity ||
                          0;

                        const createdBy =
                          movement.created_by_name ||
                          movement.created_by ||
                          "User";

                        return (

                          <div
                            className="stock-movement-item"
                            key={
                              movement.id ||
                              index
                            }
                          >

                            <div
                              className={
                                type === "IN"
                                  ? "movement-icon in"
                                  : "movement-icon out"
                              }
                            >
                              {type === "IN"
                                ? "+"
                                : "-"}
                            </div>


                            <div className="movement-main">

                              <div className="movement-top">

                                <strong>
                                  {type === "IN"
                                    ? "Stock IN"
                                    : "Stock OUT"}
                                </strong>

                                <span
                                  className={
                                    type === "IN"
                                      ? "movement-quantity in"
                                      : "movement-quantity out"
                                  }
                                >
                                  {type === "IN"
                                    ? "+"
                                    : "-"}
                                  {quantity}
                                </span>

                              </div>


                              <p>
                                {
                                  movement.reason ||
                                  "-"
                                }
                              </p>


                              <div className="movement-meta">

                                <span>
                                  By:{" "}
                                  {createdBy.length > 20
                                    ? createdBy.substring(0, 8) + "..."
                                    : createdBy}
                                </span>

                                <span>
                                  {
                                    formatDate(
                                      movement.created_at
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

              </div>


              <div className="customer-form-footer stock-history-footer">

                <button
                  className="modal-cancel-button"
                  onClick={() =>
                    setShowMovementModal(
                      false
                    )
                  }
                >
                  Close
                </button>

                <button
                  className="modal-submit-button"
                  onClick={() => {

                    setShowMovementModal(
                      false
                    );

                    openStockModal(
                      selectedProduct
                    );

                  }}
                >
                  Add movement
                </button>

              </div>

            </div>

          </div>

        )}

    </div>
  );
};

export default ProductsPage;
