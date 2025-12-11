const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIService {
    constructor() {
        if (!process.env.GEMINI_API_KEY) {
            console.warn('⚠️ GEMINI_API_KEY is not configured. Using offline mode.');
            this.useAPI = false;
            return;
        }
        
        console.log(`Initializing Gemini AI (${process.env.NODE_ENV || 'development'})`);
        
        try {
            this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            
            // Try gemini-1.5-flash first (better free tier limits)
            const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
            
            this.model = this.genAI.getGenerativeModel({ 
                model: modelName,
                generationConfig: {
                    temperature: 0.9,
                    topP: 0.8,
                    topK: 40,
                    maxOutputTokens: 2048,
                }
            });
            
            this.useAPI = process.env.USE_GEMINI_API !== 'false';
            console.log(`✅ Gemini AI initialized with model: ${modelName}`);
            console.log(`🔧 API Mode: ${this.useAPI ? 'Online' : 'Offline'}`);
            
        } catch (error) {
            console.error('Failed to initialize Gemini:', error.message);
            this.useAPI = false;
        }
        
        // Prompt templates
        this.templates = {
            creative: `You are a creative AI prompt engineer. Generate a detailed, engaging prompt based on the user's input. 
The prompt should be optimized for AI models like GPT-4, Claude, or Midjourney.
Include specific details, style references, and desired output format.

User input: {input}

Generate a comprehensive prompt:`,
            
            marketing: `You are a marketing expert. Create a compelling marketing prompt based on the user's requirements.
Focus on persuasive language, target audience, and call-to-action.

User input: {input}

Generate a marketing prompt:`,
            
            coding: `You are a programming assistant. Create a coding prompt that clearly specifies requirements, 
programming language, expected output format, and edge cases.

User input: {input}

Generate a coding prompt:`,
            
            storytelling: `You are a creative writer. Craft a storytelling prompt that sets up characters, 
setting, plot elements, and desired narrative style.

User input: {input}

Generate a storytelling prompt:`,
            
            business: `You are a business consultant. Create a professional business prompt for analysis, 
strategy, or planning purposes.

User input: {input}

Generate a business prompt:`
        };
    }
    
    async generatePrompt(input, category = 'creative', options = {}) {
        try {
            console.log(`📝 Generating prompt for category: ${category}`);
            
            // If API is disabled or not initialized, use offline mode
            if (!this.useAPI || !this.model) {
                console.log('📴 Using offline prompt generation');
                return this.generateOfflinePrompt(input, category, options);
            }
            
            // Get template based on category
            const template = this.templates[category] || this.templates.creative;
            
            // Prepare the prompt
            const fullPrompt = template.replace('{input}', input);
            
            // Add additional instructions if provided
            let finalPrompt = fullPrompt;
            if (options.tone) {
                finalPrompt += `\nTone: ${options.tone}`;
            }
            if (options.length) {
                finalPrompt += `\nLength: ${options.length}`;
            }
            if (options.format) {
                finalPrompt += `\nFormat: ${options.format}`;
            }
            if (options.style) {
                finalPrompt += `\nStyle: ${options.style}`;
            }
            
            console.log('🚀 Sending request to Gemini AI...');
            
            // Generate content
            const result = await this.model.generateContent(finalPrompt);
            const response = await result.response;
            const generatedText = response.text();
            
            console.log('✅ Received response from Gemini');
            
            return {
                success: true,
                prompt: generatedText,
                category,
                model: 'gemini-1.5-flash',
                tokens: response.usageMetadata?.totalTokenCount || 0,
                online: true
            };
            
        } catch (error) {
            console.error('❌ AI generation error:', error.message);
            
            // More detailed error handling
            if (error.message.includes('API key') || error.message.includes('API_KEY')) {
                console.warn('Invalid or missing Gemini API key');
                return this.generateOfflinePrompt(input, category, options);
            }
            if (error.message.includes('quota') || error.status === 429) {
                console.warn('API quota exceeded. Switching to offline mode.');
                return this.generateOfflinePrompt(input, category, options);
            }
            if (error.message.includes('safety')) {
                throw new Error('Content blocked by safety filters. Please modify your input.');
            }
            if (error.message.includes('network')) {
                console.warn('Network error. Using offline mode.');
                return this.generateOfflinePrompt(input, category, options);
            }
            
            console.warn('Falling back to offline generation');
            return this.generateOfflinePrompt(input, category, options);
        }
    }
    
    // Offline prompt generation fallback
    generateOfflinePrompt(input, category = 'creative', options = {}) {
        console.log('🔄 Generating offline prompt');
        
        const baseTemplates = {
            creative: `Create a detailed AI image generation prompt for: "${input}"

Specify:
• Visual style and composition
• Color palette and lighting
• Art style (photorealistic, digital art, painting, etc.)
• Mood and atmosphere
• Key elements to include
• Technical specifications (aspect ratio, resolution, etc.)

Make it descriptive and specific.`,
            
            marketing: `Create a marketing campaign prompt for: "${input}"

Include:
• Target audience demographics
• Key messaging and value proposition
• Call to action
• Tone and voice guidelines
• Platform-specific adaptations
• Success metrics`,
            
            coding: `Create a programming task prompt for: "${input}"

Specify:
• Programming language
• Required functionality
• Input/output format
• Error handling requirements
• Performance expectations
• Testing requirements
• Code style guidelines`,
            
            storytelling: `Create a storytelling prompt for: "${input}"

Develop:
• Main characters with motivations
• Setting and world-building details
• Central conflict and plot progression
• Themes and symbolism
• Narrative style (first-person, third-person, etc.)
• Pacing and structure`,
            
            business: `Create a business analysis prompt for: "${input}"

Cover:
• Problem statement and context
• Stakeholder analysis
• Data requirements and sources
• Analytical framework
• Expected deliverables
• Timeline and milestones
• Risk assessment`
        };
        
        const basePrompt = baseTemplates[category] || baseTemplates.creative;
        
        let enhancedPrompt = basePrompt;
        if (options.tone) enhancedPrompt += `\n\nTone: ${options.tone}`;
        if (options.length) enhancedPrompt += `\nLength: ${options.length}`;
        if (options.format) enhancedPrompt += `\nFormat: ${options.format}`;
        if (options.style) enhancedPrompt += `\nStyle: ${options.style}`;
        
        return {
            success: true,
            prompt: enhancedPrompt,
            category,
            model: 'offline-fallback',
            tokens: 0,
            online: false,
            note: 'Generated offline. Enable API key for enhanced AI-generated prompts.'
        };
    }
    
    // Test the API connection
    async testConnection() {
        try {
            if (!this.useAPI || !this.model) {
                return {
                    success: false,
                    message: 'API is disabled or not initialized',
                    mode: 'offline'
                };
            }
            
            console.log('Testing Gemini API connection...');
            
            const testPrompt = "Say 'Hello from PromptStudio' if you're working";
            const result = await this.model.generateContent(testPrompt);
            const response = await result.response;
            const text = response.text();
            
            console.log('✅ API Test Successful');
            return {
                success: true,
                message: 'API connection successful',
                response: text,
                mode: 'online'
            };
        } catch (error) {
            console.error('❌ API Test Failed:', error.message);
            return {
                success: false,
                message: `API test failed: ${error.message}`,
                mode: 'error'
            };
        }
    }
    
    // Get available models
    getAvailableModels() {
        return {
            success: true,
            models: [
                'gemini-1.5-flash',
                'gemini-1.5-pro',
                'gemini-1.0-pro'
            ],
            current: 'gemini-1.5-flash',
            mode: this.useAPI ? 'online' : 'offline'
        };
    }
    
    // Batch generate prompts
    async batchGeneratePrompts(inputs, category = 'creative') {
        try {
            const results = [];
            const errors = [];
            
            for (const input of inputs.slice(0, 5)) { // Limit to 5 per batch
                try {
                    const result = await this.generatePrompt(input, category);
                    results.push(result);
                } catch (error) {
                    errors.push({ input, error: error.message });
                }
            }
            
            return {
                success: results.length > 0,
                results,
                errors,
                total: inputs.length,
                successful: results.length,
                mode: this.useAPI ? 'online' : 'offline'
            };
        } catch (error) {
            console.error('Batch generation error:', error);
            throw error;
        }
    }
    
    // Enhance existing prompt
    async enhancePrompt(prompt, enhancementType = 'detailed') {
        try {
            if (!this.useAPI || !this.model) {
                return {
                    success: true,
                    enhanced: prompt,
                    model: 'offline-fallback',
                    enhancementType,
                    note: 'API disabled - returning original prompt'
                };
            }
            
            const enhancementPrompts = {
                detailed: `You are a prompt enhancement specialist. Take the following prompt and make it more detailed, specific, and comprehensive. Add relevant details, context, and specifications:\n\nOriginal Prompt: ${prompt}\n\nEnhanced Prompt:`,
                concise: `Make this prompt more concise while preserving all essential information:\n\n${prompt}\n\nConcise version:`,
                creative: `Add creative flair and imaginative elements to this prompt:\n\n${prompt}\n\nCreative version:`,
                professional: `Make this prompt more professional and business-appropriate:\n\n${prompt}\n\nProfessional version:`,
                structured: `Add structure, bullet points, and clear sections to this prompt:\n\n${prompt}\n\nStructured version:`
            };
            
            const enhanceTemplate = enhancementPrompts[enhancementType] || enhancementPrompts.detailed;
            
            const result = await this.model.generateContent(enhanceTemplate);
            const response = await result.response;
            const enhanced = response.text();
            
            return {
                success: true,
                enhanced,
                model: 'gemini-1.5-flash',
                enhancementType
            };
        } catch (error) {
            console.error('Enhancement error:', error);
            return {
                success: true,
                enhanced: prompt,
                model: 'offline-fallback',
                enhancementType,
                note: 'Enhancement failed - returning original prompt'
            };
        }
    }
    
    // Get categories
    getCategories() {
        return Object.keys(this.templates);
    }
    
    // Get model info
    getModelInfo() {
        return {
            name: this.useAPI ? 'gemini-1.5-flash' : 'offline-fallback',
            status: this.useAPI ? 'online' : 'offline',
            maxTokens: 2048,
            temperature: 0.9,
            capabilities: this.useAPI ? ['text-generation', 'prompt-optimization'] : ['offline-generation'],
            provider: this.useAPI ? 'Google Gemini' : 'Offline Engine',
            note: this.useAPI ? null : 'Add GEMINI_API_KEY to enable AI generation'
        };
    }
    
    // Toggle API mode
    toggleAPIMode(enabled) {
        this.useAPI = enabled;
        return {
            success: true,
            message: `API mode ${enabled ? 'enabled' : 'disabled'}`,
            mode: enabled ? 'online' : 'offline'
        };
    }
}

// Create singleton instance
const aiService = new AIService();

module.exports = aiService;