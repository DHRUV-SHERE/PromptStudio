const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Generate Access Token (short-lived)
const generateAccessToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
    );
};

// Generate Refresh Token (long-lived)
const generateRefreshToken = () => {
    // Generate random token
    const refreshToken = crypto.randomBytes(40).toString('hex');
    
    // Hash it for storage
    const hashedToken = crypto
        .createHash('sha256')
        .update(refreshToken)
        .digest('hex');
    
    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + parseInt(process.env.JWT_COOKIE_EXPIRE));
    
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

// Verify Refresh Token
const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
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