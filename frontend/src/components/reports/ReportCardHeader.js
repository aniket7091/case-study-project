import React from "react";

const ReportCardHeader = ({ eyebrow, title, meta, action }) => (
  <div className="report-card-header">
    <div>
      <p>{eyebrow}</p>
      <h2>{title}</h2>
    </div>
    {action || meta ? action || <span>{meta}</span> : null}
  </div>
);

export default ReportCardHeader;
