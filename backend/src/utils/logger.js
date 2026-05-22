const db = require('../config/db')

const logActivity = async (userId, action, req) => {
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

    const userAgent = req.headers['user-agent'] || 'Unknown Agent'

    try {
        await db.query(
            'INSERT INTO activity_logs (user_id, action, ip_address, user_agent) VALUES (?, ?, ?, ?)',
            [userId, action, ipAddress, userAgent]
        );
        console.log(`[AUDIT LOG] USER ID ${userId || 'GUEST'} -> Action: ${action} | IP: ${ipAddress}`)
    } catch (err) {
        console.log('Error logging activity:', err);
    }
};

module.exports = logActivity;