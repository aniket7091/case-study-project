const { supabase } = require("../config/database");


// CREATE PRODUCT

const createProduct = async (productData, userId) => {

    const {
        name,
        sku,
        category,
        unit_price,
        current_stock = 0,
        minimum_stock = 0,
        warehouse_location
    } = productData;

    const { data, error } = await supabase
        .from("products")
        .insert({
            name: name.trim(),
            sku: sku.trim().toUpperCase(),
            category: category.trim(),
            unit_price: Number(unit_price),
            current_stock: Number(current_stock),
            minimum_stock: Number(minimum_stock),
            warehouse_location:
                warehouse_location || null,
            created_by: userId
        })
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// GET ALL PRODUCTS

const getProducts = async ({
    search,
    category,
    low_stock,
    page = 1,
    limit = 10
}) => {

    const offset = (page - 1) * limit;

    let query = supabase
        .from("products")
        .select("*", { count: "exact" });

    // Search
    if (search) {
        query = query.or(
            `name.ilike.%${search}%,sku.ilike.%${search}%,category.ilike.%${search}%`
        );
    }

    // Category filter
    if (category) {
        query = query.eq("category", category);
    }

    // Low stock filter
    if (low_stock === "true") {
        query = query.filter(
            "current_stock",
            "lte",
            "minimum_stock"
        );
    }

    query = query
        .order("created_at", {
            ascending: false
        })
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
        throw new Error(error.message);
    }

    return {
        products: data,
        pagination: {
            page,
            limit,
            total: count,
            totalPages: Math.ceil(
                count / limit
            )
        }
    };
};


// GET PRODUCT BY ID

const getProductById = async (productId) => {

    const {
        data,
        error
    } = await supabase
        .from("products")
        .select(`
            *,
            stock_movements (
                id,
                quantity,
                movement_type,
                reason,
                created_by,
                created_at
            )
        `)
        .eq("id", productId)
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// UPDATE PRODUCT

const updateProduct = async (
    productId,
    productData
) => {

    const {
        name,
        sku,
        category,
        unit_price,
        minimum_stock,
        warehouse_location
    } = productData;

    const updateData = {
        name: name.trim(),
        sku: sku.trim().toUpperCase(),
        category: category.trim(),
        unit_price: Number(unit_price),
        minimum_stock: Number(minimum_stock),
        warehouse_location:
            warehouse_location || null,
        updated_at: new Date().toISOString()
    };

    const {
        data,
        error
    } = await supabase
        .from("products")
        .update(updateData)
        .eq("id", productId)
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ADD STOCK MOVEMENT

const addStockMovement = async (
    productId,
    movementData,
    userId
) => {

    const {
        quantity,
        movement_type,
        reason
    } = movementData;

    const quantityNumber = Number(quantity);

    // Get current product

    const {
        data: product,
        error: productError
    } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

    if (productError || !product) {
        throw new Error("Product not found");
    }


    // Calculate new stock

    let newStock;

    if (movement_type === "IN") {

        newStock =
            product.current_stock +
            quantityNumber;

    } else {

        newStock =
            product.current_stock -
            quantityNumber;

        // Stock cannot become negative
        if (newStock < 0) {
            throw new Error(
                `Insufficient stock. Available stock: ${product.current_stock}`
            );
        }
    }


    // Update product stock
    const {
        data: updatedProduct,
        error: updateError
    } = await supabase
        .from("products")
        .update({
            current_stock: newStock,
            updated_at: new Date().toISOString()
        })
        .eq("id", productId)
        .select()
        .single();

    if (updateError) {
        throw new Error(updateError.message);
    }


    // Create stock movement log
    const {
        data: movement,
        error: movementError
    } = await supabase
        .from("stock_movements")
        .insert({
            product_id: productId,
            quantity: quantityNumber,
            movement_type,
            reason: reason.trim(),
            created_by: userId
        })
        .select()
        .single();


    if (movementError) {

        // Rollback stock manually if movement
        // insertion fails
        await supabase
            .from("products")
            .update({
                current_stock:
                    product.current_stock
            })
            .eq("id", productId);

        throw new Error(
            movementError.message
        );
    }


    return {
        product: updatedProduct,
        movement
    };
};

// GET STOCK MOVEMENTS
const getStockMovements = async (
    productId,
    {
        movement_type,
        page = 1,
        limit = 20
    }
) => {

    const offset =
        (page - 1) * limit;

    let query = supabase
        .from("stock_movements")
        .select("*", {
            count: "exact"
        })
        .eq("product_id", productId);

    if (movement_type) {
        query = query.eq(
            "movement_type",
            movement_type
        );
    }

    query = query
        .order("created_at", {
            ascending: false
        })
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
        throw new Error(error.message);
    }

    return {
        movements: data,
        pagination: {
            page,
            limit,
            total: count,
            totalPages: Math.ceil(
                count / limit
            )
        }
    };
};


module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    addStockMovement,
    getStockMovements
};