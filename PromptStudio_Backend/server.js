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

// Production CORS Configuration
const allowedOrigins = [
    'https://thepromptstudio.vercel.app', // Your Vercel frontend
    'http://localhost:5173', // Local development
    'https://promptstudio-av40.onrender.com' // Your backend
];

// CORS configuration - FIXED
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log(`CORS blocked: ${origin} | Allowed: ${allowedOrigins.join(', ')}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};

// Apply CORS middleware
app.use(cors(corsOptions));

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

// ✅ FIXED: 404 handler for unmatched API routes
app.all('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `API endpoint ${req.method} ${req.originalUrl} not found`,
        availableEndpoints: {
            auth: '/api/auth/*',
            prompts: '/api/prompts/*',
            contact: '/api/contact/*'
        },
        suggestion: 'Visit /api for available endpoints'
    });
});

// ✅ FIXED: Global 404 handler for all other routes
app.all('*', (req, res) => {
    // Skip if it's an API route (already handled above)
    if (req.path.startsWith('/api')) {
        return;
    }
    
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} not found`,
        suggestion: 'Visit /api for available endpoints'
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
            allowedOrigins: allowedOrigins,
            yourOrigin: req.headers.origin || 'Not provided'
        });
    }
    
    res.status(err.status || 500).json({ 
        success: false, 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
        requestId: Date.now().toString(36)
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
    🌐 Allowed Origins: ${allowedOrigins.join(', ')}
    
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