const validateProduct = (data) => {
    const {
        name,
        sku,
        category,
        unit_price,
        current_stock,
        minimum_stock,
        warehouse_location
    } = data;

    const errors = {};

    // Product name
    if (!name || name.trim().length < 2) {
        errors.name = "Product name is required";
    }

    // SKU
    if (!sku || sku.trim().length < 2) {
        errors.sku = "SKU is required";
    }

    // Category
    if (!category || category.trim().length < 2) {
        errors.category = "Category is required";
    }

    // Unit price
    if (
        unit_price === undefined ||
        unit_price === null ||
        unit_price === ""
    ) {
        errors.unit_price = "Unit price is required";
    } else if (Number(unit_price) < 0) {
        errors.unit_price = "Unit price cannot be negative";
    }

    // Current stock
    if (
        current_stock !== undefined &&
        Number(current_stock) < 0
    ) {
        errors.current_stock =
            "Current stock cannot be negative";
    }

    // Minimum stock
    if (
        minimum_stock !== undefined &&
        Number(minimum_stock) < 0
    ) {
        errors.minimum_stock =
            "Minimum stock cannot be negative";
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};


const validateStockMovement = (data) => {

    const {
        quantity,
        movement_type,
        reason
    } = data;

    const errors = {};

    if (
        quantity === undefined ||
        quantity === null ||
        quantity === ""
    ) {
        errors.quantity = "Quantity is required";
    } else if (Number(quantity) <= 0) {
        errors.quantity =
            "Quantity must be greater than 0";
    }

    if (!movement_type) {
        errors.movement_type =
            "Movement type is required";
    } else if (
        !["IN", "OUT"].includes(movement_type)
    ) {
        errors.movement_type =
            "Movement type must be IN or OUT";
    }

    if (!reason || reason.trim().length === 0) {
        errors.reason = "Reason is required";
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};


module.exports = {
    validateProduct,
    validateStockMovement
};