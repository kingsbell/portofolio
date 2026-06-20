const db = require('../config/db');

const SuiteModel = {
    findAll: async () => {
        const [rows] = await db.query('SELECT * FROM api_test_suites ORDER BY created_at DESC');
        return rows;
    },

    findById: async (id) => {
        const [rows] = await db.query('SELECT * FROM api_test_suites WHERE id = ?', [id]);
        return rows[0];
    },

    create: async (name, description, targetUrl) => {
        const [result] = await db.query(
            'INSERT INTO api_test_suites (name, description, target_url) VALUES (?, ?, ?)',
            [name, description, targetUrl]
        );
        return result.insertId;
    },

    delete: async (id) => {
        return await db.query('DELETE FROM api_test_suites WHERE id = ?', [id]);
    }
};

module.exports = SuiteModel;
