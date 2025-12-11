const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/database');
const authRoutes = require('./routes/authRoutes'); // Add this
// In your server.js, add:
const contactRoutes = require('./routes/contactRoutes');
// Add after other routes
const promptRoutes = require('./routes/promptRoutes');
// Load environment variables

// Connect to Database
connectDB();

// Initialize Express
const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:5173', // Your frontend URL
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes); // Add this line
// Add after auth routes
app.use('/api/contact', contactRoutes);
app.use('/api/prompts', promptRoutes);
// Basic route for testing
app.get('/', (req, res) => {
    res.json({ 
        success: true,
        message: 'Welcome to PromptStudio API',
        version: '1.0.0',
        endpoints: {
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                logout: 'POST /api/auth/logout',
                currentUser: 'GET /api/auth/me'
            }
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} not found`
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 http://localhost:${PORT}`);
});