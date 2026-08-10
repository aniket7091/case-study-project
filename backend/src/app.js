const express = require("express");
const { supabase } = require("./config/database");
const customerRoutes = require("./routes/customer.routes");
const productRoutes = require("./routes/product.routes");
const challanRoutes = require("./routes/challan.routes");

const app = express();

// Core Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check — also verifies Supabase connectivity
app.get("/health", async (req, res) => {
  try {
    const { data, error } = await supabase.rpc("get_service_status").maybeSingle();

    if (error && (error.code === "PGRST202" || error.message?.includes("Could not find"))) {
      return res.json({
        success: true,
        message: "Backend is running",
        database: "Supabase connected",
      });
    }

    if (error) throw error;

    res.json({
      success: true,
      message: "Backend is running",
      database: "Supabase connected",
      status: data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Backend is running but Supabase connection failed",
      error: err.message,
    });
  }
});

//API Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/customers", customerRoutes); // for the customer CRM Module
app.use("/api/products", productRoutes); // Product & Inventory
app.use("/api/challans", challanRoutes); //for challan module


// 404 Fallback
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found.` });
});

module.exports = app;
