const { getRecentLogs } = require("../models/log.model");

const getLogs = async (req, res) => {
    try {
        const logs = await getRecentLogs(50);
        res.json(logs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch logs" });
    }
};

module.exports = {
    getLogs,
};
