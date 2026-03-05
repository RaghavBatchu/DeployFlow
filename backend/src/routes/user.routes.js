const express = require("express");
const router = express.Router();
const { getAllUsers, loginUser, registerUser } = require("../controllers/user.controller");

router.get("/", getAllUsers);
router.post("/register", registerUser);
router.post("/login", loginUser);

module.exports = router;
