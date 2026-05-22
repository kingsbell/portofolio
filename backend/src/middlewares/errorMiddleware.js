const errorMiddleWare = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;

    // Hanya tampilkan stack trace lengkap di terminal jika error internal (500)
    if (statusCode === 500) {
        console.error('Global Server Error:', err.stack);
    } else {
        console.warn(`[Client Error] Status ${statusCode}: ${err.message}`);
    }

    const message = statusCode === 500 ? 'Internal Server Error' : err.message;

    res.status(statusCode).json({
        message: message
    })
}

module.exports = errorMiddleWare