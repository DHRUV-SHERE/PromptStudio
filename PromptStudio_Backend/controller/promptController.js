const aiService = require('../services/aiService');
const Prompt = require('../models/Prompt');
const User = require('../models/UserModel');

// @desc    Generate AI prompt
// @route   POST /api/prompts/generate
// @access  Private
const generatePrompt = async (req, res) => {
    try {
        const { category, description, additionalDetails, customDetails } = req.body;
        const userId = req.userId;
        
        // Validation
        if (!category || !description) {
            return res.status(400).json({
                success: false,
                message: 'Please provide category and description'
            });
        }
        
        if (description.trim().length < 5) {
            return res.status(400).json({
                success: false,
                message: 'Description must be at least 5 characters'
            });
        }
        
        // Check daily usage limit
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        if (!user.checkDailyLimit()) {
            return res.status(429).json({
                success: false,
                message: 'Daily prompt limit reached. Try again tomorrow!',
                dailyUsage: `${user.dailyUsage.count}/${user.promptLimit}`
            });
        }
        
        // Build structured input for AI
        const structuredInput = {
            category,
            description,
            additionalDetails: additionalDetails || [],
            customDetails: customDetails || []
        };
        
        // Generate prompt using AI with embedded template
        const aiResult = await aiService.generateStructuredPrompt(structuredInput);
        
        // Save prompt to database
        const promptData = {
            user: userId,
            input: description,
            generatedPrompt: aiResult.prompt,
            category: category,
            model: aiResult.model,
            tokens: aiResult.tokens || 0,
            options: {
                additionalDetails: additionalDetails || [],
                customDetails: customDetails || []
            }
        };
        
        const savedPrompt = await Prompt.create(promptData);
        
        // Increment user's daily usage
        await user.incrementDailyUsage();
        
        res.status(200).json({
            success: true,
            message: 'Prompt generated successfully',
            data: {
                id: savedPrompt._id,
                generatedPrompt: aiResult.prompt,
                category: category,
                model: aiResult.model,
                provider: aiResult.provider,
                tokens: aiResult.tokens,
                online: aiResult.online,
                timestamp: aiResult.timestamp,
                dailyUsage: `${user.dailyUsage.count + 1}/${user.promptLimit}`
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
        
        res.status(200).json({
            success: result.success,
            message: `Generated ${result.successful} out of ${result.total} prompts`,
            data: {
                prompts: result.results,
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
        const { prompt, enhancementType } = req.body;
        
        if (!prompt) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a prompt to enhance'
            });
        }
        
        // Enhance the prompt
        const enhancedResult = await aiService.enhancePrompt(
            prompt,
            enhancementType || 'detailed'
        );
        
        res.status(200).json({
            success: true,
            message: 'Prompt enhanced successfully',
            data: {
                original: enhancedResult.original,
                enhanced: enhancedResult.enhanced,
                enhancementType: enhancedResult.enhancementType,
                improvement: enhancedResult.improvement,
                provider: enhancedResult.provider,
                timestamp: enhancedResult.timestamp
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
        const { page = 1, limit = 20, category, search } = req.query;
        
        // Build query
        const query = { user: userId };
        
        if (category && category !== 'all') {
            query.category = category;
        }
        
        if (search) {
            query.$or = [
                { input: { $regex: search, $options: 'i' } },
                { generatedPrompt: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Get prompts with pagination
        const prompts = await Prompt.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();
        
        // Get total count for pagination
        const total = await Prompt.countDocuments(query);
        
        // Get user for stats
        const user = await User.findById(userId);
        const today = new Date().toISOString().split('T')[0];
        
        // Calculate today's prompts
        const todaysPrompts = user.dailyUsage.date === today ? user.dailyUsage.count : 0;
        
        res.status(200).json({
            success: true,
            data: {
                prompts: prompts,
                pagination: {
                    total: total,
                    pages: Math.ceil(total / parseInt(limit)),
                    page: parseInt(page),
                    limit: parseInt(limit)
                },
                stats: {
                    totalPrompts: user.promptCount,
                    todaysPrompts: todaysPrompts,
                    totalTokens: 0, // Can be calculated if needed
                    dailyLimit: user.promptLimit,
                    remainingToday: Math.max(0, user.promptLimit - todaysPrompts)
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
        
        // Find and delete the prompt (only if it belongs to the user)
        const deletedPrompt = await Prompt.findOneAndDelete({
            _id: id,
            user: userId
        });
        
        if (!deletedPrompt) {
            return res.status(404).json({
                success: false,
                message: 'Prompt not found or unauthorized'
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
        
        // Find the prompt (only if it belongs to the user)
        const prompt = await Prompt.findOne({
            _id: id,
            user: userId
        }).lean();
        
        if (!prompt) {
            return res.status(404).json({
                success: false,
                message: 'Prompt not found or unauthorized'
            });
        }
        
        res.status(200).json({
            success: true,
            data: {
                prompt: prompt
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

// @desc    Get daily usage stats
// @route   GET /api/prompts/usage
// @access  Private
const getDailyUsage = async (req, res) => {
    try {
        const userId = req.userId;
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        const today = new Date().toISOString().split('T')[0];
        const todaysUsage = user.dailyUsage.date === today ? user.dailyUsage.count : 0;
        
        res.status(200).json({
            success: true,
            data: {
                dailyLimit: user.promptLimit,
                todaysUsage: todaysUsage,
                remainingToday: Math.max(0, user.promptLimit - todaysUsage),
                canGenerate: todaysUsage < user.promptLimit,
                totalPrompts: user.promptCount,
                isPremium: user.isPremium
            }
        });
        
    } catch (error) {
        console.error('Get daily usage error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch usage stats'
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
    getPrompt,
    getDailyUsage
};