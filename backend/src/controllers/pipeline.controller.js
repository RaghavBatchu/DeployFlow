const { getPipelineState, updatePipelineStage, resetPipelineDb } = require("../models/pipeline.model");
const { addLog, clearLogs } = require("../models/log.model");

// Export configuration logic for roles and prerequisites
const PIPELINE_CONFIG = {
    build: { requiredRole: "developer", statusField: "build_status", requiredPrevStatus: "locked" }, // Usually starts here
    test: { requiredRole: "qa", statusField: "test_status", requiredPrevStatus: "build_status" },
    deploy: { requiredRole: "devops", statusField: "deploy_status", requiredPrevStatus: "test_status" },
    release: { requiredRole: "manager", statusField: "release_status", requiredPrevStatus: "deploy_status" },
};

const getPipeline = async (req, res) => {
    try {
        const pipeline = await getPipelineState();

        // If it's missing (shouldn't be, thanks to our seed), reset it
        if (!pipeline) {
            await resetPipelineDb();
            const newState = await getPipelineState();
            return res.json(newState);
        }

        res.json(pipeline);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch pipeline" });
    }
};

const performAction = async (req, res) => {
    const { action } = req.body;
    const { name: user_name, role } = req.user; // Securely extracted from JWT
    const io = req.app.get("socketio");

    if (!user_name || !role || !action || !PIPELINE_CONFIG[action]) {
        return res.status(400).json({ message: "Invalid action or missing user data" });
    }

    const config = PIPELINE_CONFIG[action];

    if (role !== config.requiredRole) {
        return res.status(403).json({ message: `Access Denied: Only a ${config.requiredRole} can perform this action.` });
    }

    try {
        const currentState = await getPipelineState();

        // Enforce lock sequence
        if (config.requiredPrevStatus !== "locked") {
            const prevStageResult = currentState[config.requiredPrevStatus];
            if (prevStageResult !== "completed") {
                return res.status(400).json({ message: `Action locked. Waiting on earlier stage to complete.` });
            }
        }

        // Is the current stage already done?
        if (currentState[config.statusField] === "completed") {
            return res.status(400).json({ message: "This stage is already completed." });
        }

        // Update status to complete (Simulating a direct completion for now)
        const newPipeline = await updatePipelineStage(config.statusField, "completed");

        // Also unlock the next step in the pipeline (set it to pending instead of locked)
        let unlockedPipeline = newPipeline;
        if (action === "build") {
            unlockedPipeline = await updatePipelineStage("test_status", "pending");
        } else if (action === "test") {
            unlockedPipeline = await updatePipelineStage("deploy_status", "pending");
        } else if (action === "deploy") {
            unlockedPipeline = await updatePipelineStage("release_status", "pending");
        }

        // Create log with the user's display name
        const newLog = await addLog(user_name, role, `${user_name} completed the ${action} stage.`);

        // Emit updates via Socket.io
        io.emit("pipeline_update", unlockedPipeline);
        io.emit("new_log", newLog);

        // If the Manager just approved release, fire the pipeline_completed event
        if (action === "release") {
            const completionLog = await addLog(user_name, role, "🎉 Pipeline successfully deployed to production!");
            io.emit("pipeline_completed", {
                pipeline: unlockedPipeline,
                log: completionLog
            });
        }

        res.json({ message: "Action successful", pipeline: unlockedPipeline });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to perform action" });
    }
};

const resetPipeline = async (req, res) => {
    const { name: user_name, role } = req.user;
    const io = req.app.get("socketio");

    // Allow any role to reset for ease of use, or restrict to manager/devops
    if (role !== "manager" && role !== "devops") {
        return res.status(403).json({ message: "Only a Manager or DevOps can reset the pipeline." });
    }

    try {
        const resetState = await resetPipelineDb();
        await clearLogs();

        const newLog = await addLog(user_name, role, `${user_name} reset the entire pipeline.`);

        io.emit("pipeline_update", resetState);
        io.emit("new_log", newLog);
        io.emit("logs_cleared", true);

        res.json({ message: "Pipeline reset", pipeline: resetState });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to reset" });
    }
}

module.exports = {
    getPipeline,
    performAction,
    resetPipeline
};
