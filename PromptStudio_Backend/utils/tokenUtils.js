const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// tokenUtils.js
const generateAccessToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m' } // ✅ Use env var
    );
};

const generateRefreshToken = () => {
    const refreshToken = crypto.randomBytes(40).toString('hex');
    const hashedToken = crypto
        .createHash('sha256')
        .update(refreshToken)
        .digest('hex');
    
    // Use environment variable
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 
        parseInt(process.env.JWT_REFRESH_EXPIRE_DAYS || '7')); // ✅ Use env var
    
    return {
        token: refreshToken,
        hashedToken,
        expiresAt
    };
};

// Verify Access Token
const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
};

// tokenUtils.js - FIXED verifyRefreshToken
const verifyRefreshToken = (token) => {
    try {
        // Use JWT_SECRET instead of undefined REFRESH_TOKEN_SECRET
        return jwt.verify(token, process.env.JWT_SECRET || process.env.JWT_REFRESH_SECRET);
    } catch (error) {
        return null;
    }
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken
};