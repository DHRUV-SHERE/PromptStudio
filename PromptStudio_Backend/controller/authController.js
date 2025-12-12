const User = require('../models/UserModel');
const {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken
} = require('../utils/tokenUtils');
const crypto = require('crypto');

// authController.js - FIXED setTokensCookies function
const setTokensCookies = (req, res, accessToken, refreshToken, maxAge) => {
    const isProduction = process.env.NODE_ENV === 'production';

    // Get the request origin to determine domain
    const requestOrigin = req.headers.origin || '';
    let domain = undefined;

    if (isProduction) {
        // For cross-domain, we need specific domain, not .render.com
        // Check if request is from vercel.app
        if (requestOrigin.includes('thepromptstudio.vercel.app')) {
            // For cross-domain, we need to be more specific
            domain = 'promptstudio-vqbn.onrender.com'; // Backend's own domain
        } else if (requestOrigin.includes('render.com')) {
            // For same-origin requests
            domain = 'promptstudio-vqbn.onrender.com';
        }
        // If no origin matches, don't set domain (let browser decide)
    }

    console.log('🍪 Setting cookies with:', {
        isProduction,
        requestOrigin,
        domain,
        sameSite: isProduction ? 'none' : 'lax'
    });

    // Set access token cookie
    res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 15 * 60 * 1000, // 15 minutes
        path: '/',
        domain: domain
    });

    // Set refresh token cookie
    res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: maxAge,
        path: '/',
        domain: domain
    });
};
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password
        });

        // Generate tokens
        const accessToken = generateAccessToken(user._id);
        const refreshTokenData = generateRefreshToken();

        // Store refresh token in database
        await user.addRefreshToken({
            token: refreshTokenData.hashedToken,
            expiresAt: refreshTokenData.expiresAt,
            userAgent: req.headers['user-agent'],
            ipAddress: req.ip
        });

        // Set cookies
        setTokensCookies(req, res, accessToken, refreshTokenData.token, 7 * 24 * 60 * 60 * 1000);
        // Send response
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            accessToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Registration error:', error);

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public

const loginUser = async (req, res) => {
    try {
        console.log('Login attempt:', { email: req.body.email });

        const { email, password } = req.body;

        if (!email || !password) {
            console.log('Missing email or password');
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user and include password
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            console.log('User not found:', email);
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            console.log('Invalid password for user:', email);
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        console.log('User authenticated successfully:', user._id);
        // Clean expired tokens before adding new one
        await user.cleanExpiredTokens();

        // Generate tokens
        const accessToken = generateAccessToken(user._id);
        const refreshTokenData = generateRefreshToken();

        // Store refresh token in database
        await user.addRefreshToken({
            token: refreshTokenData.hashedToken,
            expiresAt: refreshTokenData.expiresAt,
            userAgent: req.headers['user-agent'],
            ipAddress: req.ip
        });

        // Set cookies
        setTokensCookies(req, res, accessToken, refreshTokenData.token, 7 * 24 * 60 * 60 * 1000);

        // Send response
        res.status(200).json({
            success: true,
            message: 'Login successful',
            accessToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        res.status(500).json({
            success: false,
            message: 'Server error during login',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public (but requires refresh token)
const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refresh_token;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'No refresh token provided'
            });
        }

        // Hash the received refresh token
        const hashedToken = crypto
            .createHash('sha256')
            .update(refreshToken)
            .digest('hex');

        // Find user with this refresh token
        const user = await User.findOne({
            'refreshTokens.token': hashedToken,
            'refreshTokens.expiresAt': { $gt: new Date() }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired refresh token'
            });
        }

        // Remove the old refresh token (one-time use)
        await user.removeRefreshToken(hashedToken);

        // Generate new tokens
        const newAccessToken = generateAccessToken(user._id);
        const newRefreshTokenData = generateRefreshToken();

        // Store new refresh token
        await user.addRefreshToken({
            token: newRefreshTokenData.hashedToken,
            expiresAt: newRefreshTokenData.expiresAt,
            userAgent: req.headers['user-agent'],
            ipAddress: req.ip
        });

        // Set new cookies
        setTokensCookies(req, res, newAccessToken, newRefreshTokenData.token, 7 * 24 * 60 * 60 * 1000);

        res.status(200).json({
            success: true,
            message: 'Token refreshed successfully',
            accessToken: newAccessToken
        });

    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};
// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = async (req, res) => {
    try {
        const isProduction = process.env.NODE_ENV === 'production';
        const requestOrigin = req.headers.origin || '';
        let domain = undefined;

        if (isProduction && requestOrigin.includes('thepromptstudio.vercel.app')) {
            domain = 'promptstudio-vqbn.onrender.com';
        }

        // Clear cookies WITH SAME OPTIONS as when set
        res.clearCookie('access_token', {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            path: '/',
            domain: domain
        });

        res.clearCookie('refresh_token', {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            path: '/',
            domain: domain
        });

        // If refresh token exists, remove it from database
        const refreshToken = req.cookies.refresh_token;
        if (refreshToken) {
            const hashedToken = crypto
                .createHash('sha256')
                .update(refreshToken)
                .digest('hex');

            const user = await User.findOne({
                'refreshTokens.token': hashedToken
            });

            if (user) {
                await user.removeRefreshToken(hashedToken);
            }
        }

        // In logoutUser:
        clearTokensCookies(req, res);

        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Logout from all devices
// @route   POST /api/auth/logout-all
// @access  Private
const logoutAllDevices = async (req, res) => {
    try {
        const isProduction = process.env.NODE_ENV === 'production';
        const requestOrigin = req.headers.origin || '';
        let domain = undefined;

        if (isProduction && requestOrigin.includes('thepromptstudio.vercel.app')) {
            domain = 'promptstudio-vqbn.onrender.com';
        }

        const user = await User.findById(req.userId);

        if (user) {
            // Clear all refresh tokens
            user.refreshTokens = [];
            await user.save();
        }

        // Clear cookies WITH SAME OPTIONS
        res.clearCookie('access_token', {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            path: '/',
            domain: domain
        });

        res.clearCookie('refresh_token', {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            path: '/',
            domain: domain
        });

        // In logoutAllDevices:
        clearTokensCookies(req, res);
        res.status(200).json({
            success: true,
            message: 'Logged out from all devices successfully'
        });
    } catch (error) {
        console.error('Logout all error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    refreshToken,
    logoutUser,
    logoutAllDevices,
    getCurrentUser
};

// Helper function to clear cookies with proper options
const clearTokensCookies = (req, res) => {
    const isProduction = process.env.NODE_ENV === 'production';
    const requestOrigin = req.headers.origin || '';
    let domain = undefined;

    if (isProduction && requestOrigin.includes('thepromptstudio.vercel.app')) {
        domain = 'promptstudio-vqbn.onrender.com';
    }

    res.clearCookie('access_token', {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/',
        domain: domain
    });

    res.clearCookie('refresh_token', {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/',
        domain: domain
    });
};