import React from "react";

const AuthInput = ({
  id,
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  autoComplete,
  icon,
  // Password-specific props
  isPassword,
  showPassword,
  onTogglePassword,
  // Forgot password (only for password field)
  onForgotPassword,
}) => {
  return (
    <div className="form-group">

      {/* Label row */}
      <div className={isPassword ? "password-label" : ""}>

        <label htmlFor={id}>
          {label}
        </label>

        {isPassword && onForgotPassword && (
          <button
            type="button"
            className="forgot-password"
            onClick={onForgotPassword}
          >
            Forgot password?
          </button>
        )}

      </div>

      {/* Input wrapper */}
      <div className="input-wrapper">

        {icon && (
          <span className="input-icon">
            {icon}
          </span>
        )}

        <input
          id={id}
          type={isPassword ? (showPassword ? "text" : "password") : type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
        />

        {isPassword && onTogglePassword && (
          <button
            type="button"
            className="password-toggle"
            onClick={onTogglePassword}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        )}

      </div>

    </div>
  );
};

export default AuthInput;
