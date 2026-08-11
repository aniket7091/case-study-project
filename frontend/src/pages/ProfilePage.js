import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarNavigation from "../components/SidebarNavigation";
import PageHeader from "../components/PageHeader";
import DashboardErrorAlert from "../components/DashboardErrorAlert";
import { getStoredUser } from "../config/permissions";

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
        ? "Profile API endpoint was not found."
        : "Profile service returned an unexpected response."
    );
  }
};

const ProfilePage = () => {
  const navigate = useNavigate();

  const API_URL =
    process.env.REACT_APP_API_URL ||
    DEFAULT_API_URL;

  // 
  // USER
  // 

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // 
  // PASSWORD
  // 

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [changingPassword, setChangingPassword] =
    useState(false);

  // 
  // PASSWORD VISIBILITY
  // 

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
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
  // FETCH PROFILE
  // 

  const fetchProfile = async () => {
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

      const response = await fetch(
        `${API_URL}/auth/me`,
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
            "Unable to load profile."
        );
      }

      const profile =
        data.data ||
        data.user ||
        data;

      setUser(profile);

      /*
       * Keep localStorage user
       * synchronized.
       */

      localStorage.setItem(
        "tradeflow_user",
        JSON.stringify(profile)
      );

    } catch (err) {
      console.error(
        "Profile fetch error:",
        err
      );

      setError(
        err.message ||
          "Unable to load profile."
      );

    } finally {
      setLoading(false);
    }
  };

  // 
  // INITIAL LOAD
  // 

  useEffect(() => {
    fetchProfile();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 
  // PASSWORD FORM CHANGE
  // 

  const handlePasswordChange = (e) => {
    const {
      name,
      value
    } = e.target;

    setPasswordForm((prev) => ({
      ...prev,

      [name]: value
    }));

    setError("");

    setSuccess("");
  };

  // 
  // PASSWORD STRENGTH
  // 

  const getPasswordStrength = () => {
    const password =
      passwordForm.newPassword;

    if (!password) {
      return {
        label: "",
        className: "",
        width: "0%"
      };
    }

    let score = 0;

    if (password.length >= 6) {
      score++;
    }

    if (password.length >= 10) {
      score++;
    }

    if (/[A-Z]/.test(password)) {
      score++;
    }

    if (/[0-9]/.test(password)) {
      score++;
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score++;
    }

    if (score <= 2) {
      return {
        label: "Weak",
        className: "weak",
        width: "35%"
      };
    }

    if (score <= 4) {
      return {
        label: "Good",
        className: "good",
        width: "70%"
      };
    }

    return {
      label: "Strong",
      className: "strong",
      width: "100%"
    };
  };

  // 
  // CHANGE PASSWORD
  // 

  const handleChangePassword = async (
    e
  ) => {
    e.preventDefault();

    setChangingPassword(true);

    setError("");

    setSuccess("");

    try {
      const token = getToken();

      if (!token) {
        navigate("/login", {
          replace: true
        });

        return;
      }

      const {
        currentPassword,
        newPassword,
        confirmPassword
      } = passwordForm;

      if (!currentPassword) {
        throw new Error(
          "Please enter your current password."
        );
      }

      if (
        newPassword.length < 6
      ) {
        throw new Error(
          "New password must contain at least 6 characters."
        );
      }

      if (
        newPassword ===
        currentPassword
      ) {
        throw new Error(
          "New password must be different from your current password."
        );
      }

      if (
        newPassword !==
        confirmPassword
      ) {
        throw new Error(
          "New password and confirm password do not match."
        );
      }

      const response = await fetch(
        `${API_URL}/auth/change-password`,
        {
          method: "PUT",

          headers: {
            Authorization:
              `Bearer ${token}`,

            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            currentPassword,
            newPassword
          })
        }
      );

      const data =
        await readApiResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Unable to change password."
        );
      }

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });

      setSuccess(
        "Your password has been changed successfully."
      );

    } catch (err) {
      console.error(
        "Change password error:",
        err
      );

      setError(
        err.message ||
          "Unable to change password."
      );

    } finally {
      setChangingPassword(false);
    }
  };

  // 
  // LOGOUT
  // 

  const handleLogout = async () => {
    const confirmed =
      window.confirm(
        "Are you sure you want to logout?"
      );

    if (!confirmed) {
      return;
    }

    try {
      const token = getToken();

      if (token) {
        await fetch(
          `${API_URL}/auth/logout`,
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json"
            }
          }
        );
      }

    } catch (err) {
      console.error(
        "Logout API error:",
        err
      );

    } finally {

      /*
       * JWT is stateless, therefore
       * remove it from client storage.
       */

      localStorage.removeItem(
        "tradeflow_token"
      );

      localStorage.removeItem(
        "tradeflow_user"
      );

      navigate("/login", {
        replace: true
      });
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
          month: "long",
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
  // PASSWORD STRENGTH
  // 

  const passwordStrength =
    getPasswordStrength();

  // 
  // LOADING
  // 

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="profile-loading-box">
          Loading profile...
        </div>
      </div>
    );
  }

  // 
  // RENDER
  // 

  return (
    <div className="dashboard-page profile-page">

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


        {/* 
            SIDEBAR USER
         */}

        <div className="dashboard-sidebar-bottom">

          <button
            className="profile-sidebar-user active"
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

        {/* 
            HEADER
         */}

        <PageHeader
          breadcrumb="Account / Profile"
          title="My Profile"
          subtitle="Manage your account information and security settings."
          actions={<button className="notification-button">♢</button>}
        />


        {/* 
            ERROR
         */}

        <DashboardErrorAlert
          message={error}
          onDismiss={() => setError("")}
        />


        {/* 
            SUCCESS
         */}

        {success && (

          <div className="profile-success">

            <span>
              ✓
            </span>

            {success}

            <button
              onClick={() =>
                setSuccess("")
              }
            >
              ×
            </button>

          </div>

        )}


        {/* 
            PROFILE CONTENT
         */}

        <div className="profile-page-grid">

          {/* 
              PROFILE CARD
           */}

          <section className="profile-card">

            <div className="profile-card-header">

              <div>

                <p>
                  ACCOUNT
                </p>

                <h2>
                  Profile information
                </h2>

              </div>

            </div>


            {/* AVATAR */}

            <div className="profile-main-info">

              <div className="profile-large-avatar">

                {(
                  user?.name ||
                  "U"
                )
                  .charAt(0)
                  .toUpperCase()}

              </div>


              <div>

                <h3>
                  {
                    user?.name ||
                    "User"
                  }
                </h3>

                <p>
                  {
                    user?.email ||
                    "-"
                  }
                </p>

                <span
                  className={
                    getRoleClass(
                      user?.role
                    )
                  }
                >
                  {
                    String(
                      user?.role ||
                        "USER"
                    ).toUpperCase()
                  }
                </span>

              </div>

            </div>


            {/* PROFILE DETAILS */}

            <div className="profile-details">

              <div className="profile-detail-item">

                <span>
                  FULL NAME
                </span>

                <strong>
                  {
                    user?.name ||
                    "-"
                  }
                </strong>

              </div>


              <div className="profile-detail-item">

                <span>
                  EMAIL ADDRESS
                </span>

                <strong>
                  {
                    user?.email ||
                    "-"
                  }
                </strong>

              </div>


              <div className="profile-detail-item">

                <span>
                  ROLE
                </span>

                <strong>
                  {
                    String(
                      user?.role ||
                        "USER"
                    ).toUpperCase()
                  }
                </strong>

              </div>


              <div className="profile-detail-item">

                <span>
                  ACCOUNT STATUS
                </span>

                <strong className="profile-active-status">

                  <span></span>

                  {
                    String(
                      user?.status ||
                        "ACTIVE"
                    ).toUpperCase()
                  }

                </strong>

              </div>


              <div className="profile-detail-item">

                <span>
                  USER ID
                </span>

                <strong className="profile-id">

                  {
                    user?.id ||
                    "-"
                  }

                </strong>

              </div>


              <div className="profile-detail-item">

                <span>
                  MEMBER SINCE
                </span>

                <strong>
                  {
                    formatDate(
                      user?.created_at ||
                        user?.createdAt
                    )
                  }
                </strong>

              </div>

            </div>

          </section>


          {/* 
              SECURITY CARD
           */}

          <section className="profile-card">

            <div className="profile-card-header">

              <div>

                <p>
                  SECURITY
                </p>

                <h2>
                  Change password
                </h2>

                <span>
                  Keep your account secure with
                  a strong password.
                </span>

              </div>

            </div>


            <form
              className="profile-password-form"
              onSubmit={
                handleChangePassword
              }
            >

              {/* CURRENT PASSWORD */}

              <div className="profile-form-group">

                <label>
                  Current password
                </label>

                <div className="profile-password-input">

                  <input
                    type={
                      showCurrentPassword
                        ? "text"
                        : "password"
                    }
                    name="currentPassword"
                    value={
                      passwordForm.currentPassword
                    }
                    onChange={
                      handlePasswordChange
                    }
                    placeholder="Enter current password"
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowCurrentPassword(
                        (prev) =>
                          !prev
                      )
                    }
                  >
                    {showCurrentPassword
                      ? "Hide"
                      : "Show"}
                  </button>

                </div>

              </div>


              {/* NEW PASSWORD */}

              <div className="profile-form-group">

                <label>
                  New password
                </label>

                <div className="profile-password-input">

                  <input
                    type={
                      showNewPassword
                        ? "text"
                        : "password"
                    }
                    name="newPassword"
                    value={
                      passwordForm.newPassword
                    }
                    onChange={
                      handlePasswordChange
                    }
                    placeholder="Enter new password"
                    minLength="6"
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowNewPassword(
                        (prev) =>
                          !prev
                      )
                    }
                  >
                    {showNewPassword
                      ? "Hide"
                      : "Show"}
                  </button>

                </div>


                {/* PASSWORD STRENGTH */}

                {passwordForm.newPassword && (

                  <div className="password-strength">

                    <div className="password-strength-header">

                      <span>
                        Password strength
                      </span>

                      <strong
                        className={
                          passwordStrength.className
                        }
                      >
                        {
                          passwordStrength.label
                        }
                      </strong>

                    </div>


                    <div className="password-strength-bar">

                      <span
                        className={
                          passwordStrength.className
                        }
                        style={{
                          width:
                            passwordStrength.width
                        }}
                      ></span>

                    </div>

                  </div>

                )}

              </div>


              {/* CONFIRM PASSWORD */}

              <div className="profile-form-group">

                <label>
                  Confirm new password
                </label>

                <div className="profile-password-input">

                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    name="confirmPassword"
                    value={
                      passwordForm.confirmPassword
                    }
                    onChange={
                      handlePasswordChange
                    }
                    placeholder="Confirm new password"
                    minLength="6"
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (prev) =>
                          !prev
                      )
                    }
                  >
                    {showConfirmPassword
                      ? "Hide"
                      : "Show"}
                  </button>

                </div>


                {passwordForm.confirmPassword &&
                  passwordForm.newPassword !==
                    passwordForm.confirmPassword && (

                  <small className="password-error">
                    Passwords do not match.
                  </small>

                )}

              </div>


              {/* SUBMIT */}

              <button
                type="submit"
                className="profile-password-button"
                disabled={
                  changingPassword
                }
              >

                {changingPassword
                  ? "Changing password..."
                  : "Change password"}

              </button>

            </form>

          </section>


          {/* 
              ACCOUNT SECURITY INFO
           */}

          <section className="profile-card profile-security-info">

            <div className="profile-card-header">

              <div>

                <p>
                  ACCOUNT SECURITY
                </p>

                <h2>
                  Security overview
                </h2>

              </div>

            </div>


            <div className="security-item">

              <div className="security-item-icon">
                ✓
              </div>

              <div>

                <strong>
                  Password protected
                </strong>

                <span>
                  Your account is protected by
                  password authentication.
                </span>

              </div>

            </div>


            <div className="security-item">

              <div className="security-item-icon">
                ✓
              </div>

              <div>

                <strong>
                  JWT authentication
                </strong>

                <span>
                  Your session is authenticated
                  using a secure access token.
                </span>

              </div>

            </div>


            <div className="security-item">

              <div className="security-item-icon">
                ✓
              </div>

              <div>

                <strong>
                  Role-based access
                </strong>

                <span>
                  Your account permissions are
                  determined by your assigned role.
                </span>

              </div>

            </div>

          </section>


          {/* 
              LOGOUT
           */}

          <section className="profile-card profile-danger-card">

            <div>

              <p>
                SESSION
              </p>

              <h2>
                Sign out
              </h2>

              <span>
                Sign out from your TradeFlow
                account on this device.
              </span>

            </div>


            <button
              className="profile-logout-button"
              onClick={
                handleLogout
              }
            >
              Logout
            </button>

          </section>

        </div>

      </main>

    </div>
  );
};

export default ProfilePage;
