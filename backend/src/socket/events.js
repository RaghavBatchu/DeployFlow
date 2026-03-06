/**
 * socket/events.js
 * Registers Socket.io connection/disconnection events.
 * Handles real-time user presence tracking (user_online / user_offline).
 */

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
            io.emit("user_online", Object.values(onlineUsers));
        });

        socket.on("disconnect", () => {
            const user = onlineUsers[socket.id];
            if (user) {
                console.log(`User left: ${user.name} (${user.role})`);
                delete onlineUsers[socket.id];
            }

            // Broadcast updated online list after someone leaves
            io.emit("user_offline", Object.values(onlineUsers));
        });
    });
};

module.exports = { registerSocketEvents };
