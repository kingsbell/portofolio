const UserModel = require('../models/userModel');
const bcrypt = require('bcryptjs');
const AppError = require('../utils/appError');

const authService = {
    login: async (email, password) => {
        const user = await UserModel.findByEmail(email);
        if (!user) {
            throw new AppError('Unauthorized', 401);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            // Melempar error 401 disertai info userId untuk keperluan logging audit
            throw new AppError('Unauthorized', 401, { userId: user.id });
        }
        
        return user;
    }
};

module.exports = authService;