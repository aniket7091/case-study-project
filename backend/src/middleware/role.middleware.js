const { sendError } = require("../utils/response");

/**
 * Role-based access control middleware factory.
 * @param  {...string} allowedRoles List of roles allowed to access the route
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // Check if user is authenticated (should be guaranteed by authMiddleware.protect)
    if (!req.user) {
      return sendError(res, 401, "Access denied. User not authenticated.");
    }

    // Check if user has required role
    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        `Access denied. Requires one of: [${allowedRoles.join(", ")}]`
      );
    }

    next();
  };
};

module.exports = { authorizeRoles };
