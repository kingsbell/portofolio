const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const authRoutes = require('./src/routes/authRoutes');
const apiAutomationRoutes = require('./src/routes/apiAutomationRoutes');

const app = express();
const port = process.env.PORT || 5001;

app.use(cors({
    origin: (origin, callback) => {
        // Izinkan request tanpa origin (seperti Postman) atau dari localhost dengan port mana saja
        if (!origin || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(cookieParser())

app.use('/api/auth', authRoutes);
app.use('/api/api-automation', apiAutomationRoutes);

app.get('/', (req, res) => {
    res.json({
        message: "Server running"
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('🔥 Global Error:', err.stack);
    
    // Gunakan status code dari error (jika ada) atau default ke 500
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal server error";

    res.status(statusCode).json({
        success: false,
        message: message
    });
});

app.listen(port, () => {
    console.log(`Server running in http://localhost:${port}`);
});

