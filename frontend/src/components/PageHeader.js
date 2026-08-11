import React from "react";

const PageHeader = ({
  breadcrumb,
  title,
  subtitle,
  actions,
  leading,
  className = ""
}) => (
  <header className={`dashboard-header ${className}`.trim()}>
    {leading}
    <div>
      {breadcrumb && <p className="dashboard-breadcrumb">{breadcrumb}</p>}
      <h1>{title}</h1>
      {subtitle && <p className="dashboard-subtitle">{subtitle}</p>}
    </div>
    {actions && <div className="dashboard-header-right">{actions}</div>}
  </header>
);

export default PageHeader;
