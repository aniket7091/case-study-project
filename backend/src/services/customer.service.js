const supabase = require("../config/database");

const createCustomer = async (customerData, userId) => {

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
    } = customerData;

    const { data, error } = await supabase
        .from("customers")
        .insert({
            name,
            mobile,
            email: email || null,
            business_name: business_name || null,
            gst_number: gst_number || null,
            customer_type,
            address: address || null,
            status: status || "LEAD",
            follow_up_date: follow_up_date || null,
            notes: notes || null,
            created_by: userId
        })
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


const getCustomers = async ({
    search,
    status,
    customer_type,
    page = 1,
    limit = 10
}) => {

    const offset = (page - 1) * limit;

    let query = supabase
        .from("customers")
        .select("*", { count: "exact" });

    if (search) {
        query = query.or(
            `name.ilike.%${search}%,mobile.ilike.%${search}%,email.ilike.%${search}%,business_name.ilike.%${search}%`
        );
    }

    if (status) {
        query = query.eq("status", status);
    }

    if (customer_type) {
        query = query.eq("customer_type", customer_type);
    }

    query = query
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
        throw new Error(error.message);
    }

    return {
        customers: data,
        pagination: {
            page,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit)
        }
    };
};


const getCustomerById = async (customerId) => {

    const { data, error } = await supabase
        .from("customers")
        .select(`
            *,
            customer_followups (
                id,
                note,
                follow_up_date,
                created_by,
                created_at
            )
        `)
        .eq("id", customerId)
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


const updateCustomer = async (customerId, customerData) => {

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
    } = customerData;

    const { data, error } = await supabase
        .from("customers")
        .update({
            name,
            mobile,
            email: email || null,
            business_name: business_name || null,
            gst_number: gst_number || null,
            customer_type,
            address: address || null,
            status,
            follow_up_date: follow_up_date || null,
            notes: notes || null,
            updated_at: new Date().toISOString()
        })
        .eq("id", customerId)
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


const addFollowUp = async (
    customerId,
    note,
    followUpDate,
    userId
) => {

    const { data, error } = await supabase
        .from("customer_followups")
        .insert({
            customer_id: customerId,
            note,
            follow_up_date: followUpDate || null,
            created_by: userId
        })
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


module.exports = {
    createCustomer,
    getCustomers,
    getCustomerById,
    updateCustomer,
    addFollowUp
};