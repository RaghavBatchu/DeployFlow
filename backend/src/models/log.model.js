const pool = require("../db/postgres");

const addLog = async (pipelineId, userId, role, action, comment = null) => {
  const result = await pool.query(
    "INSERT INTO logs (pipeline_id, user_id, role, action, comment) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [pipelineId, userId, role, action, comment]
  );
  return result.rows[0];
};

const getLogsByPipelineId = async (pipelineId, limit = 50) => {
  const result = await pool.query(
    `SELECT l.*, u.name AS user_name FROM logs l
     LEFT JOIN users u ON u.id = l.user_id
     WHERE l.pipeline_id = $1
     ORDER BY l.timestamp DESC
     LIMIT $2`,
    [pipelineId, limit]
  );
  return result.rows;
};

const getRecentLogs = async (limit = 50) => {
  const result = await pool.query(
    `SELECT l.*, u.name AS user_name FROM logs l
     LEFT JOIN users u ON u.id = l.user_id
     ORDER BY l.timestamp DESC
     LIMIT $1`,
    [limit]
  );
  return result.rows;
};

const clearLogsForPipeline = async (pipelineId) => {
  await pool.query("DELETE FROM logs WHERE pipeline_id = $1", [pipelineId]);
};

module.exports = {
  addLog,
  getLogsByPipelineId,
  getRecentLogs,
  clearLogsForPipeline,
};
