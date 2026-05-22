const sendSuccess = (res, message, data = null, statusCode = 200) => {
    if (data !== null) {
        return res.status(statusCode).json(data);
    }
    return res.status(statusCode).json({ message });
};

const sendError = (res, message, statusCode = 500) => {
    return res.status(statusCode).json({
        message,
    });
};
module.exports = { sendSuccess, sendError }