const { supabase } = require("../config/database");

// Reusable function to get exact count from a table with simple eq/boolean filters
const getCount = async (table, filters = {}) => {
    let query = supabase.from(table).select("*", { count: "exact", head: true });

    for (const [key, value] of Object.entries(filters)) {
        query = query.eq(key, value);
    }

    const { count, error } = await query;
    if (error) throw new Error(error.message);

    return count || 0;
};

// Special: count products where current_stock <= minimum_stock (column-to-column)
const getLowStockCount = async () => {
    const { data, error } = await supabase
        .from("products")
        .select("current_stock, minimum_stock");

    if (error) throw new Error(error.message);

    return (data || []).filter(
        (p) => p.current_stock <= p.minimum_stock
    ).length;
};

const getDashboardStats = async () => {
    try {
        const [
            usersTotal, usersActive,
            customersTotal, customersActive, customersLeads, customersInactive,
            productsTotal, productsLowStock,
            challansTotal, challansDraft, challansConfirmed, challansCancelled
        ] = await Promise.all([
            // Users
            getCount("users"),
            getCount("users", { is_active: true }),

            // Customers
            getCount("customers"),
            getCount("customers", { status: "ACTIVE" }),
            getCount("customers", { status: "LEAD" }),
            getCount("customers", { status: "INACTIVE" }),

            // Products
            getCount("products"),
            getLowStockCount(),

            // Challans
            getCount("sales_challans"),
            getCount("sales_challans", { status: "DRAFT" }),
            getCount("sales_challans", { status: "CONFIRMED" }),
            getCount("sales_challans", { status: "CANCELLED" }),
        ]);

        return {
            users: {
                total: usersTotal,
                active: usersActive
            },
            customers: {
                total: customersTotal,
                active: customersActive,
                leads: customersLeads,
                inactive: customersInactive
            },
            products: {
                total: productsTotal,
                low_stock: productsLowStock
            },
            challans: {
                total: challansTotal,
                draft: challansDraft,
                confirmed: challansConfirmed,
                cancelled: challansCancelled
            }
        };
    } catch (error) {
        throw new Error(`Failed to fetch dashboard statistics: ${error.message}`);
    }
};

module.exports = {
    getDashboardStats
};
