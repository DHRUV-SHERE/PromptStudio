const aiService = require('../services/aiService');

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
        
        // Generate prompt using AI
        const aiResult = await aiService.generatePrompt(
            input,
            category || 'creative',
            options || {}
        );
        
        res.status(200).json({
            success: true,
            message: 'Prompt generated successfully',
            data: {
                input,
                generatedPrompt: aiResult.prompt,
                category: category || 'creative',
                model: aiResult.model,
                provider: aiResult.provider,
                tokens: aiResult.tokens,
                online: aiResult.online,
                timestamp: aiResult.timestamp
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
        // For now, return empty array - implement database later
        res.status(200).json({
            success: true,
            data: {
                prompts: [],
                pagination: {
                    total: 0,
                    pages: 0,
                    page: 1,
                    limit: 20
                },
                stats: {
                    totalPrompts: 0,
                    todaysPrompts: 0,
                    totalTokens: 0,
                    dailyLimit: 10,
                    remainingToday: 10
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
        
        // For now, just return success - implement database later
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
        
        // For now, return placeholder - implement database later
        res.status(200).json({
            success: true,
            data: {
                prompt: {
                    id: id,
                    input: "Sample input",
                    generatedPrompt: "This is a sample generated prompt",
                    category: "creative",
                    model: "ai-enhanced-offline",
                    createdAt: new Date().toISOString()
                }
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