const pool = require("../db/postgres");

const getUsers = async () => {
    const result = await pool.query("SELECT * FROM users ORDER BY created_at ASC");
    return result.rows;
};

const getUserByName = async (name) => {
    // Case insensitive exact lookup to avoid Raghav and raghav being two users
    const result = await pool.query("SELECT * FROM users WHERE LOWER(name) = LOWER($1)", [name]);
    return result.rows[0];
};

const createUser = async (name, password_hash, role) => {
    const result = await pool.query(
        "INSERT INTO users (name, password_hash, role) VALUES ($1, $2, $3) RETURNING *",
        [name, password_hash, role]
    );
    return result.rows[0];
};

const updateUserRole = async (id, role) => {
    const result = await pool.query(
        "UPDATE users SET role = $1 WHERE id = $2 RETURNING *",
        [role, id]
    );
    return result.rows[0];
}

module.exports = {
    getUsers,
    getUserByName,
    createUser,
    updateUserRole
};
