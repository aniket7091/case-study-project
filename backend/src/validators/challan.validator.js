const validateChallan = (data) => {

    const {
        customer_id,
        products,
        status
    } = data;

    const errors = {};

    // Customer
    if (!customer_id) {
        errors.customer_id =
            "Customer is required";
    }

    // Products
    if (!products) {

        errors.products =
            "Products are required";

    } else if (!Array.isArray(products)) {

        errors.products =
            "Products must be an array";

    } else if (products.length === 0) {

        errors.products =
            "At least one product is required";

    } else {

        products.forEach((product, index) => {

            if (!product.product_id) {

                errors[`products.${index}.product_id`] =
                    "Product ID is required";
            }

            if (
                product.quantity === undefined ||
                product.quantity === null
            ) {

                errors[`products.${index}.quantity`] =
                    "Quantity is required";

            } else if (
                Number(product.quantity) <= 0 ||
                !Number.isInteger(
                    Number(product.quantity)
                )
            ) {

                errors[`products.${index}.quantity`] =
                    "Quantity must be a positive integer";
            }
        });
    }

    // Status
    if (
        status &&
        !["DRAFT", "CONFIRMED"].includes(status)
    ) {

        errors.status =
            "Status must be DRAFT or CONFIRMED";
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};


const validateCancelChallan = (data) => {

    const { reason } = data;

    const errors = {};

    if (!reason || reason.trim().length === 0) {

        errors.reason =
            "Cancellation reason is required";
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};


module.exports = {
    validateChallan,
    validateCancelChallan
};