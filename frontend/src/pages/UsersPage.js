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
        ? "User API endpoint was not found."
        : "User service returned an unexpected response."
    );
  }
};

const UsersPage = () => {
  const navigate = useNavigate();

  const API_URL =
    process.env.REACT_APP_API_URL ||
    DEFAULT_API_URL;

  // 
  // USERS
  // 

  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // 
  // SEARCH / PAGINATION
  // 

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const limit = 10;

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  // 
  // CREATE USER MODAL
  // 

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  // 
  // DETAIL MODAL
  // 

  const [showDetailModal, setShowDetailModal] =
    useState(false);

  const [selectedUser, setSelectedUser] =
    useState(null);

  const [detailLoading, setDetailLoading] =
    useState(false);

  // 
  // CREATE USER FORM
  // 

  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "SALES"
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
  // GET CURRENT USER
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
  // FETCH USERS
  // 

  const fetchUsers = async () => {
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

      params.append(
        "page",
        page
      );

      params.append(
        "limit",
        limit
      );

      const response = await fetch(
        `${API_URL}/users?${params.toString()}`,
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
            "Unable to fetch users."
        );
      }

      const userData =
        data.data?.users ||
        data.users ||
        data.data ||
        [];

      setUsers(
        Array.isArray(userData)
          ? userData
          : []
      );

      const paginationData =
        data.data?.pagination ||
        data.pagination ||
        {};

      const total =
        paginationData.total ||
        data.total ||
        userData.length;

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
        "Users fetch error:",
        err
      );

      setError(
        err.message ||
          "Unable to load users."
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

    fetchUsers();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // 
  // SEARCH
  // 

  const handleSearch = (e) => {
    e.preventDefault();

    setPage(1);

    fetchUsers();
  };

  // 
  // RESET
  // 

  const resetSearch = () => {
    setSearch("");

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

    setUserForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // 
  // OPEN CREATE MODAL
  // 

  const openCreateModal = () => {
    setUserForm({
      name: "",
      email: "",
      password: "",
      role: "SALES"
    });

    setError("");

    setShowCreateModal(true);
  };

  // 
  // CREATE USER
  // 

  const handleCreateUser = async (e) => {
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
        userForm.password.length < 6
      ) {
        throw new Error(
          "Password must contain at least 6 characters."
        );
      }

      const payload = {
        name: userForm.name.trim(),

        email:
          userForm.email
            .trim()
            .toLowerCase(),

        password:
          userForm.password,

        role:
          userForm.role
      };

      const response = await fetch(
        `${API_URL}/users`,
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
            "Unable to create user."
        );
      }

      setShowCreateModal(false);

      setUserForm({
        name: "",
        email: "",
        password: "",
        role: "SALES"
      });

      await fetchUsers();

    } catch (err) {
      console.error(
        "Create user error:",
        err
      );

      setError(
        err.message ||
          "Unable to create user."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // 
  // VIEW USER
  // 

  const viewUser = async (user) => {
    setShowDetailModal(true);

    setDetailLoading(true);

    setSelectedUser(null);

    setError("");

    try {
      const token = getToken();

      const response = await fetch(
        `${API_URL}/users/${user.id}`,
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
            "Unable to fetch user details."
        );
      }

      const userData =
        data.data ||
        data.user ||
        data;

      setSelectedUser(
        userData
      );

    } catch (err) {
      console.error(
        "User detail error:",
        err
      );

      setError(
        err.message ||
          "Unable to load user details."
      );
    } finally {
      setDetailLoading(false);
    }
  };

  // 
  // UPDATE ROLE
  // 

  const updateRole = async (
    userId,
    newRole
  ) => {
    const confirmed =
      window.confirm(
        `Change this user's role to ${newRole}?`
      );

    if (!confirmed) {
      return;
    }

    setSubmitting(true);

    setError("");

    try {
      const token = getToken();

      const response = await fetch(
        `${API_URL}/users/${userId}/role`,
        {
          method: "PATCH",

          headers: {
            Authorization:
              `Bearer ${token}`,

            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            role: newRole
          })
        }
      );

      const data =
        await readApiResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Unable to update role."
        );
      }

      await fetchUsers();

      if (
        selectedUser?.id ===
        userId
      ) {
        await viewUser({
          id: userId
        });
      }

    } catch (err) {
      console.error(
        "Role update error:",
        err
      );

      setError(
        err.message ||
          "Unable to update role."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // 
  // UPDATE STATUS
  // 

  const updateStatus = async (
    user
  ) => {
    const currentStatus =
      String(
        user.status ||
          "ACTIVE"
      ).toUpperCase();

    const newStatus =
      currentStatus ===
      "ACTIVE"
        ? "INACTIVE"
        : "ACTIVE";

    const confirmed =
      window.confirm(
        `${newStatus === "ACTIVE"
          ? "Activate"
          : "Deactivate"
        } ${user.name}?`
      );

    if (!confirmed) {
      return;
    }

    setSubmitting(true);

    setError("");

    try {
      const token = getToken();

      const response = await fetch(
        `${API_URL}/users/${user.id}/status`,
        {
          method: "PATCH",

          headers: {
            Authorization:
              `Bearer ${token}`,

            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            status: newStatus
          })
        }
      );

      const data =
        await readApiResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Unable to update user status."
        );
      }

      await fetchUsers();

      if (
        selectedUser?.id ===
        user.id
      ) {
        await viewUser({
          id: user.id
        });
      }

    } catch (err) {
      console.error(
        "Status update error:",
        err
      );

      setError(
        err.message ||
          "Unable to update status."
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
  // ROLE CLASS
  // 

  const getRoleClass = (role) => {
    switch (
      String(
        role || ""
      ).toUpperCase()
    ) {
      case "ADMIN":
        return "user-role admin";

      case "SALES":
        return "user-role sales";

      case "WAREHOUSE":
        return "user-role warehouse";

      case "ACCOUNTS":
        return "user-role accounts";

      default:
        return "user-role";
    }
  };

  // 
  // STATUS CLASS
  // 

  const getUserStatusClass = (
    status
  ) => {
    const normalized =
      String(
        status || "ACTIVE"
      ).toUpperCase();

    if (
      normalized ===
      "ACTIVE"
    ) {
      return "user-status active";
    }

    return "user-status inactive";
  };

  // 
  // RENDER
  // 

  return (
    <div className="dashboard-page users-page">

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
            className="dashboard-nav-item"
            onClick={() =>
              navigate("/challans")
            }
          >
            <span className="nav-item-icon">
              ≡
            </span>

            Challans
          </button>


          <p className="nav-section-title second">
            ADMIN
          </p>


          <button className="dashboard-nav-item active">
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
                {currentUser?.name ||
                  "Admin"}
              </strong>

              <span>
                {currentUser?.role ||
                  "ADMIN"}
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
              Admin / Users
            </p>

            <h1>
              User Management
            </h1>

            <p className="dashboard-subtitle">
              Manage users, roles and account
              status.
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
              + Create user
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
            SEARCH
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
              placeholder="Search users..."
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
            className="reset-filter-button"
            onClick={
              resetSearch
            }
          >
            Reset
          </button>

        </section>


        {/* 
            USER TABLE
         */}

        <section className="customer-table-card">

          <div className="customer-table-header">

            <div>

              <p>
                ACCESS CONTROL
              </p>

              <h2>
                Users
              </h2>

            </div>

            <span>
              {pagination.total}
              {" "}users
            </span>

          </div>


          {loading ? (

            <div className="customer-empty">
              Loading users...
            </div>

          ) : users.length === 0 ? (

            <div className="customer-empty">

              <div>
                ◉
              </div>

              <h3>
                No users found
              </h3>

              <p>
                Create a user to get started.
              </p>

              <button
                onClick={
                  openCreateModal
                }
              >
                + Create user
              </button>

            </div>

          ) : (

            <div className="customer-table-wrapper">

              <table className="customer-table">

                <thead>

                  <tr>

                    <th>
                      USER
                    </th>

                    <th>
                      EMAIL
                    </th>

                    <th>
                      ROLE
                    </th>

                    <th>
                      STATUS
                    </th>

                    <th>
                      CREATED
                    </th>

                    <th>
                      ACTIONS
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {users.map(
                    (user) => {

                      const normalizedRole =
                        String(
                          user.role ||
                            ""
                        ).toUpperCase();

                      const normalizedStatus =
                        String(
                          user.status ||
                            "ACTIVE"
                        ).toUpperCase();

                      const isCurrentUser =
                        currentUser?.id ===
                        user.id;

                      return (

                        <tr
                          key={
                            user.id
                          }
                        >

                          {/* USER */}

                          <td>

                            <div className="customer-name-cell">

                              <div className="customer-avatar">
                                {(
                                  user.name ||
                                  "U"
                                )
                                  .charAt(
                                    0
                                  )
                                  .toUpperCase()}
                              </div>

                              <div>

                                <strong>
                                  {
                                    user.name ||
                                    "-"
                                  }

                                  {isCurrentUser && (

                                    <span className="current-user-label">
                                      You
                                    </span>

                                  )}

                                </strong>

                                <span>
                                  ID:{" "}
                                  {
                                    user.id
                                  }
                                </span>

                              </div>

                            </div>

                          </td>


                          {/* EMAIL */}

                          <td>
                            {
                              user.email ||
                              "-"
                            }
                          </td>


                          {/* ROLE */}

                          <td>

                            <span
                              className={
                                getRoleClass(
                                  normalizedRole
                                )
                              }
                            >
                              {
                                normalizedRole ||
                                "-"
                              }
                            </span>

                          </td>


                          {/* STATUS */}

                          <td>

                            <span
                              className={
                                getUserStatusClass(
                                  normalizedStatus
                                )
                              }
                            >

                              <span></span>

                              {
                                normalizedStatus
                              }

                            </span>

                          </td>


                          {/* CREATED */}

                          <td>
                            {
                              formatDate(
                                user.created_at
                              )
                            }
                          </td>


                          {/* ACTIONS */}

                          <td>

                            <div className="customer-actions">

                              <button
                                onClick={() =>
                                  viewUser(
                                    user
                                  )
                                }
                              >
                                View
                              </button>


                              <button
                                disabled={
                                  isCurrentUser
                                }
                                onClick={() =>
                                  updateStatus(
                                    user
                                  )
                                }
                              >
                                {normalizedStatus ===
                                "ACTIVE"
                                  ? "Deactivate"
                                  : "Activate"}
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
            users.length > 0 && (

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
          CREATE USER MODAL
       */}

      {showCreateModal && (

        <div className="customer-modal-overlay">

          <div className="customer-modal">

            <div className="customer-modal-header">

              <div>

                <p>
                  USER MANAGEMENT
                </p>

                <h2>
                  Create user
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
                handleCreateUser
              }
            >

              {/* NAME */}

              <div className="customer-form-group full">

                <label>
                  Full name *
                </label>

                <input
                  type="text"
                  name="name"
                  value={
                    userForm.name
                  }
                  onChange={
                    handleFormChange
                  }
                  placeholder="Enter full name"
                  required
                />

              </div>


              {/* EMAIL */}

              <div className="customer-form-group full">

                <label>
                  Email *
                </label>

                <input
                  type="email"
                  name="email"
                  value={
                    userForm.email
                  }
                  onChange={
                    handleFormChange
                  }
                  placeholder="user@example.com"
                  required
                />

              </div>


              {/* PASSWORD */}

              <div className="customer-form-group full">

                <label>
                  Temporary password *
                </label>

                <input
                  type="password"
                  name="password"
                  value={
                    userForm.password
                  }
                  onChange={
                    handleFormChange
                  }
                  placeholder="Minimum 6 characters"
                  minLength="6"
                  required
                />

              </div>


              {/* ROLE */}

              <div className="customer-form-group full">

                <label>
                  Role *
                </label>

                <select
                  name="role"
                  value={
                    userForm.role
                  }
                  onChange={
                    handleFormChange
                  }
                >

                  <option value="ADMIN">
                    ADMIN
                  </option>

                  <option value="SALES">
                    SALES
                  </option>

                  <option value="WAREHOUSE">
                    WAREHOUSE
                  </option>

                  <option value="ACCOUNTS">
                    ACCOUNTS
                  </option>

                </select>

              </div>


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
                    : "Create user"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* 
          USER DETAIL MODAL
       */}

      {showDetailModal && (

        <div className="customer-modal-overlay">

          <div className="customer-detail-modal">

            <div className="customer-modal-header">

              <div>

                <p>
                  USER MANAGEMENT
                </p>

                <h2>
                  User details
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
                Loading user details...
              </div>

            ) : selectedUser ? (

              <div className="customer-detail-body">

                {/* PROFILE */}

                <div className="customer-detail-profile">

                  <div className="customer-detail-avatar">

                    {(
                      selectedUser.name ||
                      "U"
                    )
                      .charAt(0)
                      .toUpperCase()}

                  </div>

                  <div>

                    <h3>
                      {
                        selectedUser.name
                      }
                    </h3>

                    <span>
                      {
                        selectedUser.email
                      }
                    </span>

                  </div>

                </div>


                {/* INFO */}

                <div className="user-detail-grid">

                  <div>

                    <span>
                      ROLE
                    </span>

                    <strong
                      className={
                        getRoleClass(
                          selectedUser.role
                        )
                      }
                    >
                      {
                        String(
                          selectedUser.role ||
                            "-"
                        ).toUpperCase()
                      }
                    </strong>

                  </div>


                  <div>

                    <span>
                      STATUS
                    </span>

                    <strong
                      className={
                        getUserStatusClass(
                          selectedUser.status
                        )
                      }
                    >

                      <span></span>

                      {
                        String(
                          selectedUser.status ||
                            "ACTIVE"
                        ).toUpperCase()
                      }

                    </strong>

                  </div>


                  <div>

                    <span>
                      CREATED
                    </span>

                    <strong>
                      {
                        formatDate(
                          selectedUser.created_at
                        )
                      }
                    </strong>

                  </div>


                  <div>

                    <span>
                      USER ID
                    </span>

                    <strong>
                      {
                        selectedUser.id
                      }
                    </strong>

                  </div>

                </div>


                {/* ROLE MANAGEMENT */}

                <div className="user-management-section">

                  <p>
                    CHANGE ROLE
                  </p>

                  <div className="user-role-buttons">

                    {[
                      "ADMIN",
                      "SALES",
                      "WAREHOUSE",
                      "ACCOUNTS"
                    ].map(
                      (role) => (

                        <button
                          key={
                            role
                          }
                          className={
                            String(
                              selectedUser.role ||
                                ""
                            ).toUpperCase() ===
                            role
                              ? "selected"
                              : ""
                          }
                          disabled={
                            submitting ||
                            currentUser?.id ===
                              selectedUser.id
                          }
                          onClick={() =>
                            updateRole(
                              selectedUser.id,
                              role
                            )
                          }
                        >
                          {role}
                        </button>

                      )
                    )}

                  </div>

                </div>


                {/* STATUS MANAGEMENT */}

                <div className="user-management-section">

                  <p>
                    ACCOUNT STATUS
                  </p>

                  <button
                    className={
                      String(
                        selectedUser.status ||
                          "ACTIVE"
                      ).toUpperCase() ===
                      "ACTIVE"
                        ? "user-deactivate-button"
                        : "user-activate-button"
                    }
                    disabled={
                      submitting ||
                      currentUser?.id ===
                        selectedUser.id
                    }
                    onClick={() =>
                      updateStatus(
                        selectedUser
                      )
                    }
                  >

                    {String(
                      selectedUser.status ||
                        "ACTIVE"
                    ).toUpperCase() ===
                    "ACTIVE"
                      ? "Deactivate user"
                      : "Activate user"}

                  </button>

                </div>


                {/* CLOSE */}

                <div className="customer-form-footer">

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

                </div>

              </div>

            ) : (

              <div className="customer-empty">
                Unable to load user.
              </div>

            )}

          </div>

        </div>

      )}

    </div>
  );
};

export default UsersPage;
