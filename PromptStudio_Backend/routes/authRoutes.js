const express = require('express');
const router = express.Router();
const { 
    registerUser, 
    loginUser, 
    refreshToken,
    logoutUser, 
    logoutAllDevices,
    getCurrentUser 
} = require('../controller/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh', refreshToken); // Add refresh endpoint

// Protected routes
router.post('/logout', protect, logoutUser);
router.post('/logout-all', protect, logoutAllDevices);
router.get('/me', protect, getCurrentUser);

module.exports = router;