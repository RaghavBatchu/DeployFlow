const {
  getPipelineById,
  getLatestPipeline,
  getPipelines,
  createPipeline,
  updatePipelineStage,
  unlockNextStage,
} = require("../models/pipeline.model");
const { addLog, getLogsByPipelineId } = require("../models/log.model");
const { getRolesForUser } = require("../models/role.model");
const { getUserById } = require("../models/user.model");

const STAGE_CONFIG = {
  build: {
    requiredRole: "developer",
    statusField: "build_status",
    assigneeField: "developer_id",
    nextStageField: "test_status",
    prevStageField: null,
    toastMessage: "Code submitted to QA successfully",
    logAction: "Developer submitted build to QA",
    rejectAction: null,
    rejectTarget: null,
  },
  test: {
    requiredRole: "qa",
    statusField: "test_status",
    assigneeField: "qa_id",
    nextStageField: "deploy_status",
    prevStageField: "build_status",
    toastMessage: "Tests executed and approved successfully",
    logAction: "QA approved and sent to DevOps",
    rejectLogAction: "QA rejected pipeline and sent back to Developer",
    rejectTarget: "build_status",
  },
  deploy: {
    requiredRole: "devops",
    statusField: "deploy_status",
    assigneeField: "devops_id",
    nextStageField: "release_status",
    prevStageField: "test_status",
    toastMessage: "Deployment to staging successful",
    logAction: "DevOps approved and sent to Manager",
    rejectLogAction: "DevOps rejected pipeline and sent back to QA",
    rejectTarget: "test_status",
  },
  release: {
    requiredRole: "manager",
    statusField: "release_status",
    assigneeField: "manager_id",
    nextStageField: null,
    prevStageField: "deploy_status",
    toastMessage: "Production release approved",
    logAction: "Manager approved release",
    rejectLogAction: "Manager rejected pipeline and sent back to DevOps",
    rejectTarget: "deploy_status",
  },
};

/** Enrich pipeline with user names for developer, qa, devops, manager */
const enrichPipelineWithNames = async (row) => {
  if (!row) return null;
  const [dev, qa, devops, manager] = await Promise.all([
    row.developer_id ? getUserById(row.developer_id) : null,
    row.qa_id ? getUserById(row.qa_id) : null,
    row.devops_id ? getUserById(row.devops_id) : null,
    row.manager_id ? getUserById(row.manager_id) : null,
  ]);
  return {
    ...row,
    developer_name: dev?.name ?? null,
    qa_name: qa?.name ?? null,
    devops_name: devops?.name ?? null,
    manager_name: manager?.name ?? null,
    build_user: dev?.name ?? null,
    test_user: qa?.name ?? null,
    deploy_user: devops?.name ?? null,
    release_user: manager?.name ?? null,
  };
};

const getPipeline = async (req, res) => {
  try {
    const pipelineId = req.query.pipelineId ? parseInt(req.query.pipelineId, 10) : null;
    let row;
    if (pipelineId) {
      row = await getPipelineById(pipelineId);
    } else {
      row = await getLatestPipeline();
    }
    if (!row) {
      return res.json(null);
    }
    const pipeline = await enrichPipelineWithNames(row);
    res.json(pipeline);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch pipeline" });
  }
};

const getPipelineList = async (req, res) => {
  try {
    const rows = await getPipelines();
    const pipelines = await Promise.all(rows.map((row) => enrichPipelineWithNames(row)));
    res.json(pipelines);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch pipelines" });
  }
};

