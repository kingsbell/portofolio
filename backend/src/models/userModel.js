const db = require('../config/db')

const UserModel = {
    findByEmail: async (email) => {
        try {
            const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
            return rows[0];
        } catch (err) {
            throw new Error('Email not found: ' + err.message);
        }
    },

    create: async (name, email, hashedPassword) => {
        try {
            const [result] = await db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);
            return result.insertId;
        } catch (error) {
            throw new Error('Failed to create user' + error.message);
        }
    }
}

module.exports = UserModel;