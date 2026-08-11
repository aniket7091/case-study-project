import React from "react";
import { Link } from "react-router-dom";
import "../App.css";

const AccessDeniedPage = () => (
  <main className="access-denied-page">
    <section className="access-denied-card">
      <span className="access-denied-icon" aria-hidden="true">!</span>
      <p>ACCESS RESTRICTED</p>
      <h1>Access Denied</h1>
      <span>You do not have permission to open this page.</span>
      <Link to="/dashboard">Back to dashboard</Link>
    </section>
  </main>
);

export default AccessDeniedPage;
