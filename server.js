require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const pool = require('./db');
const app = express();

// Middleware
app.use(express.json());
app.use(morgan('dev')); 
app.use(cors());

// Middleware requests
app.use((req, res, next) => {
    console.log(`Route accessed: ${req.method} ${req.url}`);
    next();
});

// Routes
const joyasRoutes = require('./routes/joyasRoutes');
app.use('/joyas', joyasRoutes);

// Global error 
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

// inicio servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
