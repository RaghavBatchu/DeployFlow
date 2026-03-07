const {
  getUsers,
  getUserByEmail,
  createUser,
} = require("../models/user.model");
const {
  getRoleIdByName,
  getPrimaryRoleForUser,
  assignUserRole,
} = require("../models/role.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const getAllUsers = async (req, res) => {
  try {
    const users = await getUsers();
    const safeUsers = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      roles: u.roles,
      created_at: u.created_at,
    }));
    res.json(safeUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  const io = req.app.get("socketio");

  if (
    !name ||
    name.trim() === "" ||
    !email ||
    email.trim() === "" ||
    !password ||
    !role
  ) {
    return res
      .status(400)
      .json({ message: "Name, email, password, and role are required." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return res
      .status(400)
      .json({ message: "Please include a valid email address." });
  }

  try {
    let user = await getUserByEmail(email.trim());
    if (user) {
      return res.status(400).json({
        message: "User with this email already exists. Please login instead.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await createUser(
      name.trim(),
      email.trim(),
      hashedPassword
    );

    const roleId = await getRoleIdByName(role);
    if (roleId) {
      await assignUserRole(newUser.id, roleId);
    }

    const primaryRole = await getPrimaryRoleForUser(newUser.id);

    const token = jwt.sign(
      {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: primaryRole,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    if (io) io.emit("users_updated");
    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: primaryRole,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Failed to register user" });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const io = req.app.get("socketio");

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  try {
    const user = await getUserByEmail(email.trim());
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const primaryRole = await getPrimaryRoleForUser(user.id);

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: primaryRole,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      message: "Logged in successfully",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: primaryRole,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Failed to login" });
  }
};

module.exports = {
  getAllUsers,
  registerUser,
  loginUser,
};
