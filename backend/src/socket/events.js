/**
 * socket/events.js
 * Registers Socket.io connection/disconnection events.
 * Handles real-time user presence and pipeline updates.
 */

const { getLatestPipeline, getPipelineById } = require("../models/pipeline.model");
const { getLogsByPipelineId } = require("../models/log.model");
const pool = require("../db/postgres");

// Track connected users in-memory: { socketId -> { name, role, id } }
const onlineUsers = {};

/** Enrich pipeline with user names (simple version for socket - avoid circular deps) */
const enrichPipeline = async (row) => {
  if (!row) return null;
  const userIds = [row.developer_id, row.qa_id, row.devops_id, row.manager_id].filter(Boolean);
  if (userIds.length === 0) return row;
  const result = await pool.query(
    "SELECT id, name FROM users WHERE id = ANY($1)",
    [userIds]
  );
  const byId = Object.fromEntries(result.rows.map((r) => [r.id, r.name]));
  return {
    ...row,
    developer_name: byId[row.developer_id] ?? null,
    qa_name: byId[row.qa_id] ?? null,
    devops_name: byId[row.devops_id] ?? null,
    manager_name: byId[row.manager_id] ?? null,
    build_user: byId[row.developer_id] ?? null,
    test_user: byId[row.qa_id] ?? null,
    deploy_user: byId[row.devops_id] ?? null,
    release_user: byId[row.manager_id] ?? null,
  };
};

const registerSocketEvents = (io) => {
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("user_join", ({ name, role, id }) => {
      onlineUsers[socket.id] = { name, role, id };
      io.emit("users_updated", Object.values(onlineUsers));
    });

    socket.on("refresh_pipeline", async (data) => {
      try {
        const pipelineId = data?.pipelineId ? parseInt(data.pipelineId, 10) : null;
        const row = pipelineId
          ? await getPipelineById(pipelineId)
          : await getLatestPipeline();
        const pipeline = await enrichPipeline(row);
        socket.emit("pipeline_updated", pipeline);
      } catch (error) {
        console.error("Error refreshing pipeline:", error);
        socket.emit("error", { message: "Failed to refresh pipeline" });
      }
    });

    socket.on("get_logs", async (data) => {
      try {
        const pipelineId = data?.pipelineId ? parseInt(data.pipelineId, 10) : null;
        let logs;
        if (pipelineId) {
          logs = await getLogsByPipelineId(pipelineId, 50);
        } else {
          const row = await getLatestPipeline();
          logs = row ? await getLogsByPipelineId(row.id, 50) : [];
        }
        socket.emit("logs_updated", logs);
      } catch (error) {
        console.error("Error fetching logs:", error);
        socket.emit("error", { message: "Failed to fetch logs" });
      }
    });

    socket.on("disconnect", () => {
      if (onlineUsers[socket.id]) {
        delete onlineUsers[socket.id];
        io.emit("users_updated", Object.values(onlineUsers));
      }
    });
  });
};

module.exports = { registerSocketEvents };
