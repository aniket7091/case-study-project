const validateCustomer = (data) => {
    const {
        name,
        mobile,
        email,
        business_name,
        gst_number,
        customer_type,
        address,
        status,
        follow_up_date,
        notes
    } = data;

    const errors = {};

    if (!name || name.trim().length < 2) {
        errors.name = "Customer name is required";
    }

    if (!mobile) {
        errors.mobile = "Mobile number is required";
    } else if (!/^[0-9]{10}$/.test(mobile)) {
        errors.mobile = "Mobile number must be 10 digits";
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = "Invalid email address";
    }

    const validTypes = [
        "RETAIL",
        "WHOLESALE",
        "DISTRIBUTOR"
    ];

    if (!customer_type) {
        errors.customer_type = "Customer type is required";
    } else if (!validTypes.includes(customer_type)) {
        errors.customer_type =
            "Customer type must be RETAIL, WHOLESALE or DISTRIBUTOR";
    }

    const validStatuses = [
        "LEAD",
        "ACTIVE",
        "INACTIVE"
    ];

    if (status && !validStatuses.includes(status)) {
        errors.status =
            "Status must be LEAD, ACTIVE or INACTIVE";
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};


// Partial validation for updates — only validates fields that are present
const validateCustomerUpdate = (data) => {
    const {
        name,
        mobile,
        email,
        customer_type,
        status
    } = data;

    const errors = {};

    if (name !== undefined && name.trim().length < 2) {
        errors.name = "Customer name must be at least 2 characters";
    }

    if (mobile !== undefined) {
        if (!mobile) {
            errors.mobile = "Mobile number is required";
        } else if (!/^[0-9]{10}$/.test(mobile)) {
            errors.mobile = "Mobile number must be 10 digits";
        }
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = "Invalid email address";
    }

    const validTypes = ["RETAIL", "WHOLESALE", "DISTRIBUTOR"];
    if (customer_type !== undefined && !validTypes.includes(customer_type)) {
        errors.customer_type =
            "Customer type must be RETAIL, WHOLESALE or DISTRIBUTOR";
    }

    const validStatuses = ["LEAD", "ACTIVE", "INACTIVE"];
    if (status !== undefined && !validStatuses.includes(status)) {
        errors.status = "Status must be LEAD, ACTIVE or INACTIVE";
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};


module.exports = {
    validateCustomer,
    validateCustomerUpdate
};