const User = require('../models/UserModel');

const authorize = (...roles) => {
    return async (req, res, next) => {
        try {
            const user = await User.findById(req.userId);
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
            
            if (!roles.includes(user.role)) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to access this resource'
                });
            }
            
            next();
        } catch (error) {
            console.error('Authorization error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    };
};

module.exports = { authorize };