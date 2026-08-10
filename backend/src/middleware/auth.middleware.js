const jwt = require("jsonwebtoken");
const { sendError } = require("../utils/response");

/**
 * Verify JWT token from Authorization header.
 * Attaches decoded user payload to req.user
 */
const protect = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, 401, "Access denied. No token provided.");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role, name }
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return sendError(res, 401, "Token expired. Please login again.");
    }
    return sendError(res, 401, "Invalid token.");
  }
};

/**
 * Role-based access control middleware factory.
 * Usage: authorize("ADMIN") or authorize("ADMIN", "MANAGER")
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        `Access denied. Requires one of: [${roles.join(", ")}]`
      );
    }
    next();
  };
};

module.exports = { protect, authorize };
