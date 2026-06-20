class AppError extends Error {
    constructor(message, statusCode, extra = {}) {
        super(message);
        this.statusCode = statusCode;
        Object.assign(this, extra);
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;