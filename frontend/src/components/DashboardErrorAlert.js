import React from "react";

const DashboardErrorAlert = ({ message, onDismiss }) => {
  if (!message) return null;

  return (
    <div className="dashboard-error" role="alert">
      <span>!</span>
      {message}
      {onDismiss && (
        <button type="button" onClick={onDismiss} aria-label="Dismiss error">
          ×
        </button>
      )}
    </div>
  );
};

export default DashboardErrorAlert;
