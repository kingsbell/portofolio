const db = require('../config/db'); // Menggunakan config db.js yang benar

const EndpointModel = {
    findBySuiteId: async (suiteId) => {
        const [rows] = await db.query(
            'SELECT * FROM recorded_api_endpoints WHERE suite_id = ? ORDER BY position ASC',
            [suiteId]
        );
        return rows;
    },

    checkExisting: async (suiteId, url, method) => {
        const [rows] = await db.query(
            'SELECT id FROM recorded_api_endpoints WHERE suite_id = ? AND url = ? AND method = ?',
            [suiteId, url, method]
        );
        return rows;
    },

    create: async (suiteId, method, url, description, headers, body, position) => {
        // Memperbaiki bug query INSERT: 7 kolom, harus 7 placeholder '?'
        return await db.query(
            `INSERT INTO recorded_api_endpoints 
            (suite_id, method, url, description, headers, body, position) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [suiteId, method, url, description, headers, body, position]
        );
    },

    delete: async (id) => {
        return await db.query('DELETE FROM recorded_api_endpoints WHERE id = ?', [id]);
    }
};

module.exports = EndpointModel;