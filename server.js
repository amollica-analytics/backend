const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { db, User, Task } = require('./database/setup');
require('dotenv').config();

const app = express();

// PORT must use env variable
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Middleware
app.use(express.json());
app.use(cors());

// Test database connection
async function testConnection() {
    try {
        await db.authenticate();
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Database connection error:', error);
    }
}

testConnection();