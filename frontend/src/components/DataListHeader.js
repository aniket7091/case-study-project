import React from "react";

const DataListHeader = ({ eyebrow, title, countLabel }) => (
  <div className="customer-table-header">
    <div>
      <p>{eyebrow}</p>
      <h2>{title}</h2>
    </div>
    {countLabel && <span>{countLabel}</span>}
  </div>
);

export default DataListHeader;
