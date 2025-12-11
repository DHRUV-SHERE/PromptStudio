const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    refreshTokens: [{
        token: String,
        expiresAt: Date,
        userAgent: String,
        ipAddress: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
     promptCount: {
        type: Number,
        default: 0
    },
    lastPromptAt: Date,
    promptLimit: {
        type: Number,
        default: 10 // Daily limit for free tier
    },
    isPremium: {
        type: Boolean,
        default: false
    },
    premiumExpiresAt: Date,
    isVerified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function() {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Add refresh token method
UserSchema.methods.addRefreshToken = function(tokenData) {
    // Keep only last 5 refresh tokens (security)
    if (this.refreshTokens.length >= 5) {
        this.refreshTokens.shift(); // Remove oldest
    }
    this.refreshTokens.push(tokenData);
    return this.save();
};

// Remove refresh token method
UserSchema.methods.removeRefreshToken = function(token) {
    this.refreshTokens = this.refreshTokens.filter(rt => rt.token !== token);
    return this.save();
};

// Clean expired tokens method
UserSchema.methods.cleanExpiredTokens = function() {
    const now = new Date();
    this.refreshTokens = this.refreshTokens.filter(rt => rt.expiresAt > now);
    return this.save();
};

// Remove password from JSON response
UserSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    delete user.refreshTokens;
    return user;
};

module.exports = mongoose.model('User', UserSchema);