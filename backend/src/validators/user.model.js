/**
 * Mirrors the Supabase `users` table schema.
 * Role CHECK constraint: ADMIN | SALES | WAREHOUSE | ACCOUNTS
 */
const userFields = {
  id: null,               // UUID, PK, auto-generated
  name: "",              // VARCHAR(100)
  email: "",             // VARCHAR(255), UNIQUE
  password_hash: "",     // TEXT
  role: "SALES",         // ADMIN | SALES | WAREHOUSE | ACCOUNTS
  is_active: true,       // BOOLEAN, default TRUE
  last_login_at: null,   // TIMESTAMPTZ
  created_at: null,      // TIMESTAMPTZ, default NOW()
  updated_at: null,      // TIMESTAMPTZ, default NOW()
};

module.exports = userFields;