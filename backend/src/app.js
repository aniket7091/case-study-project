const express = require("express");
const supabase = require("./config/database");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check — also verifies Supabase connectivity
app.get("/health", async (req, res) => {
  try {
    // Use a raw SQL ping — works on any Supabase project regardless of schema
    const { data, error } = await supabase.rpc("get_service_status").maybeSingle();

    // If RPC doesn't exist, fall back: any non-network error still proves connectivity

    if (error && (error.code === "PGRST202" || error.message?.includes("Could not find"))) {
      // RPC not defined — but the round-trip worked, connection is alive

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

// Export app (routes will be added here)
module.exports = app;
