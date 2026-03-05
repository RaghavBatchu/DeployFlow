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
        origin: "*"
    }
});

// Make `io` accessible within our Express routes / controllers
app.set("socketio", io);

app.use(cors());
app.use(express.json());

// Routes
// We are only registering the logs route for now!
app.use("/api/logs", require("./routes/log.routes"));

app.get("/", (req, res) => {
    res.send("DeployFlow API running");
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
