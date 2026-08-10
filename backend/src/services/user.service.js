const { supabase } = require("../config/database");
const bcrypt = require("bcrypt");

const SALT_ROUNDS = 12;

// CREATE USER
const createUser = async (userData) => {
    const { name, email, password, role } = userData;

    // Check if email already exists
    const { data: existing, error: findErr } = await supabase
        .from("users")
        .select("id")
        .eq("email", email.toLowerCase())
        .maybeSingle();

    if (findErr) throw new Error(findErr.message);
    if (existing) {
        const error = new Error("Email already registered");
        error.statusCode = 409;
        throw error;
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
        .select("id, name, email, role, is_active, last_login_at, created_at, updated_at")
        .single();

    if (insertErr) throw new Error(insertErr.message);

    return newUser;
};

// GET ALL USERS
const getUsers = async () => {
    const { data, error } = await supabase
        .from("users")
        .select("id, name, email, role, is_active, last_login_at, created_at, updated_at")
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    return data;
};

// GET USER BY ID
const getUserById = async (userId) => {
    const { data, error } = await supabase
        .from("users")
        .select("id, name, email, role, is_active, last_login_at, created_at, updated_at")
        .eq("id", userId)
        .single();

    if (error || !data) {
        const err = new Error("User not found");
        err.statusCode = 404;
        throw err;
    }

    return data;
};

// UPDATE USER ROLE
const updateUserRole = async (userId, role) => {
    // Check if user exists first
    const { data: user, error: findErr } = await supabase
        .from("users")
        .select("id")
        .eq("id", userId)
        .maybeSingle();

    if (findErr) throw new Error(findErr.message);
    if (!user) {
        const err = new Error("User not found");
        err.statusCode = 404;
        throw err;
    }

    const { data, error } = await supabase
        .from("users")
        .update({ role: role.toUpperCase(), updated_at: new Date().toISOString() })
        .eq("id", userId)
        .select("id, name, email, role, is_active, last_login_at, created_at, updated_at")
        .single();

    if (error) throw new Error(error.message);

    return data;
};

// UPDATE USER STATUS (Activate / Deactivate)
const updateUserStatus = async (userId, is_active) => {
    // Check if user exists and get their role/status
    const { data: targetUser, error: findErr } = await supabase
        .from("users")
        .select("id, role, is_active")
        .eq("id", userId)
        .maybeSingle();

    if (findErr) throw new Error(findErr.message);
    if (!targetUser) {
        const err = new Error("User not found");
        err.statusCode = 404;
        throw err;
    }

    // Prevent deactivating the last active ADMIN
    if (is_active === false && targetUser.role === "ADMIN" && targetUser.is_active === true) {
        const { count, error: countErr } = await supabase
            .from("users")
            .select("*", { count: "exact", head: true })
            .eq("role", "ADMIN")
            .eq("is_active", true);
        
        if (countErr) throw new Error(countErr.message);
        
        if (count <= 1) {
            const err = new Error("Cannot deactivate the last active ADMIN account.");
            err.statusCode = 400;
            throw err;
        }
    }

    const { data, error } = await supabase
        .from("users")
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq("id", userId)
        .select("id, name, email, role, is_active, last_login_at, created_at, updated_at")
        .single();

    if (error) throw new Error(error.message);

    return data;
};

module.exports = {
    createUser,
    getUsers,
    getUserById,
    updateUserRole,
    updateUserStatus
};