const createNewPipeline = async (req, res) => {
  const { id: userId, name, role } = req.user;
  const io = req.app.get("socketio");

  if (role !== "developer") {
    return res.status(403).json({
      message: "Only developers can start a new pipeline.",
    });
  }

  const {
    projectName,
    qaId,
    devopsId,
    managerId,
    developerId,
    coDeveloperId,
  } = req.body || {};

  if (!qaId || !devopsId || !managerId) {
    return res.status(400).json({
      message: "QA, DevOps and Manager users are required to create a pipeline.",
    });
  }

  const assignedDeveloperId = developerId || userId;

  try {
    const pipeline = await createPipeline(
      assignedDeveloperId,
      qaId,
      devopsId,
      managerId,
      projectName || "DeployFlow"
    );
    const enriched = await enrichPipelineWithNames(pipeline);

    await addLog(pipeline.id, userId, role, "Pipeline created by developer.");

    if (io) {
      io.emit("pipeline_updated", enriched);
      const logs = await getLogsByPipelineId(pipeline.id);
      io.emit("logs_updated", logs);
    }

    res.status(201).json(enriched);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create pipeline" });
  }
};

const performAction = async (req, res) => {
  const { action, pipelineId: bodyPipelineId, decision = "approve", comment } = req.body;
  const { id: userId, name: userName, role: primaryRole } = req.user;
  const io = req.app.get("socketio");

  if (!action || !STAGE_CONFIG[action]) {
    return res.status(400).json({ message: "Invalid action" });
  }

  // Enforce comment
  if (!comment || comment.trim() === "") {
    return res.status(400).json({ message: "A comment is required." });
  }

  const pipelineId = bodyPipelineId ? parseInt(bodyPipelineId, 10) : null;
  if (!pipelineId) {
    return res.status(400).json({ message: "pipelineId is required" });
  }

  const config = STAGE_CONFIG[action];
  const userRoles = await getRolesForUser(userId);
  if (!userRoles || !userRoles.includes(config.requiredRole)) {
    return res.status(403).json({
      message: `You need the ${config.requiredRole} role to perform this action.`,
    });
  }

  try {
    const pipeline = await getPipelineById(pipelineId);
    if (!pipeline) {
      return res.status(404).json({ message: "Pipeline not found" });
    }

    const assigneeId = pipeline[config.assigneeField];
    if (assigneeId !== userId) {
      return res.status(403).json({
        message: "Only the assigned team member for this stage can perform this action.",
      });
    }

    if (pipeline[config.statusField] === "completed") {
      return res.status(400).json({ message: "This stage is already completed." });
    }

    if (config.prevStageField && pipeline[config.prevStageField] !== "completed") {
      return res.status(400).json({
        message: "Previous stage must be completed first.",
      });
    }

    let updated;
    const isReject = decision === "reject";

    if (isReject) {
      if (!config.rejectTarget) {
        return res.status(400).json({ message: "This stage cannot be rejected." });
      }

      // Mark current as locked
      updated = await updatePipelineStage(
        pipelineId,
        config.statusField,
        "locked"
      );
      // Move target back to pending
      updated = await updatePipelineStage(
        pipelineId,
        config.rejectTarget,
        "pending"
      );
    } else {
      updated = await updatePipelineStage(
        pipelineId,
        config.statusField,
        "completed"
      );

      if (config.nextStageField) {
        updated = await unlockNextStage(pipelineId, config.nextStageField);
        if (!updated) {
          const row = await getPipelineById(pipelineId);
          updated = row;
        }
      }
    }

    const newLog = await addLog(
      pipelineId,
      userId,
      config.requiredRole,
      isReject ? config.rejectLogAction : config.logAction,
      comment
    );

    const enriched = await enrichPipelineWithNames(updated);

    if (io) {
      io.emit("pipeline_updated", enriched);
      io.emit("new_log", { ...newLog, user_name: userName });
    }

    const logs = await getLogsByPipelineId(pipelineId);
    if (io) io.emit("logs_updated", logs);

    if (action === "release" && !isReject) {
      const completionLog = await addLog(
        pipelineId,
        userId,
        config.requiredRole,
        "Pipeline successfully deployed to production!"
      );
      if (io) {
        io.emit("pipeline_completed", {
          pipeline: enriched,
          log: { ...completionLog, user_name: userName },
        });
      }
    }

    res.json({
      message: "Action successful",
      pipeline: enriched,
      toastMessage: isReject ? "Pipeline rejected and sent back" : config.toastMessage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to perform action" });
  }
};

module.exports = {
  getPipeline,
  getPipelineList,
  createNewPipeline,
  performAction,
};
