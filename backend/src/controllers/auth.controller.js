const { supabase } = require("../config/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendSuccess, sendError } = require("../utils/response");

const SALT_ROUNDS = 12;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// ─── Helper: generate JWT ─────────────────────────────────────────────────────
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// ─── REGISTER ─────────────────────────────────────────────────────────────────
/**
 * POST /api/auth/register
 * Body: { name, email, password, role? }
 */
const register = async (req, res) => {
  try {
    const { name, email, password, role = "SALES" } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return sendError(res, 400, "Name, email, and password are required.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendError(res, 400, "Invalid email format.");
    }

    if (password.length < 6) {
      return sendError(res, 400, "Password must be at least 6 characters.");
    }

    const allowedRoles = ["ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"];
    if (!allowedRoles.includes(role.toUpperCase())) {
      return sendError(res, 400, `Role must be one of: ${allowedRoles.join(", ")}`);
    }

    // Check if email already exists
    const { data: existing, error: findErr } = await supabase
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (findErr) throw findErr;

    if (existing) {
      return sendError(res, 409, "Email already registered.");
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert new user
    const { data: newUser, error: insertErr } = await supabase
      .from("users")
      .insert([
        {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password_hash,
          role: role.toUpperCase(),
          is_active: true,
        },
      ])
      .select("id, name, email, role, is_active, created_at")
      .single();

    if (insertErr) throw insertErr;

    const token = generateToken(newUser);

    return sendSuccess(res, 201, "User registered successfully.", {
      user: newUser,
      token,
    });
  } catch (err) {
    console.error("[register]", err);
    return sendError(res, 500, "Registration failed.", err.message);
  }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
/**
 * POST /api/auth/login
 * Body: { email, password }
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 400, "Email and password are required.");
    }

    // Fetch user by email
    const { data: user, error: findErr } = await supabase
      .from("users")
      .select("id, name, email, password_hash, role, is_active, last_login_at")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    if (findErr) throw findErr;

    if (!user) {
      return sendError(res, 401, "Invalid email or password.");
    }

    if (!user.is_active) {
      return sendError(res, 403, "Account is deactivated. Contact your admin.");
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return sendError(res, 401, "Invalid email or password.");
    }

    // Update last_login_at
    await supabase
      .from("users")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", user.id);

    const token = generateToken(user);

    // Strip sensitive field before sending
    const { password_hash, ...safeUser } = user;

    return sendSuccess(res, 200, "Login successful.", {
      user: safeUser,
      token,
    });
  } catch (err) {
    console.error("[login]", err);
    return sendError(res, 500, "Login failed.", err.message);
  }
};

// ─── GET PROFILE ──────────────────────────────────────────────────────────────
/**
 * GET /api/auth/me
 * Header: Authorization: Bearer <token>
 */
const getProfile = async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("id, name, email, role, is_active, last_login_at, created_at, updated_at")
      .eq("id", req.user.id)
      .maybeSingle();

    if (error) throw error;

    if (!user) {
      return sendError(res, 404, "User not found.");
    }

    return sendSuccess(res, 200, "Profile fetched.", user);
  } catch (err) {
    console.error("[getProfile]", err);
    return sendError(res, 500, "Could not fetch profile.", err.message);
  }
};

// ─── CHANGE PASSWORD ──────────────────────────────────────────────────────────
/**
 * PUT /api/auth/change-password
 * Header: Authorization: Bearer <token>
 * Body: { currentPassword, newPassword }
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return sendError(res, 400, "currentPassword and newPassword are required.");
    }

    if (newPassword.length < 6) {
      return sendError(res, 400, "New password must be at least 6 characters.");
    }

    // Fetch user with hash
    const { data: user, error: findErr } = await supabase
      .from("users")
      .select("id, password_hash")
      .eq("id", req.user.id)
      .maybeSingle();

    if (findErr) throw findErr;
    if (!user) return sendError(res, 404, "User not found.");

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return sendError(res, 401, "Current password is incorrect.");
    }

    const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    const { error: updateErr } = await supabase
      .from("users")
      .update({ password_hash: newHash, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (updateErr) throw updateErr;

    return sendSuccess(res, 200, "Password changed successfully.");
  } catch (err) {
    console.error("[changePassword]", err);
    return sendError(res, 500, "Could not change password.", err.message);
  }
};

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
/**
 * POST /api/auth/logout
 * (JWT is stateless — client must discard token.
 *  This endpoint exists for front-end consistency & future token blacklisting.)
 */
const logout = (req, res) => {
  return sendSuccess(res, 200, "Logged out successfully. Discard your token on the client.");
};

module.exports = { register, login, getProfile, changePassword, logout };
