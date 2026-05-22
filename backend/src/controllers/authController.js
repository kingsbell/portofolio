const authService = require('../services/authService');
const { generateToken } = require('../utils/jwt');
const logActivity = require('../utils/logger')
const asyncHandler = require('../utils/asyncHandler')
const { sendSuccess, sendError } = require('../utils/response')
require('dotenv').config()

const authController = {
    register: asyncHandler(async (req, res) => {

        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return sendError(res, "Please provide name, email, and password", 400);
        }
        const userId = await authService.register(name, email, password);
        await logActivity(userId, 'REGISTER_SUCCESS', req);

        return sendSuccess(res, 'Register Success', {
            data: {
                id: userId,
                email: email,
                password: password
            }
        }, 201);
    }),

    login: asyncHandler(async (req, res) => {

        const { email, password } = req.body;

        if (!email || !password) {
            return sendError(res, "Email and password is required", 400);
        }

        try {
            const user = await authService.login(email, password, req);

            const token = generateToken({ id: user.id, name: user.name, email: user.email });

            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000
            });

            await logActivity(user.id, 'LOGIN_SUCCESS', req);
            return sendSuccess(res, 'Login Success', {
                data: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                }
            }, 200);
        } catch (error) {
            if (error.statusCode === 401) {
                if (error.userId) {
                    await logActivity(error.userId, 'LOGIN_FAILED_WRONG_PASSWORD', req);
                }
                return sendError(res, "Unauthorized", 401);
            }
            throw error;
        }

    }),

    logout: asyncHandler(async (req, res) => {
        const userId = req.user ? req.user.id : null;

        res.clearCookie('token');

        if (userId) {
            await logActivity(userId, 'LOGOUT', req);
        }

        return sendSuccess(res, 'Logout Success');
    }),

    checkAuth: asyncHandler(async (req, res) => {
        return sendSuccess(res, 'Check Auth Success', {
            user: req.user
        }, 200);
    })
};

module.exports = authController;
