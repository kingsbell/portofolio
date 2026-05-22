const UserModel = require('../models/userModel');
const bcrypt = require('bcryptjs');

const authService = {
    register: async (name, email, password) => {
        const existingUser = await UserModel.findByEmail(email);
        if (existingUser) {
            const error = new Error('Email already used');
            error.statusCode = 400;
            throw error;
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        return await UserModel.create(name, email, hashedPassword);
    },

    login: async (email, password) => {
        const user = await UserModel.findByEmail(email);
        if (!user) {
            const error = new Error('Unauthorized');
            error.statusCode = 401;
            throw error;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            const error = new Error('Unauthorized');
            error.statusCode = 401;
            error.userId = user.id
            throw error
        }
        return user;
    }
}

module.exports = authService
