const { getUsers, getUserByName, createUser, updateUserRole } = require("../models/user.model");

const getAllUsers = async (req, res) => {
    try {
        const users = await getUsers();
        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Failed to fetch users" });
    }
};

const loginUser = async (req, res) => {
    const { name, role } = req.body;
    const io = req.app.get("socketio");

    // Basic validation
    if (!name || name.trim() === "" || !role) {
        return res.status(400).json({ message: "Name and Role are required." });
    }

    try {
        // 1. Check if user already exists
        let user = await getUserByName(name.trim());

        // 2. If no user, create them
        if (!user) {
            user = await createUser(name.trim(), role);
            io.emit("users_updated"); // Tell frontend to refetch users
            return res.status(201).json({ message: "User created and logged in", user });
        }

        // 3. If user exists, but the role submitted is different, update their role
        if (user.role !== role) {
            user = await updateUserRole(user.id, role);
            io.emit("users_updated");
            return res.status(200).json({ message: "Role updated and logged in", user });
        }

        // 4. If they exist & didn't change roles, just "login" successfully
        res.status(200).json({ message: "Logged in", user });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Failed to login or register user" });
    }
}

module.exports = {
    getAllUsers,
    loginUser
};
