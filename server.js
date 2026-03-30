const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { db, User, Task } = require('./database/setup');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

/*
================================
ROOT ENDPOINT (THIS FIXES /)
================================
*/
app.get('/', (req, res) => {
    res.json({
        message: "Task Management API",
        status: "Running",
        endpoints: {
            health: "/health",
            register: "/api/register",
            login: "/api/login",
            tasks: "/api/tasks"
        }
    });
});

/*
================================
HEALTH CHECK
================================
*/
app.get('/health', (req, res) => {
    res.json({
        status: "OK",
        message: "Task API is running",
        timestamp: new Date()
    });
});

/*
================================
AUTH ROUTES
================================
*/

app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: "All fields required" });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        res.status(500).json({ error: "Registration failed" });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.json({
            message: "Login successful",
            token
        });

    } catch (error) {
        res.status(500).json({ error: "Login failed" });
    }
});

/*
================================
TASK ROUTES
================================
*/

app.get('/api/tasks', async (req, res) => {
    try {
        const tasks = await Task.findAll();

        res.json({
            message: "Tasks retrieved successfully",
            tasks
        });

    } catch (error) {
        res.status(500).json({ error: "Failed to get tasks" });
    }
});

/*
================================
404 HANDLER (MUST BE LAST)
================================
*/
app.use((req, res) => {
    res.status(404).json({
        error: "Endpoint not found"
    });
});

/*
================================
START SERVER
================================
*/
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});