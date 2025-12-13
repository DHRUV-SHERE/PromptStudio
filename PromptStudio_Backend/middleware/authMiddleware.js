// authMiddleware.js - DEBUG VERSION
const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
    console.log('🔐 Protect Middleware - Headers:', {
        authorization: req.headers.authorization ? 'Present' : 'Missing',
        cookies: req.cookies ? Object.keys(req.cookies) : 'No cookies',
        path: req.path,
        method: req.method,
        origin: req.headers.origin
    });

    let token;

    // 1. Check Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
        console.log('✅ Token from Authorization header');
    }
    // 2. Check cookies
    else if (req.cookies.access_token) {
        token = req.cookies.access_token;
        console.log('✅ Token from cookie');
    }
    // 3. Check query parameter (for testing)
    else if (req.query.token) {
        token = req.query.token;
        console.log('ℹ️ Token from query parameter (testing)');
    }

    if (!token) {
        console.log('❌ No token found');
        return res.status(401).json({
            success: false,
            message: 'Not authorized, no token',
            debug: {
                authHeader: req.headers.authorization ? 'present' : 'missing',
                cookiesPresent: req.cookies ? Object.keys(req.cookies) : []
            }
        });
    }

    try {
        console.log('🔍 Verifying token...');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('✅ Token verified successfully:', { userId: decoded.id });
        
        req.userId = decoded.id;
        next();
    } catch (error) {
        console.error('❌ Token verification error:', {
            name: error.name,
            message: error.message,
            tokenPreview: token.substring(0, 20) + '...'
        });
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired, please login again',
                errorType: 'TokenExpiredError'
            });
        }
        
        return res.status(401).json({
            success: false,
            message: 'Not authorized, invalid token',
            errorType: error.name
        });
    }
};

module.exports = { protect };