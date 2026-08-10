const userService = require("../services/user.service");
const {
    validateCreateUser,
    validateUpdateRole,
    validateUpdateStatus
} = require("../validators/user.validator");

// CREATE USER
const createUser = async (req, res) => {
    try {
        const { isValid, errors } = validateCreateUser(req.body);

        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors
            });
        }

        const user = await userService.createUser(req.body);

        return res.status(201).json({
            success: true,
            message: "User created successfully",
            data: user
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

// GET ALL USERS
const getUsers = async (req, res) => {
    try {
        const users = await userService.getUsers();

        return res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// GET USER BY ID
const getUserById = async (req, res) => {
    try {
        const user = await userService.getUserById(req.params.id);

        return res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

// CHANGE USER ROLE
const updateUserRole = async (req, res) => {
    try {
        const { isValid, errors } = validateUpdateRole(req.body);

        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors
            });
        }

        const user = await userService.updateUserRole(req.params.id, req.body.role);

        return res.status(200).json({
            success: true,
            message: "User role updated successfully",
            data: user
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

// ACTIVATE / DEACTIVATE USER
const updateUserStatus = async (req, res) => {
    try {
        const { isValid, errors } = validateUpdateStatus(req.body);

        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors
            });
        }

        const user = await userService.updateUserStatus(req.params.id, req.body.is_active);

        return res.status(200).json({
            success: true,
            message: `User ${req.body.is_active ? 'activated' : 'deactivated'} successfully`,
            data: user
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createUser,
    getUsers,
    getUserById,
    updateUserRole,
    updateUserStatus
};
