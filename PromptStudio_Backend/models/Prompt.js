const mongoose = require('mongoose');

const PromptSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    input: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 1000
    },
    generatedPrompt: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['creative', 'marketing', 'coding', 'storytelling', 'business'],
        default: 'creative',
        index: true
    },
    model: {
        type: String,
        default: 'gemini-1.5-flash'
    },
    tokens: {
        type: Number,
        default: 0
    },
    options: {
        tone: String,
        length: String,
        format: String,
        temperature: Number,
        style: String
    },
    isEnhanced: {
        type: Boolean,
        default: false
    },
    originalPrompt: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Prompt'
    },
    enhancementType: {
        type: String,
        enum: ['detailed', 'concise', 'creative', 'professional', 'structured']
    },
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    usageCount: {
        type: Number,
        default: 0
    },
    lastUsedAt: Date
}, {
    timestamps: true
});

// Add indexes for better performance
PromptSchema.index({ createdAt: -1 });
PromptSchema.index({ user: 1, createdAt: -1 });
PromptSchema.index({ category: 1, createdAt: -1 });
PromptSchema.index({ tags: 1 });

// Virtual for prompt length
PromptSchema.virtual('inputLength').get(function() {
    return this.input.length;
});

PromptSchema.virtual('promptLength').get(function() {
    return this.generatedPrompt.length;
});

// Method to increment usage
PromptSchema.methods.incrementUsage = function() {
    this.usageCount += 1;
    this.lastUsedAt = new Date();
    return this.save();
};

// Method to add to favorites
PromptSchema.methods.addToFavorites = function(userId) {
    if (!this.favorites.includes(userId)) {
        this.favorites.push(userId);
    }
    return this.save();
};

// Method to remove from favorites
PromptSchema.methods.removeFromFavorites = function(userId) {
    this.favorites = this.favorites.filter(id => id.toString() !== userId.toString());
    return this.save();
};

module.exports = mongoose.model('Prompt', PromptSchema);