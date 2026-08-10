const supabase = require("../config/database"); // ← no destructuring, matches module.exports = supabase


// ─── CREATE PRODUCT ───────────────────────────────────────────────────────────

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
            warehouse_location: warehouse_location || null,
            created_by: userId
        })
        .select()
        .single();

    if (error) throw new Error(error.message);

    return data;
};


// ─── GET ALL PRODUCTS ─────────────────────────────────────────────────────────

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

    if (search) {
        query = query.or(
            `name.ilike.%${search}%,sku.ilike.%${search}%,category.ilike.%${search}%`
        );
    }

    if (category) {
        query = query.eq("category", category);
    }

    // low_stock=true → only products where current_stock <= minimum_stock
    if (low_stock === "true") {
        query = query.filter("current_stock", "lte", "minimum_stock");
    }

    query = query
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw new Error(error.message);

    return {
        products: data,
        pagination: {
            page,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit)
        }
    };
};


// ─── GET PRODUCT BY ID ────────────────────────────────────────────────────────

const getProductById = async (productId) => {

    const { data, error } = await supabase
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

    if (error) throw new Error(error.message);

    return data;
};


// ─── UPDATE PRODUCT ───────────────────────────────────────────────────────────
// Note: current_stock is intentionally excluded — stock must be changed via
// stock movements to maintain an audit trail.

const updateProduct = async (productId, productData) => {

    const {
        name,
        sku,
        category,
        unit_price,
        minimum_stock,
        warehouse_location
    } = productData;

    const updateData = {
        updated_at: new Date().toISOString()
    };

    // Only include fields that were actually provided
    if (name !== undefined)               updateData.name               = name.trim();
    if (sku !== undefined)                updateData.sku                = sku.trim().toUpperCase();
    if (category !== undefined)           updateData.category           = category.trim();
    if (unit_price !== undefined)         updateData.unit_price         = Number(unit_price);
    if (minimum_stock !== undefined)      updateData.minimum_stock      = Number(minimum_stock);
    if (warehouse_location !== undefined) updateData.warehouse_location = warehouse_location || null;

    const { data, error } = await supabase
        .from("products")
        .update(updateData)
        .eq("id", productId)
        .select()
        .single();

    if (error) throw new Error(error.message);

    return data;
};


// ─── ADD STOCK MOVEMENT (atomic via PostgreSQL RPC) ──────────────────────────
//
// The entire operation runs inside one PostgreSQL transaction:
//   SELECT ... FOR UPDATE  → locks the row
//   stock validation       → checked inside the DB
//   UPDATE products        → new stock written
//   INSERT stock_movements → audit log written
//   COMMIT                 → lock released
//
// Concurrent requests on the same product queue at the DB lock instead of
// racing past a Node.js read → calculate → write gap.

const addStockMovement = async (productId, movementData, userId) => {

    const { quantity, movement_type, reason } = movementData;

    const { data, error } = await supabase.rpc("add_stock_movement", {
        p_product_id:    productId,
        p_quantity:      Number(quantity),
        p_movement_type: movement_type,
        p_reason:        reason.trim(),
        p_user_id:       userId
    });

    if (error) {
        // Postgres RAISE EXCEPTION messages come through in error.message
        throw new Error(error.message);
    }

    // data is already { product: {...}, movement: {...} }
    return data;
};


// ─── GET STOCK MOVEMENTS ──────────────────────────────────────────────────────

const getStockMovements = async (productId, { movement_type, page = 1, limit = 20 }) => {

    const offset = (page - 1) * limit;

    let query = supabase
        .from("stock_movements")
        .select("*", { count: "exact" })
        .eq("product_id", productId);

    if (movement_type) {
        query = query.eq("movement_type", movement_type);
    }

    query = query
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw new Error(error.message);

    return {
        movements: data,
        pagination: {
            page,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit)
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
