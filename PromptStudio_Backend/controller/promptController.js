const aiService = require('../services/aiService');
const Prompt = require('../models/Prompt'); // We'll create this model
const User = require('../models/UserModel');

// @desc    Generate AI prompt
// @route   POST /api/prompts/generate
// @access  Private
const generatePrompt = async (req, res) => {
    try {
        const { input, category, options } = req.body;
        const userId = req.userId;
        
        // Validation
        if (!input || input.trim().length < 3) {
            return res.status(400).json({
                success: false,
                message: 'Please provide meaningful input (at least 3 characters)'
            });
        }
        
        // Check user's prompt limit (optional)
        const user = await User.findById(userId);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Count today's prompts
        const todaysPrompts = await Prompt.countDocuments({
            user: userId,
            createdAt: { $gte: today }
        });
        
        // Free tier limit: 10 prompts per day
        const MAX_DAILY_PROMPTS = 10;
        if (todaysPrompts >= MAX_DAILY_PROMPTS && user.role !== 'admin') {
            return res.status(429).json({
                success: false,
                message: `Daily limit reached (${MAX_DAILY_PROMPTS} prompts). Upgrade for unlimited access.`
            });
        }
        
        // Generate prompt using AI
        const aiResult = await aiService.generatePrompt(
            input,
            category || 'creative',
            options || {}
        );
        
        if (!aiResult.success) {
            return res.status(500).json({
                success: false,
                message: 'Failed to generate prompt'
            });
        }
        
        // Save to database
        const prompt = await Prompt.create({
            user: userId,
            input,
            generatedPrompt: aiResult.prompt,
            category: category || 'creative',
            model: aiResult.model,
            tokens: aiResult.tokens,
            options: options || {}
        });
        
        // Update user's prompt count
        await User.findByIdAndUpdate(userId, {
            $inc: { promptCount: 1 },
            lastPromptAt: new Date()
        });
        
        res.status(200).json({
            success: true,
            message: 'Prompt generated successfully',
            data: {
                id: prompt._id,
                input: prompt.input,
                generatedPrompt: prompt.generatedPrompt,
                category: prompt.category,
                model: prompt.model,
                tokens: prompt.tokens,
                createdAt: prompt.createdAt,
                dailyUsage: `${todaysPrompts + 1}/${MAX_DAILY_PROMPTS}`
            }
        });
        
    } catch (error) {
        console.error('Prompt generation error:', error);
        
        // Handle specific AI service errors
        if (error.message.includes('API key') || error.message.includes('quota')) {
            return res.status(503).json({
                success: false,
                message: 'AI service temporarily unavailable. Please try again later.'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to generate prompt. Please try again.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Batch generate prompts
// @route   POST /api/prompts/batch-generate
// @access  Private
const batchGeneratePrompts = async (req, res) => {
    try {
        const { inputs, category } = req.body;
        const userId = req.userId;
        
        if (!inputs || !Array.isArray(inputs) || inputs.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an array of inputs'
            });
        }
        
        // Limit batch size
        const MAX_BATCH_SIZE = 5;
        const batchInputs = inputs.slice(0, MAX_BATCH_SIZE);
        
        // Generate prompts
        const result = await aiService.batchGeneratePrompts(batchInputs, category || 'creative');
        
        // Save to database
        const savedPrompts = [];
        for (let i = 0; i < result.results.length; i++) {
            const prompt = await Prompt.create({
                user: userId,
                input: batchInputs[i],
                generatedPrompt: result.results[i].prompt,
                category: category || 'creative',
                model: result.results[i].model,
                tokens: result.results[i].tokens
            });
            savedPrompts.push(prompt);
        }
        
        res.status(200).json({
            success: result.success,
            message: `Generated ${result.successful} out of ${result.total} prompts`,
            data: {
                prompts: savedPrompts.map(p => ({
                    id: p._id,
                    input: p.input,
                    generatedPrompt: p.generatedPrompt,
                    category: p.category
                })),
                batchInfo: {
                    total: result.total,
                    successful: result.successful,
                    failed: result.errors.length
                },
                errors: result.errors
            }
        });
        
    } catch (error) {
        console.error('Batch generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate prompts',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Enhance existing prompt
// @route   POST /api/prompts/enhance
// @access  Private
const enhancePrompt = async (req, res) => {
    try {
        const { promptId, enhancementType } = req.body;
        const userId = req.userId;
        
        // Find the original prompt
        const originalPrompt = await Prompt.findOne({
            _id: promptId,
            user: userId
        });
        
        if (!originalPrompt) {
            return res.status(404).json({
                success: false,
                message: 'Prompt not found'
            });
        }
        
        // Enhance the prompt
        const enhancedResult = await aiService.enhancePrompt(
            originalPrompt.generatedPrompt,
            enhancementType || 'detailed'
        );
        
        if (!enhancedResult.success) {
            return res.status(500).json({
                success: false,
                message: 'Failed to enhance prompt'
            });
        }
        
        // Save enhanced version
        const enhancedPrompt = await Prompt.create({
            user: userId,
            input: originalPrompt.input,
            generatedPrompt: enhancedResult.enhanced,
            category: originalPrompt.category,
            model: enhancedResult.model,
            tokens: 0, // Can't track for enhancement
            isEnhanced: true,
            originalPrompt: originalPrompt._id,
            enhancementType: enhancementType || 'detailed'
        });
        
        res.status(200).json({
            success: true,
            message: 'Prompt enhanced successfully',
            data: {
                id: enhancedPrompt._id,
                original: originalPrompt.generatedPrompt,
                enhanced: enhancedPrompt.generatedPrompt,
                enhancementType: enhancedPrompt.enhancementType,
                improvement: Math.round(
                    (enhancedPrompt.generatedPrompt.length - originalPrompt.generatedPrompt.length) / 
                    originalPrompt.generatedPrompt.length * 100
                ) + '% longer'
            }
        });
        
    } catch (error) {
        console.error('Prompt enhancement error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to enhance prompt',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get user's prompt history
// @route   GET /api/prompts/history
// @access  Private
const getPromptHistory = async (req, res) => {
    try {
        const userId = req.userId;
        const { page = 1, limit = 20, category, sort = '-createdAt' } = req.query;
        
        const query = { user: userId };
        
        if (category && category !== 'all') {
            query.category = category;
        }
        
        const prompts = await Prompt.find(query)
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .select('input generatedPrompt category model tokens createdAt isEnhanced');
        
        const total = await Prompt.countDocuments(query);
        
        // Get usage stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todaysCount = await Prompt.countDocuments({
            user: userId,
            createdAt: { $gte: today }
        });
        
        const totalTokens = await Prompt.aggregate([
            { $match: { user: userId } },
            { $group: { _id: null, total: { $sum: '$tokens' } } }
        ]);
        
        res.status(200).json({
            success: true,
            data: {
                prompts,
                pagination: {
                    total,
                    pages: Math.ceil(total / limit),
                    page: parseInt(page),
                    limit: parseInt(limit)
                },
                stats: {
                    totalPrompts: total,
                    todaysPrompts: todaysCount,
                    totalTokens: totalTokens[0]?.total || 0,
                    dailyLimit: 10,
                    remainingToday: Math.max(0, 10 - todaysCount)
                }
            }
        });
        
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch prompt history'
        });
    }
};

// @desc    Get prompt categories
// @route   GET /api/prompts/categories
// @access  Public
const getCategories = (req, res) => {
    try {
        const categories = aiService.getCategories();
        
        const categoryDetails = {
            creative: {
                name: 'Creative',
                description: 'For artistic, imaginative, and original content',
                icon: '🎨',
                examples: ['Story ideas', 'Character descriptions', 'World building']
            },
            marketing: {
                name: 'Marketing',
                description: 'For persuasive and promotional content',
                icon: '📈',
                examples: ['Ad copy', 'Social media posts', 'Email campaigns']
            },
            coding: {
                name: 'Coding',
                description: 'For programming and technical prompts',
                icon: '💻',
                examples: ['Code explanations', 'Algorithm prompts', 'Debugging help']
            },
            storytelling: {
                name: 'Storytelling',
                description: 'For narrative and fiction writing',
                icon: '📖',
                examples: ['Plot development', 'Dialogue writing', 'Scene setting']
            },
            business: {
                name: 'Business',
                description: 'For professional and corporate content',
                icon: '💼',
                examples: ['Business plans', 'Reports', 'Professional emails']
            }
        };
        
        const formattedCategories = categories.map(cat => ({
            id: cat,
            ...categoryDetails[cat]
        }));
        
        res.status(200).json({
            success: true,
            data: {
                categories: formattedCategories,
                modelInfo: aiService.getModelInfo()
            }
        });
        
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch categories'
        });
    }
};

// @desc    Delete a prompt
// @route   DELETE /api/prompts/:id
// @access  Private
const deletePrompt = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        
        const prompt = await Prompt.findOneAndDelete({
            _id: id,
            user: userId
        });
        
        if (!prompt) {
            return res.status(404).json({
                success: false,
                message: 'Prompt not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Prompt deleted successfully'
        });
        
    } catch (error) {
        console.error('Delete prompt error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete prompt'
        });
    }
};

// @desc    Get single prompt
// @route   GET /api/prompts/:id
// @access  Private
const getPrompt = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        
        const prompt = await Prompt.findOne({
            _id: id,
            user: userId
        }).select('-__v');
        
        if (!prompt) {
            return res.status(404).json({
                success: false,
                message: 'Prompt not found'
            });
        }
        
        // If it's an enhanced prompt, get the original
        let originalPrompt = null;
        if (prompt.originalPrompt) {
            originalPrompt = await Prompt.findById(prompt.originalPrompt)
                .select('input generatedPrompt createdAt');
        }
        
        res.status(200).json({
            success: true,
            data: {
                prompt,
                original: originalPrompt
            }
        });
        
    } catch (error) {
        console.error('Get prompt error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch prompt'
        });
    }
};

module.exports = {
    generatePrompt,
    batchGeneratePrompts,
    enhancePrompt,
    getPromptHistory,
    getCategories,
    deletePrompt,
    getPrompt
};