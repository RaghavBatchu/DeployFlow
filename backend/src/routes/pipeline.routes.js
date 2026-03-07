const express = require("express");
const router = express.Router();
const {
  getPipeline,
  getPipelineList,
  createNewPipeline,
  performAction,
} = require("../controllers/pipeline.controller");
const { verifyToken } = require("../middleware/auth.middleware");

router.get("/", getPipeline);
router.get("/list", getPipelineList);
router.post("/", verifyToken, createNewPipeline);
router.post("/action", verifyToken, performAction);

module.exports = router;
