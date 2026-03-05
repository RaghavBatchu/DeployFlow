const pool = require("../db/postgres");

const getPipelineState = async () => {
    const result = await pool.query("SELECT * FROM pipeline LIMIT 1");
    return result.rows[0];
};

const updatePipelineStage = async (stage, status) => {
    // We use string templating for the stage column entirely because it's dynamic
    // Note: Only ever pass safe literals ('build_status', 'test_status', etc) directly.
    const query = `UPDATE pipeline SET ${stage} = $1, updated_at = NOW() RETURNING *`;
    const result = await pool.query(query, [status]);
    return result.rows[0];
};

const resetPipelineDb = async () => {
    // build becomes pending, rest become locked
    const query = `
        UPDATE pipeline 
        SET build_status = 'pending', test_status = 'locked', deploy_status = 'locked', release_status = 'locked', updated_at = NOW()
        RETURNING *
    `;
    const result = await pool.query(query);
    return result.rows[0];
}

module.exports = {
    getPipelineState,
    updatePipelineStage,
    resetPipelineDb
};
