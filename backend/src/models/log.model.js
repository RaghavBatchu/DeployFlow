const pool = require("../db/postgres");

const addLog = async (user_name, role, action) => {
    const result = await pool.query(
        "INSERT INTO logs (user_name, role, action) VALUES ($1, $2, $3) RETURNING *",
        [user_name, role, action]
    );
    return result.rows[0];
};

const getRecentLogs = async (limit = 50) => {
    const result = await pool.query(
        "SELECT * FROM logs ORDER BY timestamp DESC LIMIT $1",
        [limit]
    );
    return result.rows;
};

const clearLogs = async () => {
    await pool.query("DELETE FROM logs");
}

module.exports = {
    addLog,
    getRecentLogs,
    clearLogs
};
