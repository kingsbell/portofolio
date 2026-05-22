const { verifyToken } = require('../utils/jwt')
const { sendError } = require('../utils/response')
const asyncHandler = require('../utils/asyncHandler')
require('dotenv').config();

const requireAuth = asyncHandler(async (req, res, next) => {
    const token = req.cookies.token

    if (!token) {
        return sendError(res, 'Your token expired, please login again.', 401);
    }
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
});

module.exports = requireAuth;
