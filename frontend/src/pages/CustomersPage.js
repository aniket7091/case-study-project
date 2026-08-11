import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarNavigation from "../components/SidebarNavigation";
import PageHeader from "../components/PageHeader";
import DashboardErrorAlert from "../components/DashboardErrorAlert";
import DataListHeader from "../components/DataListHeader";
import { 
  getStoredUser, 
  getStoredRole, 
  canManageCustomers 
} from "../config/permissions";

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
        ? "Customer API endpoint was not found."
        : "Customer service returned an unexpected response."
    );
  }
};

const CustomersPage = () => {
  const navigate = useNavigate();

  const API_URL =
    process.env.REACT_APP_API_URL ||
    DEFAULT_API_URL;

  // 
  // STATE
  // 

  const userRole = getStoredRole();
  const [customers, setCustomers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("");

  const [customerType, setCustomerType] = useState("");

  const [page, setPage] = useState(1);

  const [limit] = useState(10);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  // Modal states

  const [showCustomerModal, setShowCustomerModal] =
    useState(false);

  const [showDetailModal, setShowDetailModal] =
    useState(false);

  const [showFollowupModal, setShowFollowupModal] =
    useState(false);

  // Selected customer

  const [selectedCustomer, setSelectedCustomer] =
    useState(null);

  // Edit mode

  const [editingCustomer, setEditingCustomer] =
    useState(null);

  // 
  // CUSTOMER FORM
  // 

  const [customerForm, setCustomerForm] = useState({
    name: "",
    mobile_number: "",
    email: "",
    business_name: "",
    gst_number: "",
    customer_type: "RETAIL",
    address: "",
    status: "LEAD",
    follow_up_date: "",
    notes: ""
  });

  // 
  // FOLLOW-UP FORM
  // 

  const [followupNote, setFollowupNote] =
    useState("");

  const [followupDate, setFollowupDate] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  // 
  // GET TOKEN
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
  // LOAD CUSTOMERS
  // 

  const fetchCustomers = async () => {
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

      // Build query parameters

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

      if (customerType) {
        params.append(
          "customer_type",
          customerType
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
        `${API_URL}/customers?${params.toString()}`,
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      const data = await readApiResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to fetch customers."
        );
      }

      /*
       * The backend documentation does not
       * specify one exact response shape.
       *
       * Support common response formats.
       */

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

      const paginationData =
        data.data?.pagination ||
        data.pagination ||
        {};

      setPagination({
        page:
          paginationData.page ||
          data.page ||
          page,

        limit:
          paginationData.limit ||
          data.limit ||
          limit,

        total:
          paginationData.total ||
          data.total ||
          customerData.length,

        totalPages:
          paginationData.totalPages ||
          data.totalPages ||
          Math.max(
            1,
            Math.ceil(
              (
                paginationData.total ||
                data.total ||
                customerData.length
              ) / limit
            )
          )
      });

    } catch (err) {

      console.error(
        "Customer fetch error:",
        err
      );

      setError(
        err.message ||
          "Something went wrong while loading customers."
      );

    } finally {

      setLoading(false);

    }
  };

  // 
  // LOAD CUSTOMER WHEN FILTER CHANGES
  // 

  useEffect(() => {
    fetchCustomers();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    page,
    status,
    customerType
  ]);

  // 
  // SEARCH
  // 

  const handleSearch = (e) => {
    e.preventDefault();

    setPage(1);

    fetchCustomers();
  };

  // 
  // RESET FILTERS
  // 

  const resetFilters = () => {
    setSearch("");
    setStatus("");
    setCustomerType("");
    setPage(1);
  };

  // 
  // FORM CHANGE
  // 

  const handleFormChange = (e) => {
    const {
      name,
      value
    } = e.target;

    setCustomerForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // 
  // OPEN ADD MODAL
  // 

  const openAddCustomer = () => {

    setEditingCustomer(null);

    setCustomerForm({
      name: "",
      mobile_number: "",
      email: "",
      business_name: "",
      gst_number: "",
      customer_type: "RETAIL",
      address: "",
      status: "LEAD",
      follow_up_date: "",
      notes: ""
    });

    setShowCustomerModal(true);
  };

  // 
  // OPEN EDIT MODAL
  // 

  const openEditCustomer = (customer) => {

    setEditingCustomer(customer);

    setCustomerForm({
      name:
        customer.name || "",

      mobile_number:
        customer.mobile_number ||
        customer.mobile ||
        "",

      email:
        customer.email || "",

      business_name:
        customer.business_name ||
        "",

      gst_number:
        customer.gst_number ||
        "",

      customer_type:
        customer.customer_type?.toUpperCase() ||
        "RETAIL",

      address:
        customer.address ||
        "",

      status:
        customer.status?.toUpperCase() ||
        "LEAD",

      follow_up_date:
        customer.follow_up_date ||
        "",

      notes:
        customer.notes ||
        ""
    });

    setShowCustomerModal(true);
  };

  // 
  // CREATE / UPDATE CUSTOMER
  // 

  const handleCustomerSubmit = async (e) => {

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
        Boolean(editingCustomer);

      const url = isEditing
        ? `${API_URL}/customers/${editingCustomer.id}`
        : `${API_URL}/customers`;

      const method =
        isEditing
          ? "PUT"
          : "POST";

      /*
       * Do not send empty GST number
       * if it is optional.
       */

      const payload = {
        name: customerForm.name,
        mobile:
          customerForm.mobile_number,
        email: customerForm.email,
        business_name:
          customerForm.business_name,
        customer_type:
          customerForm.customer_type,
        address:
          customerForm.address,
        status:
          customerForm.status,
        follow_up_date:
          customerForm.follow_up_date,
        notes:
          customerForm.notes
      };

      if (
        customerForm.gst_number.trim()
      ) {
        payload.gst_number =
          customerForm.gst_number;
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
            `Unable to ${
              isEditing
                ? "update"
                : "create"
            } customer.`
        );
      }

      setShowCustomerModal(false);

      setEditingCustomer(null);

      await fetchCustomers();

    } catch (err) {

      console.error(err);

      setError(
        err.message ||
          "Unable to save customer."
      );

    } finally {

      setSubmitting(false);

    }
  };

  // 
  // VIEW CUSTOMER DETAIL
  // 

  const openCustomerDetail = async (
    customer
  ) => {

    try {

      const token = getToken();

      if (!token) {
        navigate("/login", {
          replace: true
        });

        return;
      }

      setSelectedCustomer(customer);

      setShowDetailModal(true);

      /*
       * Fetch complete customer details.
       */

      const response = await fetch(
        `${API_URL}/customers/${customer.id}`,
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
            "Unable to fetch customer details."
        );
      }

      const detail =
        data.data ||
        data.customer ||
        data;

      setSelectedCustomer(
        detail
      );

    } catch (err) {

      console.error(err);

      setError(
        err.message ||
          "Unable to load customer details."
      );
    }
  };

  // 
  // OPEN FOLLOW-UP MODAL
  // 

  const openFollowup = (
    customer
  ) => {

    setSelectedCustomer(
      customer
    );

    setFollowupNote("");

    setFollowupDate("");

    setShowFollowupModal(true);
  };

  // 
  // ADD FOLLOW-UP
  // 

  const handleFollowupSubmit = async (
    e
  ) => {

    e.preventDefault();

    if (!followupNote.trim()) {
      setError(
        "Please enter a follow-up note."
      );

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

      const payload = {
        note:
          followupNote.trim()
      };

      if (followupDate) {
        payload.follow_up_date =
          followupDate;
      }

      const response = await fetch(
        `${API_URL}/customers/${selectedCustomer.id}/followups`,
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
            "Unable to add follow-up."
        );
      }

      setShowFollowupModal(
        false
      );

      setFollowupNote("");

      setFollowupDate("");

      /*
       * Reload customer detail if
       * detail modal is currently open.
       */

      if (selectedCustomer?.id) {
        openCustomerDetail(
          selectedCustomer
        );
      }

    } catch (err) {

      console.error(err);

      setError(
        err.message ||
          "Unable to add follow-up."
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
  // STATUS CLASS
  // 

  const getStatusClass = (
    customerStatus
  ) => {

    switch (
      customerStatus?.toUpperCase()
    ) {

      case "ACTIVE":
        return "customer-status active";

      case "INACTIVE":
        return "customer-status inactive";

      case "LEAD":
        return "customer-status lead";

      default:
        return "customer-status";
    }
  };

  // 
  // RENDER
  // 

  return (
    <div className="dashboard-page customers-page">

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
              <MdDashboard />
            </span>

            Dashboard
          </button>


          <button
            className="dashboard-nav-item active"
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

        {/* Header */}

        <PageHeader
          breadcrumb="CRM / Customers"
          title="Customers"
          subtitle="Manage your customer relationships and follow-ups."
          actions={
            <>
              <button className="notification-button">♢</button>
              {canManageCustomers(userRole) && (
                <button
                  className="customer-add-button"
                  onClick={openAddCustomer}
                >
                  + Add customer
                </button>
              )}
            </>
          }
        />


        {/* Error */}

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
              placeholder="Search customers..."
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

            <option value="LEAD">
              Lead
            </option>

            <option value="ACTIVE">
              Active
            </option>

            <option value="INACTIVE">
              Inactive
            </option>

          </select>


          <select
            value={customerType}
            onChange={(e) => {

              setCustomerType(
                e.target.value
              );

              setPage(1);

            }}
          >

            <option value="">
              All types
            </option>

            <option value="RETAIL">
              Retail
            </option>

            <option value="WHOLESALE">
              Wholesale
            </option>

            <option value="DISTRIBUTOR">
              Distributor
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
            CUSTOMER TABLE
         */}

        <section className="customer-table-card">

          <DataListHeader
            eyebrow="CUSTOMER CRM"
            title="Customer list"
            countLabel={`${pagination.total} customers`}
          />


          {loading ? (

            <div className="customer-empty">
              Loading customers...
            </div>

          ) : customers.length === 0 ? (

            <div className="customer-empty">

              <div>
                ◎
              </div>

              <h3>
                No customers found
              </h3>

              <p>
                Try changing your search
                or add a new customer.
              </p>

              <button
                onClick={
                  openAddCustomer
                }
              >
                + Add customer
              </button>

            </div>

          ) : (

            <div className="customer-table-wrapper">

              <table className="customer-table">

                <thead>

                  <tr>

                    <th>
                      CUSTOMER
                    </th>

                    <th>
                      BUSINESS
                    </th>

                    <th>
                      TYPE
                    </th>

                    <th>
                      MOBILE
                    </th>

                    <th>
                      STATUS
                    </th>

                    <th>
                      FOLLOW-UP
                    </th>

                    <th>
                      ACTIONS
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {customers.map(
                    (customer) => (

                      <tr
                        key={
                          customer.id
                        }
                      >

                        {/* Customer */}

                        <td>

                          <div className="customer-name-cell">

                            <div className="customer-avatar">

                              {(
                                customer.name ||
                                "C"
                              )
                                .charAt(0)
                                .toUpperCase()}

                            </div>

                            <div>

                              <strong>
                                {
                                  customer.name ||
                                  "-"
                                }
                              </strong>

                              <span>
                                {
                                  customer.email ||
                                  "No email"
                                }
                              </span>

                            </div>

                          </div>

                        </td>


                        {/* Business */}

                        <td>
                          {
                            customer.business_name ||
                            "-"
                          }
                        </td>


                        {/* Type */}

                        <td>

                          <span className="customer-type">

                            {
                              customer.customer_type ||
                              "-"
                            }

                          </span>

                        </td>


                        {/* Mobile */}

                        <td>
                          {
                            customer.mobile_number ||
                            customer.mobile ||
                            "-"
                          }
                        </td>


                        {/* Status */}

                        <td>

                          <span
                            className={
                              getStatusClass(
                                customer.status
                              )
                            }
                          >

                            <span></span>

                            {
                              customer.status ||
                              "-"
                            }

                          </span>

                        </td>


                        {/* Follow-up */}

                        <td>

                          {
                            formatDate(
                              customer.follow_up_date
                            )
                          }

                        </td>


                        {/* Actions */}

                        <td>

                          <div className="customer-actions">

                            <button
                              title="View customer"
                              onClick={() =>
                                openCustomerDetail(
                                  customer
                                )
                              }
                            >
                              View
                            </button>

                            {canManageCustomers(userRole) && (
                              <>
                                <button
                                  onClick={() =>
                                    openEditCustomer(
                                      customer
                                    )
                                  }
                                >
                                  Edit
                                </button>
                              </>
                            )}

                            {canManageCustomers(userRole) && (
                              <button
                                title="Add follow-up"
                                onClick={() =>
                                  openFollowup(
                                    customer
                                  )
                                }
                              >
                                Follow-up
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


          {/* ===================================
              PAGINATION
          =================================== */}

          {!loading &&
            customers.length > 0 && (

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
          ADD / EDIT CUSTOMER MODAL
       */}

      {showCustomerModal && (

        <div className="customer-modal-overlay">

          <div className="customer-modal">

            <div className="customer-modal-header">

              <div>

                <p>
                  CUSTOMER CRM
                </p>

                <h2>
                  {editingCustomer
                    ? "Edit customer"
                    : "Add customer"}
                </h2>

              </div>

              <button
                onClick={() =>
                  setShowCustomerModal(
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
                handleCustomerSubmit
              }
            >

              <div className="customer-form-grid">

                {/* Name */}

                <div className="customer-form-group">

                  <label>
                    Customer name *
                  </label>

                  <input
                    name="name"
                    value={
                      customerForm.name
                    }
                    onChange={
                      handleFormChange
                    }
                    placeholder="Enter customer name"
                    required
                  />

                </div>


                {/* Mobile */}

                <div className="customer-form-group">

                  <label>
                    Mobile number *
                  </label>

                  <input
                    name="mobile_number"
                    value={
                      customerForm.mobile_number
                    }
                    onChange={
                      handleFormChange
                    }
                    placeholder="Enter mobile number"
                    required
                  />

                </div>


                {/* Email */}

                <div className="customer-form-group">

                  <label>
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={
                      customerForm.email
                    }
                    onChange={
                      handleFormChange
                    }
                    placeholder="customer@example.com"
                  />

                </div>


                {/* Business */}

                <div className="customer-form-group">

                  <label>
                    Business name
                  </label>

                  <input
                    name="business_name"
                    value={
                      customerForm.business_name
                    }
                    onChange={
                      handleFormChange
                    }
                    placeholder="Enter business name"
                  />

                </div>


                {/* GST */}

                <div className="customer-form-group">

                  <label>
                    GST number
                  </label>

                  <input
                    name="gst_number"
                    value={
                      customerForm.gst_number
                    }
                    onChange={
                      handleFormChange
                    }
                    placeholder="Optional"
                  />

                </div>


                {/* Customer Type */}

                <div className="customer-form-group">

                  <label>
                    Customer type *
                  </label>

                  <select
                    name="customer_type"
                    value={
                      customerForm.customer_type
                    }
                    onChange={
                      handleFormChange
                    }
                    required
                  >

                    <option value="RETAIL">
                      Retail
                    </option>

                    <option value="WHOLESALE">
                      Wholesale
                    </option>

                    <option value="DISTRIBUTOR">
                      Distributor
                    </option>

                  </select>

                </div>


                {/* Status */}

                <div className="customer-form-group">

                  <label>
                    Status *
                  </label>

                  <select
                    name="status"
                    value={
                      customerForm.status
                    }
                    onChange={
                      handleFormChange
                    }
                    required
                  >

                    <option value="LEAD">
                      Lead
                    </option>

                    <option value="ACTIVE">
                      Active
                    </option>

                    <option value="INACTIVE">
                      Inactive
                    </option>

                  </select>

                </div>


                {/* Follow-up date */}

                <div className="customer-form-group">

                  <label>
                    Follow-up date
                  </label>

                  <input
                    type="date"
                    name="follow_up_date"
                    value={
                      customerForm.follow_up_date
                    }
                    onChange={
                      handleFormChange
                    }
                  />

                </div>


                {/* Address */}

                <div className="customer-form-group full">

                  <label>
                    Address
                  </label>

                  <textarea
                    name="address"
                    value={
                      customerForm.address
                    }
                    onChange={
                      handleFormChange
                    }
                    placeholder="Enter customer address"
                    rows="3"
                  />

                </div>


                {/* Notes */}

                <div className="customer-form-group full">

                  <label>
                    Notes
                  </label>

                  <textarea
                    name="notes"
                    value={
                      customerForm.notes
                    }
                    onChange={
                      handleFormChange
                    }
                    placeholder="Add notes about this customer"
                    rows="3"
                  />

                </div>

              </div>


              <div className="customer-form-footer">

                <button
                  type="button"
                  className="modal-cancel-button"
                  onClick={() =>
                    setShowCustomerModal(
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
                    : editingCustomer
                    ? "Update customer"
                    : "Add customer"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* 
          CUSTOMER DETAIL MODAL
       */}

      {showDetailModal &&
        selectedCustomer && (

          <div className="customer-modal-overlay">

            <div className="customer-detail-modal">

              <div className="customer-modal-header">

                <div>

                  <p>
                    CUSTOMER DETAIL
                  </p>

                  <h2>
                    {
                      selectedCustomer.name ||
                      "Customer"
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


              <div className="customer-detail-body">

                <div className="customer-detail-profile">

                  <div className="customer-detail-avatar">

                    {(
                      selectedCustomer.name ||
                      "C"
                    )
                      .charAt(0)
                      .toUpperCase()}

                  </div>

                  <div>

                    <h3>
                      {
                        selectedCustomer.name ||
                        "-"
                      }
                    </h3>

                    <span
                      className={
                        getStatusClass(
                          selectedCustomer.status
                        )
                      }
                    >
                      <span></span>
                      {
                        selectedCustomer.status ||
                        "-"
                      }
                    </span>

                  </div>

                </div>


                <div className="customer-detail-grid">

                  <div>

                    <label>
                      Mobile
                    </label>

                    <strong>
                      {
                        selectedCustomer.mobile_number ||
                        selectedCustomer.mobile ||
                        "-"
                      }
                    </strong>

                  </div>


                  <div>

                    <label>
                      Email
                    </label>

                    <strong>
                      {
                        selectedCustomer.email ||
                        "-"
                      }
                    </strong>

                  </div>


                  <div>

                    <label>
                      Business
                    </label>

                    <strong>
                      {
                        selectedCustomer.business_name ||
                        "-"
                      }
                    </strong>

                  </div>


                  <div>

                    <label>
                      Customer type
                    </label>

                    <strong>
                      {
                        selectedCustomer.customer_type ||
                        "-"
                      }
                    </strong>

                  </div>


                  <div>

                    <label>
                      GST number
                    </label>

                    <strong>
                      {
                        selectedCustomer.gst_number ||
                        "-"
                      }
                    </strong>

                  </div>


                  <div>

                    <label>
                      Follow-up
                    </label>

                    <strong>
                      {
                        formatDate(
                          selectedCustomer.follow_up_date
                        )
                      }
                    </strong>

                  </div>


                  <div className="full">

                    <label>
                      Address
                    </label>

                    <strong>
                      {
                        selectedCustomer.address ||
                        "-"
                      }
                    </strong>

                  </div>


                  <div className="full">

                    <label>
                      Notes
                    </label>

                    <strong>
                      {
                        selectedCustomer.notes ||
                        "-"
                      }
                    </strong>

                  </div>

                </div>


                {/* Follow-up timeline */}

                <div className="followup-section">

                  <div className="followup-section-header">

                    <div>

                      <p>
                        CRM ACTIVITY
                      </p>

                      <h3>
                        Follow-ups
                      </h3>

                    </div>

                    <button
                      onClick={() =>
                        openFollowup(
                          selectedCustomer
                        )
                      }
                    >
                      + Add note
                    </button>

                  </div>


                  {(
                    selectedCustomer.followups ||
                    selectedCustomer.follow_ups ||
                    []
                  ).length === 0 ? (

                    <div className="no-followups">
                      No follow-up notes yet.
                    </div>

                  ) : (

                    <div className="followup-list">

                      {(
                        selectedCustomer.followups ||
                        selectedCustomer.follow_ups ||
                        []
                      ).map(
                        (
                          followup,
                          index
                        ) => (

                          <div
                            className="followup-item"
                            key={
                              followup.id ||
                              index
                            }
                          >

                            <div className="followup-dot">
                            </div>

                            <div>

                              <p>
                                {
                                  followup.note ||
                                  followup.notes ||
                                  "-"
                                }
                              </p>

                              <span>
                                {
                                  formatDate(
                                    followup.created_at
                                  )
                                }
                              </span>

                            </div>

                          </div>

                        )
                      )}

                    </div>

                  )}

                </div>

              </div>


              <div className="customer-form-footer customer-detail-footer">

                <button
                  className="modal-cancel-button"
                  onClick={() =>
                    setShowDetailModal(
                      false
                    )
                  }
                >
                  Close
                </button>

                <button
                  className="modal-submit-button"
                  onClick={() => {

                    setShowDetailModal(
                      false
                    );

                    openEditCustomer(
                      selectedCustomer
                    );

                  }}
                >
                  Edit customer
                </button>

              </div>

            </div>

          </div>

        )}


      {/* 
          FOLLOW-UP MODAL
       */}

      {showFollowupModal &&
        selectedCustomer && (

          <div className="customer-modal-overlay">

            <div className="followup-modal">

              <div className="customer-modal-header">

                <div>

                  <p>
                    CRM ACTIVITY
                  </p>

                  <h2>
                    Add follow-up
                  </h2>

                </div>

                <button
                  onClick={() =>
                    setShowFollowupModal(
                      false
                    )
                  }
                >
                  ×
                </button>

              </div>


              <div className="followup-customer-name">

                <div className="customer-avatar">
                  {(
                    selectedCustomer.name ||
                    "C"
                  )
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>

                  <strong>
                    {
                      selectedCustomer.name ||
                      "-"
                    }
                  </strong>

                  <span>
                    {
                      selectedCustomer.business_name ||
                      "Customer"
                    }
                  </span>

                </div>

              </div>


              <form
                className="customer-form"
                onSubmit={
                  handleFollowupSubmit
                }
              >

                <div className="customer-form-group full">

                  <label>
                    Follow-up note *
                  </label>

                  <textarea
                    value={
                      followupNote
                    }
                    onChange={(e) =>
                      setFollowupNote(
                        e.target.value
                      )
                    }
                    placeholder="Write your follow-up note..."
                    rows="5"
                    required
                  />

                </div>


                <div className="customer-form-group full">

                  <label>
                    Next follow-up date
                  </label>

                  <input
                    type="date"
                    value={
                      followupDate
                    }
                    onChange={(e) =>
                      setFollowupDate(
                        e.target.value
                      )
                    }
                  />

                </div>


                <div className="customer-form-footer">

                  <button
                    type="button"
                    className="modal-cancel-button"
                    onClick={() =>
                      setShowFollowupModal(
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
                      : "Add follow-up"}
                  </button>

                </div>

              </form>

            </div>

          </div>

        )}

    </div>
  );
};

export default CustomersPage;
