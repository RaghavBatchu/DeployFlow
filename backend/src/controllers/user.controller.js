const {
  getUsers,
  getUserByEmail,
  getUserByName,
  createUser,
  updateUserRole,
} = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const getAllUsers = async (req, res) => {
  try {
    const users = await getUsers();
    // Don't send password hashes to the frontend
    const safeUsers = users.map((u) => ({
      id: u.id,
      name: u.name,
      role: u.role,
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

  // Basic email validation
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
      hashedPassword,
      role,
    );

    // Generate JWT
    const token = jwt.sign(
      {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    io.emit("users_updated");
    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Failed to register user" });
  }
};

const loginUser = async (req, res) => {
  const { email, password, role_override } = req.body;
  const io = req.app.get("socketio");

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  try {
    let user = await getUserByEmail(email.trim());
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // If the user wants to switch roles upon logging in
    if (role_override && role_override !== user.role) {
      user = await updateUserRole(user.id, role_override);
      io.emit("users_updated");
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.status(200).json({
      message: "Logged in successfully",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
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
