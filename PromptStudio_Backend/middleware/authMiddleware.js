const jwt = require('jsonwebtoken');

// In authMiddleware.js - Add token validation
const protect = async (req, res, next) => {
    let token;

    // 1. Check Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    // 2. Check cookies
    else if (req.cookies.access_token) {
        token = req.cookies.access_token;
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, no token'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if this token has been blacklisted (optional enhancement)
        // You could store invalidated tokens in Redis or database
        
        req.userId = decoded.id;
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        
        // If token is expired, be more specific
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired, please login again'
            });
        }
        
        return res.status(401).json({
            success: false,
            message: 'Not authorized, invalid token'
        });
    }
};

module.exports = { protect };