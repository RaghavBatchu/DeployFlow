const { getRecentLogs, getLogsByPipelineId } = require("../models/log.model");

const getLogs = async (req, res) => {
  try {
    const pipelineId = req.query.pipelineId
      ? parseInt(req.query.pipelineId, 10)
      : null;
    const logs = pipelineId
      ? await getLogsByPipelineId(pipelineId, 50)
      : await getRecentLogs(50);
    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch logs" });
  }
};

module.exports = {
  getLogs,
};
