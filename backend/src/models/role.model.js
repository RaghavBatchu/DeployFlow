const pool = require("../db/postgres");

const getRoleIdByName = async (roleName) => {
  const result = await pool.query(
    "SELECT id FROM roles WHERE role_name = $1",
    [roleName]
  );
  return result.rows[0]?.id ?? null;
};

const getRoleNameById = async (roleId) => {
  const result = await pool.query(
    "SELECT role_name FROM roles WHERE id = $1",
    [roleId]
  );
  return result.rows[0]?.role_name ?? null;
};

/** Get primary (first) role name for a user from user_roles */
const getPrimaryRoleForUser = async (userId) => {
  const result = await pool.query(
    `SELECT r.role_name FROM user_roles ur
     JOIN roles r ON r.id = ur.role_id
     WHERE ur.user_id = $1
     ORDER BY r.id ASC
     LIMIT 1`,
    [userId]
  );
  return result.rows[0]?.role_name ?? null;
};

/** Get all role names for a user */
const getRolesForUser = async (userId) => {
  const result = await pool.query(
    `SELECT r.role_name FROM user_roles ur
     JOIN roles r ON r.id = ur.role_id
     WHERE ur.user_id = $1
     ORDER BY r.id ASC`,
    [userId]
  );
  return result.rows.map((r) => r.role_name);
};

const assignUserRole = async (userId, roleId) => {
  await pool.query(
    "INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT (user_id, role_id) DO NOTHING",
    [userId, roleId]
  );
};

/** Get one random user id that has the given role (by role_name) */
const getRandomUserByRole = async (roleName) => {
  const result = await pool.query(
    `SELECT u.id FROM users u
     JOIN user_roles ur ON ur.user_id = u.id
     JOIN roles r ON r.id = ur.role_id
     WHERE r.role_name = $1
     ORDER BY RANDOM()
     LIMIT 1`,
    [roleName]
  );
  return result.rows[0]?.id ?? null;
};

module.exports = {
  getRoleIdByName,
  getRoleNameById,
  getPrimaryRoleForUser,
  getRolesForUser,
  assignUserRole,
  getRandomUserByRole,
};
