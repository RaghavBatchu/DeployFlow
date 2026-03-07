/**
 * socket/events.js
 * Registers Socket.io connection/disconnection events.
 * Handles real-time user presence tracking and pipeline events.
 */

const pool = require("../db/postgres");

// Track connected users in-memory: { socketId -> { name, role } }
const onlineUsers = {};

const registerSocketEvents = (io) => {
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Frontend must emit "user_join" with { name, role } right after connecting
    socket.on("user_join", ({ name, role }) => {
      onlineUsers[socket.id] = { name, role };
      console.log(`User joined: ${name} (${role})`);

      // Broadcast to everyone (including sender) the updated online list
      io.emit("users_updated", Object.values(onlineUsers));
    });

    // Pipeline stage actions
    socket.on("start_stage", async (data) => {
      try {
        const { stage } = data;
        const user = onlineUsers[socket.id];

        if (!user) {
          socket.emit("error", { message: "User not authenticated" });
          return;
        }

        // Update pipeline stage status
        const updateQuery = `
                    UPDATE pipeline 
                    SET ${stage}_status = 'in-progress', ${stage}_user = $1, updated_at = NOW()
                    RETURNING *
                `;

        const result = await pool.query(updateQuery, [user.name]);

        // Create log entry
        await pool.query(
          "INSERT INTO logs (user_name, role, action) VALUES ($1, $2, $3)",
          [user.name, user.role, `Started ${stage} stage`],
        );

        // Broadcast updated pipeline
        const pipeline = await pool.query(
          "SELECT * FROM pipeline ORDER BY id DESC LIMIT 1",
        );
        io.emit("pipeline_updated", pipeline.rows[0]);

        // Broadcast updated logs
        const logs = await pool.query(
          "SELECT * FROM logs ORDER BY timestamp DESC LIMIT 50",
        );
        io.emit("logs_updated", logs.rows);

        socket.emit("stage_started", { stage, success: true });
      } catch (error) {
        console.error("Error starting stage:", error);
        socket.emit("error", { message: "Failed to start stage" });
      }
    });

    // General pipeline actions
    socket.on("pipeline_action", async (data) => {
      try {
        const { action, message } = data;
        const user = onlineUsers[socket.id];

        if (!user) {
          socket.emit("error", { message: "User not authenticated" });
          return;
        }

        // Create log entry for the action
        await pool.query(
          "INSERT INTO logs (user_name, role, action) VALUES ($1, $2, $3)",
          [user.name, user.role, message || `Executed ${action}`],
        );

        // Handle specific actions
        switch (action) {
          case "reset_pipeline":
            await pool.query(
              "UPDATE pipeline SET build_status = 'locked', test_status = 'locked', deploy_status = 'locked', release_status = 'locked', updated_at = NOW()",
            );
            break;
          case "emergency_stop":
            await pool.query(
              "UPDATE pipeline SET build_status = 'locked', test_status = 'locked', deploy_status = 'locked', release_status = 'locked', updated_at = NOW()",
            );
            break;
          // Add more action handlers as needed
        }

        // Broadcast updated state
        const pipeline = await pool.query(
          "SELECT * FROM pipeline ORDER BY id DESC LIMIT 1",
        );
        io.emit("pipeline_updated", pipeline.rows[0]);

        const logs = await pool.query(
          "SELECT * FROM logs ORDER BY timestamp DESC LIMIT 50",
        );
        io.emit("logs_updated", logs.rows);

        socket.emit("action_completed", { action, success: true });
      } catch (error) {
        console.error("Error executing pipeline action:", error);
        socket.emit("error", { message: "Failed to execute action" });
      }
    });

    // Refresh pipeline data
    socket.on("refresh_pipeline", async () => {
      try {
        const pipeline = await pool.query(
          "SELECT * FROM pipeline ORDER BY id DESC LIMIT 1",
        );
        io.emit("pipeline_updated", pipeline.rows[0]);
      } catch (error) {
        console.error("Error refreshing pipeline:", error);
        socket.emit("error", { message: "Failed to refresh pipeline" });
      }
    });

    // Get logs
    socket.on("get_logs", async () => {
      try {
        const logs = await pool.query(
          "SELECT * FROM logs ORDER BY timestamp DESC LIMIT 50",
        );
        socket.emit("logs_updated", logs.rows);
      } catch (error) {
        console.error("Error fetching logs:", error);
        socket.emit("error", { message: "Failed to fetch logs" });
      }
    });

    socket.on("disconnect", () => {
      const user = onlineUsers[socket.id];
      if (user) {
        console.log(`User left: ${user.name} (${user.role})`);
        delete onlineUsers[socket.id];
      }

      // Broadcast updated online list after someone leaves
      io.emit("users_updated", Object.values(onlineUsers));
    });
  });
};

module.exports = { registerSocketEvents };
