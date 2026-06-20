const db = require('../config/db');

const ApiTestRunModel = {
    create: async (runData) => {
        const {
            suiteId,
            testType,
            status,
            durationMs,
            totalRequests,
            successRate,
            avgLatency,
            maxRps,
            logOutput
        } = runData;

        return await db.query(
            `INSERT INTO api_test_runs 
            (suite_id, test_type, status, duration_ms, total_requests, success_rate, avg_latency, max_rps, log_output) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [suiteId, testType, status, durationMs, totalRequests, successRate, avgLatency, maxRps, logOutput]
        );
    },

    findBySuiteId: async (suiteId) => {
        const [rows] = await db.query('SELECT * FROM api_test_runs WHERE suite_id = ? ORDER BY id DESC', [suiteId]);
        return rows;
    },

    findAll: async () => {
        const [rows] = await db.query('SELECT * FROM api_test_runs ORDER BY id DESC');
        return rows;
    }
};

module.exports = ApiTestRunModel;