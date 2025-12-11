const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide your name'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        lowercase: true,
        trim: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email'
        ]
    },
    subject: {
        type: String,
        required: [true, 'Please provide a subject'],
        trim: true,
        minlength: [5, 'Subject must be at least 5 characters'],
        maxlength: [200, 'Subject cannot exceed 200 characters']
    },
    message: {
        type: String,
        required: [true, 'Please provide a message'],
        trim: true,
        minlength: [10, 'Message must be at least 10 characters'],
        maxlength: [5000, 'Message cannot exceed 5000 characters']
    },
    status: {
        type: String,
        enum: ['pending', 'read', 'replied', 'closed'],
        default: 'pending'
    },
    ipAddress: String,
    userAgent: String,
    repliedAt: Date,
    repliedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    replyMessage: String,
    isArchived: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Add index for better query performance
ContactSchema.index({ status: 1, createdAt: -1 });
ContactSchema.index({ email: 1 });
ContactSchema.index({ isArchived: 1 });

module.exports = mongoose.model('Contact', ContactSchema);