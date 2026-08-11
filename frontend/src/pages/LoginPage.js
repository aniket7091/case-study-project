import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "https://case-study-backend-3cb3.onrender.com/api";

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.email || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      /*
       * Backend login API
       *
       * Change this URL if your backend
       * uses a different port/path.
       */

      const response = await fetch(
        `${API_URL}/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Login failed"
        );
      }

      /*
       * Store JWT
       *
       * Adjust token key according to
       * your backend response.
       */

      const token =
        data.token ||
        data.data?.token;

      if (!token) {
        throw new Error(
          "Authentication token was not returned by the server."
        );
      }

      localStorage.setItem(
        "tradeflow_token",
        token
      );

      /*
       * Store user information if
       * backend returns it.
       */

      if (data.user) {
        localStorage.setItem(
          "tradeflow_user",
          JSON.stringify(data.user)
        );
      }

      if (data.data?.user) {
        localStorage.setItem(
          "tradeflow_user",
          JSON.stringify(data.data.user)
        );
      }

      /*
       * Navigate to dashboard
       */

      navigate("/dashboard");

    } catch (err) {

      setError(
        err.message ||
        "Something went wrong. Please try again."
      );

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="login-page">

      {/* LEFT SIDE */}

      <div className="login-left">

        <div className="login-brand">

          <div className="login-logo">
            T
          </div>

          <span>
            TradeFlow
          </span>

        </div>


        <div className="login-left-content">

          <div className="login-badge">
            <span></span>
            ERP & CRM Operations Portal
          </div>

          <h1>
            Everything your
            <br />
            business needs.
          </h1>

          <p>
            Manage customers, products, inventory
            and sales operations from one connected
            platform.
          </p>


          <div className="login-features">

            <div className="login-feature">

              <div className="feature-check">
                ✓
              </div>

              <div>
                <strong>
                  Customer Management
                </strong>

                <span>
                  Keep your customer relationships organized.
                </span>
              </div>

            </div>


            <div className="login-feature">

              <div className="feature-check">
                ✓
              </div>

              <div>
                <strong>
                  Inventory Control
                </strong>

                <span>
                  Track products and stock in real time.
                </span>
              </div>

            </div>


            <div className="login-feature">

              <div className="feature-check">
                ✓
              </div>

              <div>
                <strong>
                  Sales Operations
                </strong>

                <span>
                  Create and manage sales challans easily.
                </span>
              </div>

            </div>

          </div>

        </div>


        <div className="login-left-footer">
          © 2026 TradeFlow
        </div>

      </div>


      {/* RIGHT SIDE */}

      <div className="login-right">

        <div className="login-container">

          {/* Mobile brand */}

          <div className="mobile-login-brand">

            <div className="login-logo">
              T
            </div>

            <span>
              TradeFlow
            </span>

          </div>


          <div className="login-header">

            <div className="login-icon">
              <div className="login-logo">T</div>
              <span>TradeFlow</span>
            </div>
            

            <h2>
              Welcome back
            </h2>

            <p>
              Sign in to your TradeFlow account
            </p>

          </div>


          {/* Error */}

          {error && (

            <div className="login-error">

              <span>!</span>

              <p>
                {error}
              </p>

            </div>

          )}


          {/* Form */}

          <form
            className="login-form"
            onSubmit={handleSubmit}
          >

            {/* Email */}

            <div className="form-group">

              <label htmlFor="email">
                Email address
              </label>

              <div className="input-wrapper">

                <span className="input-icon">
                  @
                </span>

                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                />

              </div>

            </div>


            {/* Password */}

            <div className="form-group">

              <div className="password-label">

                <label htmlFor="password">
                  Password
                </label>

                <button
                  type="button"
                  className="forgot-password"
                  onClick={() => {
                    alert(
                      "Password reset functionality will be added later."
                    );
                  }}
                >
                  Forgot password?
                </button>

              </div>


              <div className="input-wrapper">

                <span className="input-icon">
                  •
                </span>

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (prev) => !prev
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? "Hide" : "Show"}
                </button>

              </div>

            </div>


            {/* Remember */}

            <div className="remember-row">

              <label className="remember-label">

                <input
                  type="checkbox"
                  name="remember"
                />

                <span>
                  Remember me
                </span>

              </label>

            </div>


            {/* Submit */}

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="spinner"></span>
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <span>→</span>
                </>
              )}

            </button>

          </form>


          {/* Back */}

          <button
            className="back-home"
            onClick={() => navigate("/")}
          >
            ← Back to homepage
          </button>


          <div className="login-security">

            <span>
              🔒
            </span>

            Secure authentication

          </div>

        </div>

      </div>

    </div>
  );
};

export default LoginPage;