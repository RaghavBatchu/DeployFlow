const pool = require("../db/postgres");

const getUsers = async () => {
  const result = await pool.query(
    "SELECT u.*, r.role_name AS role FROM users u " +
    "LEFT JOIN user_roles ur ON ur.user_id = u.id " +
    "LEFT JOIN roles r ON r.id = ur.role_id " +
    "ORDER BY u.created_at ASC"
  );
  // Group by user so multiple roles become array; for API we return first role per user for backward compat
  const byId = {};
  result.rows.forEach((row) => {
    if (!byId[row.id]) {
      byId[row.id] = {
        id: row.id,
        name: row.name,
        email: row.email,
        created_at: row.created_at,
        roles: [],
      };
    }
    if (row.role) byId[row.id].roles.push(row.role);
  });
  return Object.values(byId).map((u) => ({
    ...u,
    role: u.roles[0] || null,
  }));
};

const getUserByEmail = async (email) => {
  const result = await pool.query(
    "SELECT * FROM users WHERE LOWER(email) = LOWER($1)",
    [email]
  );
  return result.rows[0];
};

const getUserById = async (id) => {
  const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  return result.rows[0];
};

const getUserByName = async (name) => {
  const result = await pool.query(
    "SELECT * FROM users WHERE LOWER(name) = LOWER($1)",
    [name]
  );
  return result.rows[0];
};

const createUser = async (name, email, password_hash) => {
  const result = await pool.query(
    "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *",
    [name, email, password_hash]
  );
  return result.rows[0];
};

module.exports = {
  getUsers,
  getUserByEmail,
  getUserById,
  getUserByName,
  createUser,
};
