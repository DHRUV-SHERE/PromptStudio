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
    optionsSuccessStatus: 200,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Authorization', 'Set-Cookie'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
};

// Apply CORS before other middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight requests

// Middleware
app.use(express.json({ 
    limit: '10mb',
    verify: (req, res, buf) => {
        try {
            JSON.parse(buf);
        } catch (e) {
            res.status(400).json({ 
                success: false, 
                message: 'Invalid JSON payload' 
            });
            throw new Error('Invalid JSON');
        }
    }
}));
app.use(express.urlencoded({ 
    extended: true, 
    limit: '10mb',
    parameterLimit: 10000 
}));
app.use(cookieParser());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
});

// Health check with detailed status
app.get('/health', async (req, res) => {
    const health = {
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        services: {}
    };

    try {
        // Check database connection
        if (mongoose.connection.readyState === 1) {
            health.services.database = 'connected';
            health.services.databaseInfo = {
                name: mongoose.connection.db?.databaseName || 'unknown',
                host: mongoose.connection.host,
                readyState: mongoose.connection.readyState
            };
            
            // Test database query
            await mongoose.connection.db.admin().ping();
            health.services.database = 'healthy';
        } else {
            health.services.database = 'disconnected';
        }
    } catch (dbError) {
        health.services.database = 'error';
        health.services.databaseError = dbError.message;
    }

    // Check AI service
    try {
        const aiService = require('./services/aiService');
        const aiInfo = aiService.getModelInfo();
        health.services.ai = aiInfo.status;
        health.services.aiInfo = {
            model: aiInfo.name,
            provider: aiInfo.provider,
            capabilities: aiInfo.capabilities
        };
    } catch (aiError) {
        health.services.ai = 'error';
        health.services.aiError = aiError.message;
    }

    res.status(200).json(health);
});

// API Documentation
app.get('/api', (req, res) => {
    res.json({ 
        success: true,
        message: 'PromptStudio API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        endpoints: {
            auth: {
                base: '/api/auth',
                routes: [
                    { method: 'POST', path: '/register', description: 'Register new user' },
                    { method: 'POST', path: '/login', description: 'User login' },
                    { method: 'POST', path: '/logout', description: 'User logout' },
                    { method: 'POST', path: '/refresh', description: 'Refresh access token' },
                    { method: 'GET', path: '/me', description: 'Get current user' }
                ]
            },
            prompts: {
                base: '/api/prompts',
                routes: [
                    { method: 'POST', path: '/generate', description: 'Generate AI prompt' },
                    { method: 'GET', path: '/history', description: 'Get user prompt history' },
                    { method: 'GET', path: '/categories', description: 'Get available categories' },
                    { method: 'DELETE', path: '/:id', description: 'Delete prompt' }
                ]
            },
            contact: {
                base: '/api/contact',
                routes: [
                    { method: 'POST', path: '/', description: 'Submit contact form' }
                ]
            }
        },
        documentation: 'Visit /health for service status'
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/prompts', promptRoutes);

// Test route for debugging
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: 'API test successful',
        timestamp: new Date().toISOString(),
        headers: req.headers,
        cookies: req.cookies
    });
});

// Root route
app.get('/', (req, res) => {
    res.redirect('/api');
});

// Static files in production
if (process.env.NODE_ENV === 'production') {
    const publicPath = path.join(__dirname, 'public');
    
    // Check if public directory exists
    const fs = require('fs');
    if (fs.existsSync(publicPath)) {
        console.log('📁 Serving static files from:', publicPath);
        app.use(express.static(publicPath));
        
        // Serve React app for specific routes
        const frontendRoutes = [
            '/', '/home', '/login', '/register', 
            '/generator', '/dashboard', '/history',
            '/profile', '/about', '/contact'
        ];
        
        frontendRoutes.forEach(route => {
            app.get(route, (req, res) => {
                const indexPath = path.join(publicPath, 'index.html');
                if (fs.existsSync(indexPath)) {
                    res.sendFile(indexPath);
                } else {
                    res.status(404).json({
                        success: false,
                        message: 'Frontend not built yet',
                        suggestion: 'Run "npm run build" in frontend directory'
                    });
                }
            });
        });
    } else {
        console.log('⚠️ Public directory not found. Skipping static file serving.');
    }
}

// Simple 404 handler
app.use((req, res) => {
    // If it's an API route
    if (req.path.startsWith('/api')) {
        return res.status(404).json({
            success: false,
            message: `API endpoint ${req.method} ${req.originalUrl} not found`,
            timestamp: new Date().toISOString(),
            suggestion: 'Visit /api for available endpoints'
        });
    }
    
    // If in production and we have a public directory
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
        timestamp: new Date().toISOString(),
        suggestion: 'Visit /api for available endpoints'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('🔴 Server Error:', {
        message: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString()
    });
    
    // Handle specific error types
    if (err.message.includes('CORS')) {
        return res.status(403).json({
            success: false,
            message: 'CORS Error: Request origin not allowed',
            timestamp: new Date().toISOString()
        });
    }
    
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors: err.errors,
            timestamp: new Date().toISOString()
        });
    }
    
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token',
            timestamp: new Date().toISOString()
        });
    }
    
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expired',
            timestamp: new Date().toISOString()
        });
    }
    
    // Default error response
    const statusCode = err.status || err.statusCode || 500;
    const errorResponse = {
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
    };
    
    // Include error details in development
    if (process.env.NODE_ENV === 'development') {
        errorResponse.error = err.message;
        errorResponse.stack = err.stack;
    }
    
    res.status(statusCode).json(errorResponse);
});

// Connect to Database AFTER error handlers are set up
connectDB().then(() => {
    console.log('✅ Database connection established');
}).catch(err => {
    console.error('❌ Failed to connect to database:', err.message);
    // Don't exit immediately - let the server start for debugging
});

// Start server
const PORT = parseInt(process.env.PORT) || 5000;
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
    console.log(`
    🚀 Server Information:
    ✅ Server running on port ${PORT}
    🌍 Environment: ${process.env.NODE_ENV || 'development'}
    📍 Host: ${HOST}
    🔗 Health: http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}/health
    📚 API Docs: http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}/api
    🌐 Allowed Origins: ${corsOptions.origin.join(', ')}
    📊 Database: ${process.env.MONGODB_URI ? 'Configured' : 'Not configured'}
    `);
});

// Graceful shutdown
const gracefulShutdown = () => {
    console.log('\n🔄 Received shutdown signal, closing connections...');
    
    server.close(() => {
        console.log('✅ HTTP server closed');
        
        mongoose.connection.close(false, () => {
            console.log('✅ MongoDB connection closed');
            process.exit(0);
        });
    });
    
    // Force shutdown after 10 seconds
    setTimeout(() => {
        console.error('⚠️ Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('🔥 Uncaught Exception:', err);
    gracefulShutdown();
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('🔥 Unhandled Rejection at:', promise, 'reason:', reason);
});

// Export for testing
module.exports = { app, server };