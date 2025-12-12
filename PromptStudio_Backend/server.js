const dotenv = require('dotenv');
// Load environment variables FIRST
dotenv.config();

console.log('🔧 Environment check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');
const promptRoutes = require('./routes/promptRoutes');

// Initialize Express
const app = express();

// CORS Configuration
const corsOptions = {
    origin: ['https://thepromptstudio.vercel.app', 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    optionsSuccessStatus: 200
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
});

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

// Test route
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: 'API is working',
        timestamp: new Date().toISOString()
    });
});

// Root route
app.get('/', (req, res) => {
    res.redirect('/api');
});

// Static files in production
if (process.env.NODE_ENV === 'production') {
    const publicPath = path.join(__dirname, 'public');
    const fs = require('fs');
    
    if (fs.existsSync(publicPath)) {
        console.log('📁 Serving static files from:', publicPath);
        app.use(express.static(publicPath));
        
        // Serve React app for frontend routes
        const frontendRoutes = ['/home', '/login', '/register', '/generator', '/dashboard', '/history', '/profile', '/about', '/contact'];
        
        frontendRoutes.forEach(route => {
            app.get(route, (req, res) => {
                res.sendFile(path.join(publicPath, 'index.html'));
            });
        });
        
        // Home page
        app.get('/', (req, res) => {
            res.sendFile(path.join(publicPath, 'index.html'));
        });
    }
}

// 404 handler - FIXED: No wildcard routes
app.use((req, res) => {
    // Check if it's an API route
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({
            success: false,
            message: `API endpoint ${req.method} ${req.originalUrl} not found`,
            timestamp: new Date().toISOString(),
            suggestion: 'Visit /api for available endpoints'
        });
    }
    
    // For non-API routes in production, serve index.html if it exists
    if (process.env.NODE_ENV === 'production') {
        const publicPath = path.join(__dirname, 'public');
        const indexPath = path.join(publicPath, 'index.html');
        const fs = require('fs');
        
        if (fs.existsSync(indexPath)) {
            return res.sendFile(indexPath);
        }
    }
    
    // Default 404
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} not found`,
        timestamp: new Date().toISOString()
    });
});

// Global error handler
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

// Connect to Database
connectDB().then(() => {
    console.log('✅ Database connection established');
}).catch(err => {
    console.error('❌ Failed to connect to database:', err.message);
    // Don't exit for now, let server start for debugging
});

// Start server
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
    console.log(`
    ✅ Server running on port ${PORT}
    🌍 Environment: ${process.env.NODE_ENV || 'development'}
    🔗 Health: http://localhost:${PORT}/health
    🌐 Allowed Origins: ${corsOptions.origin.join(', ')}
    `);
});

module.exports = app;