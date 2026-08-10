const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

// Validate that required env vars are present at startup
if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error(
    "FATAL: SUPABASE_URL and SUPABASE_SECRET_KEY must be set in your .env file"
  );
  process.exit(1);
}

// Server-side client — uses the SECRET key, bypasses RLS.
// NEVER expose this client to the browser / frontend.
const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: {
    // Disable auto token refresh — not needed for a server-side client
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

module.exports = supabase;
