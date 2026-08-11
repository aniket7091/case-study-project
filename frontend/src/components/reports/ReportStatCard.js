import React from "react";

const ReportStatCard = ({ label, value, detail }) => (
  <div className="report-stat-card">
    <span>{label}</span>
    <strong>{value}</strong>
    <small>{detail}</small>
  </div>
);

export default ReportStatCard;
