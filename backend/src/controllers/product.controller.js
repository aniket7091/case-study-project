const productService =
    require("../services/product.service");

const {
    validateProduct,
    validateStockMovement
} = require("../validators/product.validator");



// CREATE PRODUCT


const createProduct = async (req, res) => {

    try {

        const {
            isValid,
            errors
        } = validateProduct(req.body);

        if (!isValid) {

            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors
            });
        }

        const product =
            await productService.createProduct(
                req.body,
                req.user.id
            );

        return res.status(201).json({
            success: true,
            message:
                "Product created successfully",
            data: product
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};



// GET PRODUCTS


const getProducts = async (req, res) => {

    try {

        const {
            search,
            category,
            low_stock,
            page = 1,
            limit = 10
        } = req.query;

        const result =
            await productService.getProducts({
                search,
                category,
                low_stock,
                page: Number(page),
                limit: Number(limit)
            });

        return res.status(200).json({
            success: true,
            data: result.products,
            pagination: result.pagination
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};



// GET PRODUCT BY ID


const getProductById = async (req, res) => {

    try {

        const product =
            await productService.getProductById(
                req.params.id
            );

        return res.status(200).json({
            success: true,
            data: product
        });

    } catch (error) {

        return res.status(404).json({
            success: false,
            message: "Product not found"
        });
    }
};



// UPDATE PRODUCT


const updateProduct = async (req, res) => {

    try {

        const {
            isValid,
            errors
        } = validateProduct(req.body);

        if (!isValid) {

            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors
            });
        }

        const product =
            await productService.updateProduct(
                req.params.id,
                req.body
            );

        return res.status(200).json({
            success: true,
            message:
                "Product updated successfully",
            data: product
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};



// ADD STOCK MOVEMENT


const addStockMovement = async (
    req,
    res
) => {

    try {

        const {
            isValid,
            errors
        } = validateStockMovement(
            req.body
        );

        if (!isValid) {

            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors
            });
        }

        const result =
            await productService.addStockMovement(
                req.params.id,
                req.body,
                req.user.id
            );

        return res.status(201).json({
            success: true,
            message:
                "Stock movement recorded successfully",
            data: result
        });

    } catch (error) {

        const statusCode =
            error.message.includes(
                "Insufficient stock"
            )
                ? 400
                : 500;

        return res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};



// GET STOCK MOVEMENTS


const getStockMovements = async (
    req,
    res
) => {

    try {

        const {
            movement_type,
            page = 1,
            limit = 20
        } = req.query;

        const result =
            await productService.getStockMovements(
                req.params.id,
                {
                    movement_type,
                    page: Number(page),
                    limit: Number(limit)
                }
            );

        return res.status(200).json({
            success: true,
            data: result.movements,
            pagination: result.pagination
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    addStockMovement,
    getStockMovements
};