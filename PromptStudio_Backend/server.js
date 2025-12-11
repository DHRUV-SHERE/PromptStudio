const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path'); // Add this for static file serving
const connectDB = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');
const promptRoutes = require('./routes/promptRoutes');

// Connect to Database
connectDB();

// Initialize Express
const app = express();

// Production CORS Configuration
const allowedOrigins = [
    'https://thepromptstudio.vercel.app', // REPLACE with your actual Vercel frontend URL
    'http://localhost:5173', // Local development
    'https://promptstudio-av40.onrender.com', // Your backend (for self-requests if needed)
    'https://promptstudio-av40.onrender.com' // Alternate (keep both for safety)
];

// Dynamic CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        
        // Check if origin is in allowed list
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            // Log unauthorized origin attempts
            console.warn(`Blocked by CORS: ${origin}`);
            callback(new Error(`Not allowed by CORS. Allowed origins: ${allowedOrigins.join(', ')}`));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Content-Length', 'Authorization'],
    maxAge: 86400 // 24 hours
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Additional CORS headers for specific cases
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Health check endpoint (REQUIRED for Render monitoring)
app.get('/health', (req, res) => {
    res.status(200).json({ 
        success: true,
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// API Documentation route
app.get('/api', (req, res) => {
    res.json({ 
        success: true,
        message: 'Welcome to PromptStudio API',
        version: '1.0.0',
        baseUrl: `${req.protocol}://${req.get('host')}`,
        endpoints: {
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                logout: 'POST /api/auth/logout',
                currentUser: 'GET /api/auth/me',
                refresh: 'POST /api/auth/refresh',
                logoutAll: 'POST /api/auth/logout-all'
            },
            prompts: {
                generate: 'POST /api/prompts/generate',
                batchGenerate: 'POST /api/prompts/batch-generate',
                enhance: 'POST /api/prompts/enhance',
                history: 'GET /api/prompts/history',
                categories: 'GET /api/prompts/categories',
                single: 'GET /api/prompts/:id',
                delete: 'DELETE /api/prompts/:id'
            },
            contact: {
                send: 'POST /api/contact/send'
            }
        },
        environment: process.env.NODE_ENV || 'development'
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/prompts', promptRoutes);

// Root route
app.get('/', (req, res) => {
    res.redirect('/api'); // Redirect to API docs
});

// Static files in production (optional - if serving frontend from same server)
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'public')));
    
    // Serve frontend for any non-API routes
    app.get('*', (req, res) => {
        if (!req.path.startsWith('/api')) {
            res.sendFile(path.join(__dirname, 'public', 'index.html'));
        }
    });
}

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `API endpoint ${req.method} ${req.originalUrl} not found`,
        availableEndpoints: {
            auth: '/api/auth/*',
            prompts: '/api/prompts/*',
            contact: '/api/contact/*'
        }
    });
});

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error('Server Error:', {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        timestamp: new Date().toISOString()
    });
    
    // Handle CORS errors specifically
    if (err.message.includes('CORS')) {
        return res.status(403).json({
            success: false,
            message: 'CORS Error: Request origin not allowed',
            allowedOrigins: allowedOrigins
        });
    }
    
    res.status(err.status || 500).json({ 
        success: false, 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
        requestId: req.id || Date.now().toString(36)
    });
});

// Start server with proper host configuration
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0'; // Important for Render

const server = app.listen(PORT, HOST, () => {
    console.log(`
    🚀 Server started successfully!
    🌍 Environment: ${process.env.NODE_ENV || 'development'}
    🔗 Local: http://localhost:${PORT}
    🔗 Network: http://${HOST}:${PORT}
    📅 ${new Date().toLocaleString()}
    
    ✅ Health Check: http://localhost:${PORT}/health
    📚 API Docs: http://localhost:${PORT}/api
    🗄️  Database: ${process.env.MONGODB_URI ? 'Connected' : 'Not configured'}
    
    Press Ctrl+C to stop the server
    `);
});

// Graceful shutdown handlers
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Export app for testing
module.exports = app;