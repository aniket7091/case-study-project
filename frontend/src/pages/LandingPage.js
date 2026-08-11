import React, { useEffect } from "react";
import { Link, useLocation,useNavigate } from "react-router-dom";
import "../App.css";

const LandingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Map route paths to section IDs
    const sectionMap = {
      "/features": "features",
      "/workflow": "workflow",
      "/roles": "roles",
      "/about": "about",
      "/contact": "contact",
    };
    const sectionId = sectionMap[location.pathname];
    if (sectionId) {
      const el = document.getElementById(sectionId);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
      }
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location.pathname]);
  return (
    <div className="landing-page">

      {/* NAVBAR */}

      <nav className="navbar">

        <div className="nav-logo">
          <div className="logo-mark">T</div>
          <span>TradeFlow</span>
        </div>

        <div className="nav-links">
          <Link to="/features">Features</Link>
          <Link to="/workflow">How it works</Link>
          <Link to="/roles">Roles</Link>
        </div>

        <div className="nav-actions">
          <button className="login-btn" onClick={() => navigate("/login")}>
            Login
          </button>

          <button className="nav-cta" onClick={() => navigate("/login")}>
            Get Started
          </button>
        </div>

      </nav>


      {/*  HERO  */}

      <section className="hero">

        <div className="hero-content">

          <div className="hero-badge">
            <span></span>
            Built for modern businesses
          </div>

          <h1>
            Run your business.
            <br />
            <span>All in one flow.</span>
          </h1>

          <p>
            TradeFlow brings customers, products, inventory
            and sales operations together in one simple
            ERP & CRM platform.
          </p>

          <div className="hero-buttons">

            <button className="primary-btn" onClick={() => navigate("/login")}>
              Get Started
              <span>→</span>
            </button>

            <button className="secondary-btn" onClick={() => navigate("/login")}>
              Explore Features
            </button>

          </div>

          <div className="hero-note">
            <span>✓</span>
            Simple setup · Role-based access · Built for teams
          </div>

        </div>


        {/*  DASHBOARD PREVIEW  */}

        <div className="dashboard-preview">

          <div className="dashboard-window">

            <div className="window-header">

              <div className="window-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>

              <div className="window-title">
                TradeFlow Dashboard
              </div>

            </div>


            <div className="dashboard-body">

              <aside className="dashboard-sidebar">

                <div className="sidebar-brand">
                  T
                </div>

                <div className="sidebar-item active">
                  ◉
                </div>

                <div className="sidebar-item">
                  □
                </div>

                <div className="sidebar-item">
                  ◇
                </div>

                <div className="sidebar-item">
                  ≡
                </div>

              </aside>


              <main className="dashboard-main">

                <div className="dashboard-top">

                  <div>
                    <p className="small-text">
                      Overview
                    </p>

                    <h3>
                      Good morning, Admin
                    </h3>
                  </div>

                  <div className="profile-circle">
                    A
                  </div>

                </div>


                <div className="stats-grid">

                  <div className="stat-card">
                    <p>Total Customers</p>
                    <h2>1,248</h2>
                    <span>+12.5%</span>
                  </div>

                  <div className="stat-card">
                    <p>Total Products</p>
                    <h2>486</h2>
                    <span>+8.2%</span>
                  </div>

                  <div className="stat-card">
                    <p>Active Challans</p>
                    <h2>128</h2>
                    <span>+5.4%</span>
                  </div>

                </div>


                <div className="dashboard-content-grid">

                  <div className="chart-card">

                    <div className="card-heading">
                      <div>
                        <p>Business Overview</p>
                        <h3>Sales activity</h3>
                      </div>

                      <span>
                        This month
                      </span>
                    </div>

                    <div className="fake-chart">

                      <div className="chart-line">
                        <i></i>
                        <i></i>
                        <i></i>
                        <i></i>
                        <i></i>
                        <i></i>
                        <i></i>
                      </div>

                    </div>

                  </div>


                  <div className="activity-card">

                    <div className="card-heading">
                      <div>
                        <p>Recent activity</p>
                        <h3>Latest updates</h3>
                      </div>
                    </div>

                    <div className="activity-item">
                      <div className="activity-icon">
                        C
                      </div>

                      <div>
                        <strong>
                          New customer added
                        </strong>
                        <small>
                          2 minutes ago
                        </small>
                      </div>
                    </div>

                    <div className="activity-item">
                      <div className="activity-icon">
                        P
                      </div>

                      <div>
                        <strong>
                          Stock updated
                        </strong>
                        <small>
                          18 minutes ago
                        </small>
                      </div>
                    </div>

                    <div className="activity-item">
                      <div className="activity-icon">
                        S
                      </div>

                      <div>
                        <strong>
                          Challan confirmed
                        </strong>
                        <small>
                          32 minutes ago
                        </small>
                      </div>
                    </div>

                  </div>

                </div>

              </main>

            </div>

          </div>

        </div>

      </section>


      {/*  TRUST  */}

      <section className="trust-section">

        <p>
          Everything your operations team needs
        </p>

        <div className="trust-items">
          <span>CRM</span>
          <span>INVENTORY</span>
          <span>SALES</span>
          <span>OPERATIONS</span>
          <span>REPORTING</span>
        </div>

      </section>


      {/*  FEATURES  */}

      <section
        className="features-section"
        id="features"
      >

        <div className="section-header">

          <div className="section-label">
            FEATURES
          </div>

          <h2>
            One platform.
            <br />
            <span>Every operation.</span>
          </h2>

          <p>
            Keep your entire business workflow connected,
            from your first customer interaction to your
            final sales transaction.
          </p>

        </div>


        <div className="features-grid">

          <div className="feature-card large">

            <div className="feature-icon">
              ◎
            </div>

            <h3>
              Customer CRM
            </h3>

            <p>
              Manage customers, businesses, leads,
              follow-ups and customer relationships
              from one place.
            </p>

            <div className="feature-ui">

              <div className="mini-row">
                <span>Sharma Traders</span>
                <b>ACTIVE</b>
              </div>

              <div className="mini-row">
                <span>ABC Distributors</span>
                <b>LEAD</b>
              </div>

              <div className="mini-row">
                <span>Global Retail</span>
                <b>ACTIVE</b>
              </div>

            </div>

          </div>


          <div className="feature-card">

            <div className="feature-icon">
              ◇
            </div>

            <h3>
              Inventory Control
            </h3>

            <p>
              Track products, stock levels, warehouses
              and every stock movement.
            </p>

            <div className="stock-ui">

              <div>
                <span>Current stock</span>
                <strong>1,284</strong>
              </div>

              <div className="stock-bar">
                <span></span>
              </div>

            </div>

          </div>


          <div className="feature-card">

            <div className="feature-icon">
              ≡
            </div>

            <h3>
              Sales Challans
            </h3>

            <p>
              Create, manage and confirm sales challans
              while automatically updating inventory.
            </p>

            <div className="challan-ui">
              <span>CH-20260811-0012</span>
              <b>CONFIRMED</b>
            </div>

          </div>


          <div className="feature-card">

            <div className="feature-icon">
              ◉
            </div>

            <h3>
              Role-based Access
            </h3>

            <p>
              Give every team member exactly the access
              they need.
            </p>

            <div className="roles-mini">

              <span>ADMIN</span>
              <span>SALES</span>
              <span>WAREHOUSE</span>
              <span>ACCOUNTS</span>

            </div>

          </div>


          <div className="feature-card large">

            <div className="feature-icon">
              ↗
            </div>

            <h3>
              Business Overview
            </h3>

            <p>
              Get a clear view of customers, products,
              inventory and sales activity.
            </p>

            <div className="overview-numbers">

              <div>
                <strong>1,248</strong>
                <span>Customers</span>
              </div>

              <div>
                <strong>486</strong>
                <span>Products</span>
              </div>

              <div>
                <strong>128</strong>
                <span>Challans</span>
              </div>

            </div>

          </div>

        </div>

      </section>


      {/*  WORKFLOW  */}

      <section
        className="workflow-section"
        id="workflow"
      >

        <div className="section-header centered">

          <div className="section-label">
            HOW IT WORKS
          </div>

          <h2>
            From customer to
            <br />
            <span>completed sale.</span>
          </h2>

          <p>
            TradeFlow connects every step of your
            operational workflow.
          </p>

        </div>


        <div className="workflow">

          <div className="workflow-step">

            <div className="step-number">
              01
            </div>

            <h3>
              Manage Customers
            </h3>

            <p>
              Add customers and manage follow-ups
              from your CRM.
            </p>

          </div>


          <div className="workflow-line"></div>


          <div className="workflow-step">

            <div className="step-number">
              02
            </div>

            <h3>
              Manage Products
            </h3>

            <p>
              Maintain products, pricing and
              warehouse stock.
            </p>

          </div>


          <div className="workflow-line"></div>


          <div className="workflow-step">

            <div className="step-number">
              03
            </div>

            <h3>
              Create Challan
            </h3>

            <p>
              Select customers, products and
              quantities.
            </p>

          </div>


          <div className="workflow-line"></div>


          <div className="workflow-step">

            <div className="step-number">
              04
            </div>

            <h3>
              Confirm Sale
            </h3>

            <p>
              Confirm the challan and automatically
              update stock.
            </p>

          </div>

        </div>

      </section>


      {/*  ROLES  */}

      <section
        className="roles-section"
        id="roles"
      >

        <div className="roles-content">

          <div>

            <div className="section-label">
              BUILT FOR TEAMS
            </div>

            <h2>
              Everyone gets
              <br />
              <span>the right access.</span>
            </h2>

            <p>
              TradeFlow's role-based access keeps your
              business data secure while giving every team
              member the tools they need.
            </p>

          </div>


          <div className="role-list">

            <div className="role-item active">
              <div className="role-icon">
                A
              </div>

              <div>
                <h3>Admin</h3>
                <p>
                  Full system control and management
                </p>
              </div>

              <span>→</span>
            </div>


            <div className="role-item">
              <div className="role-icon">
                S
              </div>

              <div>
                <h3>Sales</h3>
                <p>
                  Customers, follow-ups and challans
                </p>
              </div>

              <span>→</span>
            </div>


            <div className="role-item">
              <div className="role-icon">
                W
              </div>

              <div>
                <h3>Warehouse</h3>
                <p>
                  Products and inventory management
                </p>
              </div>

              <span>→</span>
            </div>


            <div className="role-item">
              <div className="role-icon">
                A
              </div>

              <div>
                <h3>Accounts</h3>
                <p>
                  Sales records and business reports
                </p>
              </div>

              <span>→</span>
            </div>

          </div>

        </div>

      </section>


      {/*  CTA  */}

      <section className="cta-section">

        <div className="cta-card">

          <div>

            <div className="section-label">
              GET STARTED
            </div>

            <h2>
              Bring your business
              <br />
              into one flow.
            </h2>

            <p>
              Manage customers, inventory and sales
              operations with TradeFlow.
            </p>

          </div>

          <button className="primary-btn" onClick={() => navigate("/login")}>
            Get Started
            <span>→</span>
          </button>

        </div>

      </section>


      {/*  FOOTER  */}

      <footer className="footer">

        <div className="footer-brand">

          <div className="nav-logo">
            <div className="logo-mark">
              T
            </div>

            <span>
              TradeFlow
            </span>
          </div>

          <p>
            Simple operations.
            <br />
            Better business.
          </p>

        </div>


        <div className="footer-links">

          <div>
            <h4>Product</h4>
            <Link to="/features">Features</Link>
            <Link to="/workflow">How it works</Link>
            <Link to="/roles">Roles</Link>
          </div>

          <div>
            <h4>Company</h4>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
          </div>

        </div>


        <div className="footer-bottom">
          <span>
            © 2026 TradeFlow
          </span>

          <span>
            ERP & CRM Operations Portal
          </span>
        </div>

      </footer>

    </div>
  );
};

export default LandingPage;