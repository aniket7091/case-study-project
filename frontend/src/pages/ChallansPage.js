import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarNavigation from "../components/SidebarNavigation";

import "../App.css";

const DEFAULT_API_URL =
  "https://case-study-backend-3cb3.onrender.com/api";

const readApiResponse = async (response) => {
  const body = await response.text();

  try {
    return body ? JSON.parse(body) : {};
  } catch {
    throw new Error(
      response.status === 404
        ? "Challan API endpoint was not found."
        : "Challan service returned an unexpected response."
    );
  }
};

const ChallansPage = () => {
  const navigate = useNavigate();

  const API_URL =
    process.env.REACT_APP_API_URL ||
    DEFAULT_API_URL;

  // 
  // CHALLANS
  // 

  const [challans, setChallans] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // 
  // FILTERS
  // 

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("");

  const [page, setPage] = useState(1);

  const limit = 10;

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  // 
  // CREATE CHALLAN MODAL
  // 

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  // 
  // DETAIL MODAL
  // 

  const [showDetailModal, setShowDetailModal] =
    useState(false);

  const [selectedChallan, setSelectedChallan] =
    useState(null);

  const [detailLoading, setDetailLoading] =
    useState(false);

  // 
  // CUSTOMERS
  // 

  const [customers, setCustomers] = useState([]);

  const [customersLoading, setCustomersLoading] =
    useState(false);

  // 
  // PRODUCTS
  // 

  const [products, setProducts] = useState([]);

  const [productsLoading, setProductsLoading] =
    useState(false);

  // 
  // CHALLAN FORM
  // 

  const [challanForm, setChallanForm] = useState({
    customer_id: "",
    status: "DRAFT"
  });

  const [challanItems, setChallanItems] =
    useState([]);

  // 
  // SUBMITTING
  // 

  const [submitting, setSubmitting] =
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
  // FETCH CHALLANS
  // 

  const fetchChallans = async () => {
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

      if (status) {
        params.append(
          "status",
          status
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
        `${API_URL}/challans?${params.toString()}`,
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
            "Unable to fetch challans."
        );
      }

      const challanData =
        data.data?.challans ||
        data.challans ||
        data.data ||
        [];

      setChallans(
        Array.isArray(challanData)
          ? challanData
          : []
      );

      const paginationData =
        data.data?.pagination ||
        data.pagination ||
        {};

      const total =
        paginationData.total ||
        data.total ||
        challanData.length;

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
        "Challan fetch error:",
        err
      );

      setError(
        err.message ||
          "Unable to load challans."
      );

    } finally {

      setLoading(false);

    }
  };

  // 
  // INITIAL LOAD
  // 

  useEffect(() => {

    fetchChallans();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    page,
    status
  ]);

  // 
  // SEARCH
  // 

  const handleSearch = (e) => {

    e.preventDefault();

    setPage(1);

    fetchChallans();
  };

  // 
  // RESET FILTERS
  // 

  const resetFilters = () => {

    setSearch("");

    setStatus("");

    setPage(1);
  };

  // 
  // FETCH CUSTOMERS
  // 

  const fetchCustomers = async () => {

    setCustomersLoading(true);

    try {

      const token = getToken();

      const response = await fetch(
        `${API_URL}/customers?limit=100`,
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
            "Unable to fetch customers."
        );
      }

      const customerData =
        data.data?.customers ||
        data.customers ||
        data.data ||
        [];

      setCustomers(
        Array.isArray(customerData)
          ? customerData
          : []
      );

    } catch (err) {

      console.error(
        "Customer fetch error:",
        err
      );

      setError(
        err.message ||
          "Unable to load customers."
      );

    } finally {

      setCustomersLoading(false);

    }
  };

  // 
  // FETCH PRODUCTS
  // 

  const fetchProducts = async () => {

    setProductsLoading(true);

    try {

      const token = getToken();

      const response = await fetch(
        `${API_URL}/products?limit=100`,
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

      setProductsLoading(false);

    }
  };

  // 
  // OPEN CREATE MODAL
  // 

  const openCreateModal = async () => {

    setError("");

    setChallanForm({
      customer_id: "",
      status: "DRAFT"
    });

    setChallanItems([]);

    setShowCreateModal(true);

    /*
     * Load customers and products
     * when modal opens.
     */

    await Promise.all([
      fetchCustomers(),
      fetchProducts()
    ]);
  };

  // 
  // ADD PRODUCT LINE
  // 

  const addProductLine = () => {

    setChallanItems((prev) => [
      ...prev,
      {
        product_id: "",
        quantity: 1
      }
    ]);
  };

  // 
  // REMOVE PRODUCT LINE
  // 

  const removeProductLine = (index) => {

    setChallanItems((prev) =>
      prev.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );
  };

  // 
  // UPDATE PRODUCT LINE
  // 

  const updateProductLine = (
    index,
    field,
    value
  ) => {

    setChallanItems((prev) =>
      prev.map(
        (item, itemIndex) => {

          if (
            itemIndex !== index
          ) {
            return item;
          }

          return {
            ...item,
            [field]:
              field === "quantity"
                ? Number(value)
                : value
          };
        }
      )
    );
  };

  // 
  // GET PRODUCT BY ID
  // 

  const getProduct = (productId) => {

    return products.find(
      (product) =>
        product.id === productId
    );
  };

  // 
  // TOTAL QUANTITY
  // 

  const totalQuantity =
    challanItems.reduce(
      (total, item) =>
        total +
        Number(item.quantity || 0),
      0
    );

  // 
  // TOTAL AMOUNT
  // 

  const totalAmount =
    challanItems.reduce(
      (total, item) => {

        const product =
          getProduct(
            item.product_id
          );

        const price =
          Number(
            product?.unit_price || 0
          );

        return (
          total +
          price *
            Number(
              item.quantity || 0
            )
        );

      },
      0
    );

  // 
  // CREATE CHALLAN
  // 

  const handleCreateChallan = async (
    e
  ) => {

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

      // Customer validation

      if (
        !challanForm.customer_id
      ) {
        throw new Error(
          "Please select a customer."
        );
      }

      // Product validation

      if (
        challanItems.length === 0
      ) {
        throw new Error(
          "Please add at least one product."
        );
      }

      // Quantity validation

      for (
        const item of challanItems
      ) {

        if (!item.product_id) {
          throw new Error(
            "Please select a product for every row."
          );
        }

        if (
          Number(item.quantity) <= 0
        ) {
          throw new Error(
            "Product quantity must be greater than 0."
          );
        }

      }

      /*
       * Prevent duplicate product rows.
       */

      const productIds =
        challanItems.map(
          (item) =>
            item.product_id
        );

      const hasDuplicate =
        new Set(
          productIds
        ).size !==
        productIds.length;

      if (hasDuplicate) {
        throw new Error(
          "A product cannot be added twice. Change the quantity instead."
        );
      }

      /*
       * Backend expects product snapshot
       * information in challan items.
       *
       * We send product_id, product_name,
       * sku, unit_price and quantity.
       */

      const items =
        challanItems.map(
          (item) => {

            const product =
              getProduct(
                item.product_id
              );

            return {
              product_id:
                item.product_id,

              product_name:
                product?.name || "",

              sku:
                product?.sku ||
                product?.code ||
                "",

              unit_price:
                Number(
                  product?.unit_price ||
                    0
                ),

              quantity:
                Number(
                  item.quantity
                )
            };
          }
        );

      const payload = {
        customer_id:
          challanForm.customer_id,

        status:
          challanForm.status,

        items
      };

      const response = await fetch(
        `${API_URL}/challans`,
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
            "Unable to create challan."
        );

      }

      setShowCreateModal(false);

      setChallanForm({
        customer_id: "",
        status: "DRAFT"
      });

      setChallanItems([]);

      await fetchChallans();

    } catch (err) {

      console.error(
        "Create challan error:",
        err
      );

      setError(
        err.message ||
          "Unable to create challan."
      );

    } finally {

      setSubmitting(false);

    }
  };

  // 
  // VIEW CHALLAN
  // 

  const viewChallan = async (
    challan
  ) => {

    setShowDetailModal(true);

    setDetailLoading(true);

    setSelectedChallan(null);

    setError("");

    try {

      const token = getToken();

      const response = await fetch(
        `${API_URL}/challans/${challan.id}`,
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
            "Unable to fetch challan details."
        );
      }

      const detail =
        data.data ||
        data.challan ||
        data;

      setSelectedChallan(
        detail
      );

    } catch (err) {

      console.error(
        "Challan detail error:",
        err
      );

      setError(
        err.message ||
          "Unable to load challan."
      );

    } finally {

      setDetailLoading(false);

    }
  };

  // 
  // CONFIRM CHALLAN
  // 

  const confirmChallan = async (
    challanId
  ) => {

    const confirmed =
      window.confirm(
        "Confirm this challan? Stock will be deducted from inventory."
      );

    if (!confirmed) {
      return;
    }

    setSubmitting(true);

    setError("");

    try {

      const token = getToken();

      const response = await fetch(
        `${API_URL}/challans/${challanId}/confirm`,
        {
          method: "PATCH",

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
            "Unable to confirm challan."
        );

      }

      /*
       * If detail modal is open,
       * refresh its data.
       */

      if (
        selectedChallan?.id ===
        challanId
      ) {
        await viewChallan({
          id: challanId
        });
      }

      await fetchChallans();

    } catch (err) {

      console.error(
        "Confirm challan error:",
        err
      );

      setError(
        err.message ||
          "Unable to confirm challan."
      );

    } finally {

      setSubmitting(false);

    }
  };

  // 
  // CANCEL CHALLAN
  // 

  const cancelChallan = async (
    challanId
  ) => {

    const confirmed =
      window.confirm(
        "Cancel this challan?"
      );

    if (!confirmed) {
      return;
    }

    setSubmitting(true);

    setError("");

    try {

      const token = getToken();

      const response = await fetch(
        `${API_URL}/challans/${challanId}/cancel`,
        {
          method: "PATCH",

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
            "Unable to cancel challan."
        );

      }

      if (
        selectedChallan?.id ===
        challanId
      ) {
        await viewChallan({
          id: challanId
        });
      }

      await fetchChallans();

    } catch (err) {

      console.error(
        "Cancel challan error:",
        err
      );

      setError(
        err.message ||
          "Unable to cancel challan."
      );

    } finally {

      setSubmitting(false);

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

    return Number(
      value || 0
    ).toLocaleString(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2
      }
    );
  };

  // 
  // STATUS CLASS
  // 

  const getStatusClass = (
    challanStatus
  ) => {

    switch (
      challanStatus?.toUpperCase()
    ) {

      case "CONFIRMED":
        return "challan-status confirmed";

      case "CANCELLED":
        return "challan-status cancelled";

      case "DRAFT":
        return "challan-status draft";

      default:
        return "challan-status";

    }
  };

  // 
  // CUSTOMER NAME
  // 

  const getCustomerName = (
    challan
  ) => {

    return (
      challan.customer_name ||
      challan.customer?.name ||
      customers.find(
        (customer) =>
          customer.id ===
          challan.customer_id
      )?.name ||
      challan.customer_id ||
      "-"
    );
  };

  // 
  // RENDER
  // 

  return (
    <div className="dashboard-page challans-page">

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
              ◉
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
              ◎
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
              ◇
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
              ▣
            </span>

            Inventory
          </button>


          <button
            className="dashboard-nav-item active"
          >
            <span className="nav-item-icon">
              ≡
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
              ◉
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
              ↗
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
          MAIN CONTENT
       */}

      <main className="dashboard-content">

        <header className="dashboard-header">

          <div>

            <p className="dashboard-breadcrumb">
              Sales / Challans
            </p>

            <h1>
              Sales Challans
            </h1>

            <p className="dashboard-subtitle">
              Create, manage and confirm sales
              challans.
            </p>

          </div>


          <div className="dashboard-header-right">

            <button
              className="notification-button"
            >
              ♢
            </button>


            <button
              className="customer-add-button"
              onClick={
                openCreateModal
              }
            >
              + Create challan
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
              placeholder="Search challan..."
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


          <select
            value={status}
            onChange={(e) => {

              setStatus(
                e.target.value
              );

              setPage(1);

            }}
          >

            <option value="">
              All status
            </option>

            <option value="DRAFT">
              Draft
            </option>

            <option value="CONFIRMED">
              Confirmed
            </option>

            <option value="CANCELLED">
              Cancelled
            </option>

          </select>


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
            CHALLAN TABLE
         */}

        <section className="customer-table-card">

          <div className="customer-table-header">

            <div>

              <p>
                SALES MANAGEMENT
              </p>

              <h2>
                Challan list
              </h2>

            </div>

            <span>
              {pagination.total}
              {" "}challans
            </span>

          </div>


          {loading ? (

            <div className="customer-empty">
              Loading challans...
            </div>

          ) : challans.length === 0 ? (

            <div className="customer-empty">

              <div>
                ≡
              </div>

              <h3>
                No challans found
              </h3>

              <p>
                Create your first sales
                challan.
              </p>

              <button
                onClick={
                  openCreateModal
                }
              >
                + Create challan
              </button>

            </div>

          ) : (

            <div className="customer-table-wrapper">

              <table className="customer-table">

                <thead>

                  <tr>

                    <th>
                      CHALLAN
                    </th>

                    <th>
                      CUSTOMER
                    </th>

                    <th>
                      TOTAL QTY
                    </th>

                    <th>
                      STATUS
                    </th>

                    <th>
                      CREATED BY
                    </th>

                    <th>
                      CREATED DATE
                    </th>

                    <th>
                      ACTIONS
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {challans.map(
                    (challan) => (

                      <tr
                        key={
                          challan.id
                        }
                      >

                        <td>

                          <div className="challan-number-cell">

                            <strong>
                              {
                                challan.challan_number ||
                                "-"
                              }
                            </strong>

                            <span>
                              ID:{" "}
                              {
                                challan.id
                              }
                            </span>

                          </div>

                        </td>


                        <td>

                          <div className="customer-name-cell">

                            <div className="customer-avatar">
                              C
                            </div>

                            <div>

                              <strong>
                                {
                                  getCustomerName(
                                    challan
                                  )
                                }
                              </strong>

                              <span>
                                Customer
                              </span>

                            </div>

                          </div>

                        </td>


                        <td>

                          <strong>
                            {
                              challan.total_quantity ??
                              0
                            }
                          </strong>

                        </td>


                        <td>

                          <span
                            className={
                              getStatusClass(
                                challan.status
                              )
                            }
                          >

                            <span></span>

                            {
                              challan.status ||
                              "-"
                            }

                          </span>

                        </td>


                        <td>

                          {
                            challan.created_by_name ||
                            challan.created_by ||
                            "-"
                          }

                        </td>


                        <td>

                          {
                            formatDate(
                              challan.created_at
                            )
                          }

                        </td>


                        <td>

                          <div className="customer-actions">

                            <button
                              onClick={() =>
                                viewChallan(
                                  challan
                                )
                              }
                            >
                              View
                            </button>


                            {challan.status ===
                              "DRAFT" && (

                              <button
                                onClick={() =>
                                  confirmChallan(
                                    challan.id
                                  )
                                }
                              >
                                Confirm
                              </button>

                            )}


                            {challan.status ===
                              "DRAFT" && (

                              <button
                                onClick={() =>
                                  cancelChallan(
                                    challan.id
                                  )
                                }
                              >
                                Cancel
                              </button>

                            )}

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}


          {/* ==
              PAGINATION
          == */}

          {!loading &&
            challans.length > 0 && (

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
          CREATE CHALLAN MODAL
       */}

      {showCreateModal && (

        <div className="customer-modal-overlay">

          <div className="challan-create-modal">

            <div className="customer-modal-header">

              <div>

                <p>
                  SALES MANAGEMENT
                </p>

                <h2>
                  Create sales challan
                </h2>

              </div>

              <button
                onClick={() =>
                  setShowCreateModal(
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
                handleCreateChallan
              }
            >

              {/* 
                  CUSTOMER
               */}

              <div className="customer-form-group full">

                <label>
                  Select customer *
                </label>

                <select
                  value={
                    challanForm.customer_id
                  }
                  onChange={(e) =>
                    setChallanForm(
                      (prev) => ({
                        ...prev,
                        customer_id:
                          e.target.value
                      })
                    )
                  }
                  required
                >

                  <option value="">
                    {customersLoading
                      ? "Loading customers..."
                      : "Select customer"}
                  </option>

                  {customers.map(
                    (customer) => (

                      <option
                        key={
                          customer.id
                        }
                        value={
                          customer.id
                        }
                      >
                        {
                          customer.name
                        }

                        {customer.business_name
                          ? ` — ${customer.business_name}`
                          : ""}
                      </option>

                    )
                  )}

                </select>

              </div>


              {/* 
                  STATUS
               */}

              <div className="customer-form-group full">

                <label>
                  Challan status *
                </label>

                <select
                  value={
                    challanForm.status
                  }
                  onChange={(e) =>
                    setChallanForm(
                      (prev) => ({
                        ...prev,
                        status:
                          e.target.value
                      })
                    )
                  }
                >

                  <option value="DRAFT">
                    Save as Draft
                  </option>

                  <option value="CONFIRMED">
                    Save & Confirm
                  </option>

                </select>

                {challanForm.status ===
                  "CONFIRMED" && (

                  <small className="form-help">

                    Confirming this challan will
                    deduct stock automatically.

                  </small>

                )}

              </div>


              {/* 
                  PRODUCTS
               */}

              <div className="challan-products-section">

                <div className="challan-products-header">

                  <div>

                    <p>
                      LINE ITEMS
                    </p>

                    <h3>
                      Products
                    </h3>

                  </div>


                  <button
                    type="button"
                    onClick={
                      addProductLine
                    }
                  >
                    + Add product
                  </button>

                </div>


                {challanItems.length ===
                  0 ? (

                  <div className="challan-no-items">

                    <span>
                      +
                    </span>

                    <p>
                      Add products to this
                      challan.
                    </p>

                    <button
                      type="button"
                      onClick={
                        addProductLine
                      }
                    >
                      Add first product
                    </button>

                  </div>

                ) : (

                  <div className="challan-items-list">

                    {challanItems.map(
                      (
                        item,
                        index
                      ) => {

                        const product =
                          getProduct(
                            item.product_id
                          );

                        return (

                          <div
                            className="challan-item-row"
                            key={
                              index
                            }
                          >

                            <div className="challan-item-number">
                              {index + 1}
                            </div>


                            {/* Product */}

                            <div className="customer-form-group">

                              <label>
                                Product
                              </label>

                              <select
                                value={
                                  item.product_id
                                }
                                onChange={(e) =>
                                  updateProductLine(
                                    index,
                                    "product_id",
                                    e.target.value
                                  )
                                }
                                required
                              >

                                <option value="">
                                  {productsLoading
                                    ? "Loading..."
                                    : "Select product"}
                                </option>

                                {products.map(
                                  (
                                    productOption
                                  ) => {

                                    const alreadySelected =
                                      challanItems.some(
                                        (
                                          selectedItem,
                                          selectedIndex
                                        ) =>
                                          selectedIndex !==
                                            index &&
                                          selectedItem.product_id ===
                                            productOption.id
                                      );

                                    return (

                                      <option
                                        key={
                                          productOption.id
                                        }
                                        value={
                                          productOption.id
                                        }
                                        disabled={
                                          alreadySelected
                                        }
                                      >

                                        {
                                          productOption.name
                                        }

                                        {" — "}

                                        {
                                          productOption.sku ||
                                          productOption.code ||
                                          "-"
                                        }

                                        {" | Stock: "}

                                        {
                                          productOption.current_stock ??
                                          0
                                        }

                                      </option>

                                    );

                                  }
                                )}

                              </select>

                            </div>


                            {/* Quantity */}

                            <div className="customer-form-group quantity-group">

                              <label>
                                Quantity
                              </label>

                              <input
                                type="number"
                                min="1"
                                value={
                                  item.quantity
                                }
                                onChange={(e) =>
                                  updateProductLine(
                                    index,
                                    "quantity",
                                    e.target.value
                                  )
                                }
                                required
                              />

                            </div>


                            {/* Price */}

                            <div className="challan-item-price">

                              <span>
                                Unit price
                              </span>

                              <strong>
                                {
                                  formatCurrency(
                                    product?.unit_price
                                  )
                                }
                              </strong>

                            </div>


                            {/* Remove */}

                            <button
                              type="button"
                              className="remove-challan-item"
                              onClick={() =>
                                removeProductLine(
                                  index
                                )
                              }
                            >
                              ×
                            </button>

                          </div>

                        );

                      }
                    )}

                  </div>

                )}

              </div>


              {/* 
                  SUMMARY
               */}

              <div className="challan-summary">

                <div>

                  <span>
                    Total products
                  </span>

                  <strong>
                    {
                      challanItems.length
                    }
                  </strong>

                </div>


                <div>

                  <span>
                    Total quantity
                  </span>

                  <strong>
                    {
                      totalQuantity
                    }
                  </strong>

                </div>


                <div>

                  <span>
                    Total amount
                  </span>

                  <strong>
                    {
                      formatCurrency(
                        totalAmount
                      )
                    }
                  </strong>

                </div>

              </div>


              {/* 
                  FOOTER
               */}

              <div className="customer-form-footer">

                <button
                  type="button"
                  className="modal-cancel-button"
                  onClick={() =>
                    setShowCreateModal(
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
                    ? "Creating..."
                    : challanForm.status ===
                      "CONFIRMED"
                    ? "Create & Confirm"
                    : "Save Draft"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* 
          CHALLAN DETAIL MODAL
       */}

      {showDetailModal && (

        <div className="customer-modal-overlay">

          <div className="challan-detail-modal">

            <div className="customer-modal-header">

              <div>

                <p>
                  SALES CHALLAN
                </p>

                <h2>
                  {
                    selectedChallan?.challan_number ||
                    "Challan details"
                  }
                </h2>

              </div>

              <button
                onClick={() =>
                  setShowDetailModal(
                    false
                  )
                }
              >
                ×
              </button>

            </div>


            {detailLoading ? (

              <div className="customer-empty">
                Loading challan details...
              </div>

            ) : selectedChallan ? (

              <div className="challan-detail-body">

                {/* 
                    TOP INFO
                 */}

                <div className="challan-detail-top">

                  <div>

                    <span>
                      CHALLAN NUMBER
                    </span>

                    <strong>
                      {
                        selectedChallan.challan_number ||
                        "-"
                      }
                    </strong>

                  </div>


                  <div>

                    <span>
                      STATUS
                    </span>

                    <span
                      className={
                        getStatusClass(
                          selectedChallan.status
                        )
                      }
                    >

                      <span></span>

                      {
                        selectedChallan.status
                      }

                    </span>

                  </div>


                  <div>

                    <span>
                      CREATED DATE
                    </span>

                    <strong>
                      {
                        formatDate(
                          selectedChallan.created_at
                        )
                      }
                    </strong>

                  </div>

                </div>


                {/* 
                    CUSTOMER
                 */}

                <div className="challan-detail-customer">

                  <p>
                    CUSTOMER
                  </p>

                  <h3>
                    {
                      getCustomerName(
                        selectedChallan
                      )
                    }
                  </h3>

                  {selectedChallan.customer?.business_name && (

                    <span>
                      {
                        selectedChallan.customer.business_name
                      }
                    </span>

                  )}

                </div>


                {/* 
                    ITEMS
                 */}

                <div className="challan-detail-items">

                  <div className="challan-detail-section-title">

                    <div>

                      <p>
                        LINE ITEMS
                      </p>

                      <h3>
                        Products
                      </h3>

                    </div>

                    <strong>
                      {
                        selectedChallan.total_quantity ??
                        0
                      }{" "}
                      units
                    </strong>

                  </div>


                  {(
                    selectedChallan.items ||
                    selectedChallan.sales_challan_items ||
                    []
                  ).map(
                    (
                      item,
                      index
                    ) => (

                      <div
                        className="challan-detail-item"
                        key={
                          item.id ||
                          index
                        }
                      >

                        <div className="customer-avatar">
                          {index + 1}
                        </div>


                        <div className="challan-detail-product">

                          <strong>
                            {
                              item.product_name ||
                              item.product?.name ||
                              "-"
                            }
                          </strong>

                          <span>
                            SKU:{" "}
                            {
                              item.sku ||
                              item.product?.sku ||
                              "-"
                            }
                          </span>

                        </div>


                        <div className="challan-detail-item-price">

                          <span>
                            Unit price
                          </span>

                          <strong>
                            {
                              formatCurrency(
                                item.unit_price
                              )
                            }
                          </strong>

                        </div>


                        <div className="challan-detail-item-quantity">

                          <span>
                            Quantity
                          </span>

                          <strong>
                            {
                              item.quantity ||
                              0
                            }
                          </strong>

                        </div>

                      </div>

                    )
                  )}

                </div>


                {/* 
                    TOTAL
                 */}

                <div className="challan-detail-total">

                  <span>
                    Total quantity
                  </span>

                  <strong>
                    {
                      selectedChallan.total_quantity ??
                      0
                    }
                  </strong>

                </div>


                {/* 
                    ACTIONS
                 */}

                {selectedChallan.status ===
                  "DRAFT" && (

                  <div className="challan-detail-actions">

                    <button
                      className="challan-cancel-action"
                      disabled={
                        submitting
                      }
                      onClick={() =>
                        cancelChallan(
                          selectedChallan.id
                        )
                      }
                    >
                      Cancel challan
                    </button>


                    <button
                      className="challan-confirm-action"
                      disabled={
                        submitting
                      }
                      onClick={() =>
                        confirmChallan(
                          selectedChallan.id
                        )
                      }
                    >
                      {submitting
                        ? "Confirming..."
                        : "Confirm challan"}
                    </button>

                  </div>

                )}

              </div>

            ) : (

              <div className="customer-empty">
                Unable to load challan.
              </div>

            )}

          </div>

        </div>

      )}

    </div>
  );
};

export default ChallansPage;
