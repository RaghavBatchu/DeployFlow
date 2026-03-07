const pool = require("../db/postgres");

const getPipelineById = async (id) => {
  const result = await pool.query("SELECT * FROM pipeline WHERE id = $1", [id]);
  return result.rows[0];
};

const getLatestPipeline = async () => {
  const result = await pool.query(
    "SELECT * FROM pipeline ORDER BY id DESC LIMIT 1"
  );
  return result.rows[0];
};

const getPipelines = async (limit = 50) => {
  const result = await pool.query(
    "SELECT * FROM pipeline ORDER BY id DESC LIMIT $1",
    [limit]
  );
  return result.rows;
};

const createPipeline = async (
  developerId,
  qaId,
  devopsId,
  managerId,
  projectName = "DeployFlow"
) => {
  const result = await pool.query(
    `INSERT INTO pipeline (developer_id, qa_id, devops_id, manager_id, project_name, build_status, test_status, deploy_status, release_status)
     VALUES ($1, $2, $3, $4, $5, 'pending', 'locked', 'locked', 'locked')
     RETURNING *`,
    [developerId, qaId, devopsId, managerId, projectName]
  );
  return result.rows[0];
};

const updatePipelineStage = async (pipelineId, stageColumn, status) => {
  const safeColumns = [
    "build_status",
    "test_status",
    "deploy_status",
    "release_status",
  ];
  if (!safeColumns.includes(stageColumn)) {
    throw new Error("Invalid stage column");
  }
  const result = await pool.query(
    `UPDATE pipeline SET ${stageColumn} = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [status, pipelineId]
  );
  return result.rows[0];
};

const unlockNextStage = async (pipelineId, nextStageColumn) => {
  const safeColumns = [
    "build_status",
    "test_status",
    "deploy_status",
    "release_status",
  ];
  if (!safeColumns.includes(nextStageColumn)) return null;
  const result = await pool.query(
    `UPDATE pipeline SET ${nextStageColumn} = 'pending', updated_at = NOW() WHERE id = $1 RETURNING *`,
    [pipelineId]
  );
  return result.rows[0];
};

module.exports = {
  getPipelineById,
  getLatestPipeline,
  getPipelines,
  createPipeline,
  updatePipelineStage,
  unlockNextStage,
};
