const customerService = require("../services/customer.service");
const {
    validateCustomer,
    validateCustomerUpdate
} = require("../validators/customer.validator");


// CREATE CUSTOMER
const createCustomer = async (req, res) => {

    try {

        const { isValid, errors } =
            validateCustomer(req.body);

        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors
            });
        }

        const customer =
            await customerService.createCustomer(
                req.body,
                req.user.id
            );

        return res.status(201).json({
            success: true,
            message: "Customer created successfully",
            data: customer
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// GET CUSTOMERS
const getCustomers = async (req, res) => {

    try {

        const {
            search,
            status,
            customer_type,
            page = 1,
            limit = 10
        } = req.query;

        const result =
            await customerService.getCustomers({
                search,
                status,
                customer_type,
                page: Number(page),
                limit: Number(limit)
            });

        return res.status(200).json({
            success: true,
            data: result.customers,
            pagination: result.pagination
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// GET CUSTOMER BY ID
const getCustomerById = async (req, res) => {

    try {

        const customer =
            await customerService.getCustomerById(
                req.params.id
            );

        return res.status(200).json({
            success: true,
            data: customer
        });

    } catch (error) {

        return res.status(404).json({
            success: false,
            message: "Customer not found"
        });
    }
};


// UPDATE CUSTOMER
const updateCustomer = async (req, res) => {

    try {

        const { isValid, errors } =
            validateCustomerUpdate(req.body);

        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors
            });
        }

        const customer =
            await customerService.updateCustomer(
                req.params.id,
                req.body
            );

        return res.status(200).json({
            success: true,
            message: "Customer updated successfully",
            data: customer
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ADD FOLLOW-UP
const addFollowUp = async (req, res) => {

    try {

        if (!req.body) {
            return res.status(400).json({
                success: false,
                message: "Request body is missing. Ensure Content-Type is set to application/json."
            });
        }

        const {
            note,
            follow_up_date
        } = req.body;

        if (!note || note.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Follow-up note is required"
            });
        }

        const followUp =
            await customerService.addFollowUp(
                req.params.id,
                note,
                follow_up_date,
                req.user.id
            );

        return res.status(201).json({
            success: true,
            message: "Follow-up added successfully",
            data: followUp
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


module.exports = {
    createCustomer,
    getCustomers,
    getCustomerById,
    updateCustomer,
    addFollowUp
};