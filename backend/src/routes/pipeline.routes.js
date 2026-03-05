const express = require("express");
const router = express.Router();
const { getPipeline, performAction, resetPipeline } = require("../controllers/pipeline.controller");
const { verifyToken } = require("../middleware/auth.middleware");

router.get("/", getPipeline);

// Protected routes requiring JWT authentication
router.post("/action", verifyToken, performAction);
router.post("/reset", verifyToken, resetPipeline);

module.exports = router;
