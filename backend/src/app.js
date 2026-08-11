const express = require("express");
const cors = require("cors");
const { supabase } = require("./config/database");
const customerRoutes = require("./routes/customer.routes");
const productRoutes = require("./routes/product.routes");
const challanRoutes = require("./routes/challan.routes");
const userRoutes = require("./routes/user.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();

// CORS — allow all origins (update with specific URLs in production)
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:4173",
  "https://case-study-backend-3cb3.onrender.com",
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    // OR any origin during development
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // In production you can reject unknown origins
      // For now allow all to support phone/local-network access
      callback(null, true);
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

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
app.use("/api/users", userRoutes);       // Admin user management
app.use("/api/admin", adminRoutes);      // Admin dashboard
app.use("/api/customers", customerRoutes); // Customer CRM Module
app.use("/api/products", productRoutes); // Product & Inventory
app.use("/api/challans", challanRoutes); // Challan module


// 404 Fallback
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found.` });
});

module.exports = app;
