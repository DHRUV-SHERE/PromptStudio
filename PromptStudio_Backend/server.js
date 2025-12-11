const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectDB = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');
const promptRoutes = require('./routes/promptRoutes');

// Connect to Database
connectDB();

// Initialize Express
const app = express();

// CORS Configuration
const corsOptions = {
    origin: ['https://thepromptstudio.vercel.app', 'http://localhost:5173'],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ 
        success: true,
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// API Documentation
app.get('/api', (req, res) => {
    res.json({ 
        success: true,
        message: 'PromptStudio API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth/*',
            prompts: '/api/prompts/*',
            contact: '/api/contact/*'
        }
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/prompts', promptRoutes);

// Root route
app.get('/', (req, res) => {
    res.redirect('/api');
});

// Static files in production (WITHOUT WILDCARD)
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'public')));
    
    // ✅ FIXED: Serve React app for specific routes only
    // Don't use '*' wildcard - it causes the error
    const frontendRoutes = ['/login', '/register', '/generator', '/dashboard', '/history'];
    
    frontendRoutes.forEach(route => {
        app.get(route, (req, res) => {
            res.sendFile(path.join(__dirname, 'public', 'index.html'));
        });
    });
    
    // Home page
    app.get('/home', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });
}

// ✅ FIXED: Simple 404 handler (NO REGEX, NO WILDCARD)
app.use((req, res) => {
    // If it's an API route
    if (req.path.startsWith('/api')) {
        return res.status(404).json({
            success: false,
            message: `API endpoint ${req.method} ${req.originalUrl} not found`,
            suggestion: 'Visit /api for available endpoints'
        });
    }
    
    // If in production and it's a frontend route we missed
    if (process.env.NODE_ENV === 'production') {
        // For any non-API route in production, serve the React app
        // This handles client-side routing
        return res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }
    
    // In development, return 404
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} not found`,
        suggestion: 'Visit /api for available endpoints'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err.message);
    
    if (err.message.includes('CORS')) {
        return res.status(403).json({
            success: false,
            message: 'CORS Error: Request origin not allowed'
        });
    }
    
    res.status(err.status || 500).json({ 
        success: false, 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
    console.log(`
    ✅ Server running on port ${PORT}
    🌍 Environment: ${process.env.NODE_ENV || 'development'}
    🔗 Health: http://localhost:${PORT}/health
    🌐 Allowed Origins: https://thepromptstudio.vercel.app, http://localhost:5173
    `);
});

module.exports = app;