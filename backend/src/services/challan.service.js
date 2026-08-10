const { supabase } = require("../config/database");



// CREATE SALES CHALLAN


const createChallan = async (
    challanData,
    userId
) => {

    const {
        customer_id,
        products,
        status = "DRAFT"
    } = challanData;



    // Check customer


    const {
        data: customer,
        error: customerError
    } = await supabase
        .from("customers")
        .select("id, name, business_name, status")
        .eq("id", customer_id)
        .single();


    if (customerError || !customer) {

        throw new Error(
            "Customer not found"
        );
    }



    // Prevent duplicate products


    const productIds =
        products.map(
            product => product.product_id
        );

    const uniqueProductIds =
        new Set(productIds);

    if (
        uniqueProductIds.size !==
        productIds.length
    ) {

        throw new Error(
            "Duplicate products are not allowed in a challan"
        );
    }



    // Get products from database


    const {
        data: dbProducts,
        error: productsError
    } = await supabase
        .from("products")
        .select(`
            id,
            name,
            sku,
            unit_price,
            current_stock
        `)
        .in("id", productIds);


    if (productsError) {

        throw new Error(
            productsError.message
        );
    }



    // Make sure every product exists


    if (
        !dbProducts ||
        dbProducts.length !== productIds.length
    ) {

        throw new Error(
            "One or more products were not found"
        );
    }



    // Build product snapshot


    const productMap = new Map();

    dbProducts.forEach(product => {

        productMap.set(
            product.id,
            product
        );

    });


    const items = products.map(item => {

        const product =
            productMap.get(
                item.product_id
            );

        return {
            product_id: product.id,

            product_name:
                product.name,

            sku:
                product.sku,

            unit_price:
                product.unit_price,

            quantity:
                Number(item.quantity)
        };
    });



    // Total quantity


    const totalQuantity =
        items.reduce(
            (total, item) =>
                total + item.quantity,
            0
        );



    // Generate challan number


    const {
        data: numberData,
        error: numberError
    } = await supabase.rpc(
        "generate_challan_number"
    );


    if (numberError) {

        throw new Error(
            numberError.message
        );
    }


    const challanNumber =
        numberData;



    // Always create as DRAFT first so we have a challan ID.
    // If the caller requested CONFIRMED we will call the RPC
    // afterwards — it handles stock checks + stock movements
    // atomically inside a DB transaction.


    const {
        data: challan,
        error: challanError
    } = await supabase
        .from("sales_challans")
        .insert({
            challan_number:
                challanNumber,

            customer_id,

            total_quantity:
                totalQuantity,

            status: "DRAFT",   // always start as DRAFT

            created_by:
                userId
        })
        .select()
        .single();


    if (challanError) {

        throw new Error(
            challanError.message
        );
    }



    // Create challan items


    const challanItems =
        items.map(item => ({
            challan_id:
                challan.id,

            product_id:
                item.product_id,

            product_name:
                item.product_name,

            sku:
                item.sku,

            unit_price:
                item.unit_price,

            quantity:
                item.quantity
        }));


    const {
        data: insertedItems,
        error: itemsError
    } = await supabase
        .from("sales_challan_items")
        .insert(challanItems)
        .select();


    if (itemsError) {

        // Cleanup challan if items fail
        await supabase
            .from("sales_challans")
            .delete()
            .eq("id", challan.id);

        throw new Error(
            itemsError.message
        );
    }


    // If user requested CONFIRMED, run the RPC now.
    // The RPC locks rows, checks stock, deducts stock,
    // creates stock_movements, and flips status — all atomically.

    if (status === "CONFIRMED") {

        const {
            data: confirmedData,
            error: confirmError
        } = await supabase.rpc(
            "confirm_sales_challan",
            {
                p_challan_id: challan.id,
                p_user_id:    userId
            }
        );

        if (confirmError) {

            // Rollback: delete challan (items cascade)
            await supabase
                .from("sales_challans")
                .delete()
                .eq("id", challan.id);

            throw new Error(
                confirmError.message
            );
        }

        return {
            ...confirmedData,

            customer,

            products: insertedItems
        };
    }


    return {
        ...challan,

        customer,

        products: insertedItems
    };
};



// GET ALL CHALLANS


const getChallans = async ({
    search,
    status,
    page = 1,
    limit = 10
}) => {

    const offset =
        (page - 1) * limit;


    let query = supabase
        .from("sales_challans")
        .select(`
            *,
            customers (
                id,
                name,
                business_name
            )
        `, {
            count: "exact"
        });



    // Status filter


    if (status) {

        query = query.eq(
            "status",
            status
        );
    }



    // Search challan number


    if (search) {

        query = query.ilike(
            "challan_number",
            `%${search}%`
        );
    }


    query = query
        .order(
            "created_at",
            {
                ascending: false
            }
        )
        .range(
            offset,
            offset + limit - 1
        );


    const {
        data,
        error,
        count
    } = await query;


    if (error) {

        throw new Error(
            error.message
        );
    }


    return {

        challans: data,

        pagination: {

            page,

            limit,

            total: count,

            totalPages:
                Math.ceil(
                    count / limit
                )
        }
    };
};



// GET CHALLAN BY ID


const getChallanById = async (
    challanId
) => {

    const {
        data,
        error
    } = await supabase
        .from("sales_challans")
        .select(`
            *,
            customers (
                id,
                name,
                mobile,
                email,
                business_name,
                gst_number,
                address
            ),
            sales_challan_items (
                id,
                product_id,
                product_name,
                sku,
                unit_price,
                quantity
            )
        `)
        .eq("id", challanId)
        .single();


    if (error || !data) {

        throw new Error(
            "Challan not found"
        );
    }


    return data;
};



// CONFIRM CHALLAN


const confirmChallan = async (
    challanId,
    userId
) => {

    /*
     * IMPORTANT:
     *
     * Stock checking
     * Stock updating
     * Stock movement creation
     * Challan confirmation
     *
     * are handled inside one PostgreSQL
     * RPC transaction.
     */

    const {
        data,
        error
    } = await supabase.rpc(
        "confirm_sales_challan",
        {
            p_challan_id:
                challanId,

            p_user_id:
                userId
        }
    );


    if (error) {

        throw new Error(
            error.message
        );
    }


    return data;
};



// CANCEL CHALLAN


const cancelChallan = async (
    challanId,
    reason
) => {


    // Get current challan


    const {
        data: challan,
        error: challanError
    } = await supabase
        .from("sales_challans")
        .select("*")
        .eq("id", challanId)
        .single();


    if (
        challanError ||
        !challan
    ) {

        throw new Error(
            "Challan not found"
        );
    }



    // Do not cancel confirmed challans


    if (
        challan.status === "CONFIRMED"
    ) {

        throw new Error(
            "Confirmed challan cannot be cancelled"
        );
    }


    if (
        challan.status === "CANCELLED"
    ) {

        throw new Error(
            "Challan is already cancelled"
        );
    }



    // Update status


    const {
        data,
        error
    } = await supabase
        .from("sales_challans")
        .update({
            status: "CANCELLED",
            updated_at:
                new Date().toISOString()
        })
        .eq("id", challanId)
        .select()
        .single();


    if (error) {

        throw new Error(
            error.message
        );
    }


    return {
        ...data,
        cancellation_reason:
            reason
    };
};


module.exports = {

    createChallan,

    getChallans,

    getChallanById,

    confirmChallan,

    cancelChallan

};