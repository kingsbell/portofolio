const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const errorMiddleWare = require('./src/middlewares/errorMiddleware');
const authRoutes = require('./src/routes/authRoutes');

const app = express();
const port = process.env.PORT || 5001;

app.use(cors({
    origin: 'http://localhost:5000',
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(cookieParser())

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.json({
        message: "Server running"
    });
});

app.use(errorMiddleWare);

app.listen(port, () => {
    console.log(`Server running in http://localhost:${port}`);
});

