const express = require("express");
const router = express.Router();
const { getPipeline, performAction, resetPipeline } = require("../controllers/pipeline.controller");

router.get("/", getPipeline);
router.post("/action", performAction);
router.post("/reset", resetPipeline);

module.exports = router;
