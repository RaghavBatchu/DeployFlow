const express = require("express");
const cors = require("cors");
const path = require("path");
// Ensure it resolves to the root DeploymentFlow/.env
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const http = require("http");
const { Server } = require("socket.io");

const pool = require("./db/postgres");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Make `io` accessible within our Express routes / controllers
app.set("socketio", io);

// Register Socket.io connection/presence events
const { registerSocketEvents } = require("./socket/events");
registerSocketEvents(io);

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/pipeline", require("./routes/pipeline.routes"));
app.use("/api/logs", require("./routes/log.routes"));
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/auth", require("./routes/auth.routes"));

const promClient = require("prom-client");

// Collect default Node.js metrics (CPU, RAM, Event Loop)
const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics({ prefix: 'deployflow_' });

app.get("/", (req, res) => {
  res.send("DeployFlow API running");
});

// Prometheus metrics endpoint
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", promClient.register.contentType);
  res.send(await promClient.register.metrics());
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
