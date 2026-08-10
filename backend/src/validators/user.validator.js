const validateCreateUser = (data) => {
    const { name, email, password, role } = data;
    const errors = {};

    if (!name || name.trim().length === 0) {
        errors.name = "Name is required";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        errors.email = "Valid email is required";
    }

    if (!password || password.length < 6) {
        errors.password = "Password must be at least 6 characters";
    }

    const allowedRoles = ["ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"];
    if (!role || !allowedRoles.includes(role.toUpperCase())) {
        errors.role = `Role must be one of: ${allowedRoles.join(", ")}`;
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

const validateUpdateRole = (data) => {
    const { role } = data;
    const errors = {};

    const allowedRoles = ["ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"];
    if (!role || !allowedRoles.includes(role.toUpperCase())) {
        errors.role = `Role must be one of: ${allowedRoles.join(", ")}`;
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

const validateUpdateStatus = (data) => {
    const { is_active } = data;
    const errors = {};

    if (typeof is_active !== "boolean") {
        errors.is_active = "is_active must be a boolean value";
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

module.exports = {
    validateCreateUser,
    validateUpdateRole,
    validateUpdateStatus
};
