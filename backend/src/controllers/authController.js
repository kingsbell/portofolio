const UserModel = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logActivity = require('../utils/logger');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/response');

const authController = {
    // === B. LOGIN ===
    login: asyncHandler(async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return sendError(res, 'Email and password are required', 400);
        }

        const user = await UserModel.findByEmail(email);
        if (!user) {
            return sendError(res, 'Unauthorized', 401);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            await logActivity(user.id, 'LOGIN_FAILED_WRONG_PASSWORD', req);
            return sendError(res, 'Unauthorized', 401);
        }

        const token = jwt.sign(
            { id: user.id, name: user.name, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000
        });

        await logActivity(user.id, 'LOGIN_SUCCESS', req);

        return sendSuccess(res, 'Login Success', {
            id: user.id,
            name: user.name,
            email: user.email
        });
    }),

    // === C. LOGOUT ===
    logout: asyncHandler(async (req, res) => {
        const userId = req.user ? req.user.id : null;

        res.clearCookie('token');

        if (userId) {
            await logActivity(userId, 'LOGOUT', req);
        }

        return sendSuccess(res, 'Logout Success');
    }),

    // === D. CHECK AUTH ===
    checkAuth: asyncHandler(async (req, res) => {
        return sendSuccess(res, 'Authentication valid', req.user);
    })
};

module.exports = authController;
