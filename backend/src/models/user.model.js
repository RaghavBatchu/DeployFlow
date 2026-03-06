const pool = require("../db/postgres");

const getUsers = async () => {
  const result = await pool.query(
    "SELECT * FROM users ORDER BY created_at ASC",
  );
  return result.rows;
};

const getUserByEmail = async (email) => {
  const result = await pool.query(
    "SELECT * FROM users WHERE LOWER(email) = LOWER($1)",
    [email],
  );
  return result.rows[0];
};

const getUserByName = async (name) => {
  // Case insensitive exact lookup to avoid Raghav and raghav being two users
  const result = await pool.query(
    "SELECT * FROM users WHERE LOWER(name) = LOWER($1)",
    [name],
  );
  return result.rows[0];
};

const createUser = async (name, email, password_hash, role) => {
  const result = await pool.query(
    "INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING *",
    [name, email, password_hash, role],
  );
  return result.rows[0];
};

const updateUserRole = async (id, role) => {
  const result = await pool.query(
    "UPDATE users SET role = $1 WHERE id = $2 RETURNING *",
    [role, id],
  );
  return result.rows[0];
};

module.exports = {
  getUsers,
  getUserByEmail,
  getUserByName,
  createUser,
  updateUserRole,
};
