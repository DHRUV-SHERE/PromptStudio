const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIService {
    constructor() {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not configured');
        }

        console.log('Initializing Gemini AI with key:', process.env.GEMINI_API_KEY ? 'Set' : 'Not set');

        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        // Use gemini-2.0-flash-exp as shown in your curl command
        this.model = this.genAI.getGenerativeModel({
            model: "gemini-1.5-flash",  // Updated model name
            generationConfig: {
                temperature: 0.9,
                topP: 0.8,
                topK: 40,
                maxOutputTokens: 2048,
            }
        });

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
            console.log(`Generating prompt for category: ${category}, input: "${input.substring(0, 50)}..."`);

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

            console.log('Sending request to Gemini...');

            // Generate content
            const result = await this.model.generateContent(finalPrompt);
            const response = await result.response;
            const generatedText = response.text();

            console.log('Received response from Gemini');

            return {
                success: true,
                prompt: generatedText,
                category,
                model: 'gemini-1.5-flash',
                tokens: response.usageMetadata?.totalTokenCount || 0
            };

        } catch (error) {
            console.error('AI generation error details:', error);

            // More detailed error handling
            if (error.message.includes('API key')) {
                throw new Error('Invalid or missing Gemini API key. Please check your .env file');
            }
            if (error.message.includes('quota')) {
                throw new Error('API quota exceeded. Please try again later.');
            }
            if (error.message.includes('safety')) {
                throw new Error('Content blocked by safety filters. Please modify your input.');
            }
            if (error.message.includes('model')) {
                throw new Error('Invalid model specified. Please check the model name.');
            }
            if (error.message.includes('network')) {
                throw new Error('Network error. Please check your internet connection.');
            }

            throw new Error(`AI generation failed: ${error.message}`);
        }
    }

    // Test the API connection
    async testConnection() {
        try {
            console.log('Testing Gemini API connection...');

            const testPrompt = "Say 'Hello' if you're working";
            const result = await this.model.generateContent(testPrompt);
            const response = await result.response;
            const text = response.text();

            console.log('API Test Successful:', text);
            return {
                success: true,
                message: 'API connection successful',
                response: text
            };
        } catch (error) {
            console.error('API Test Failed:', error.message);
            return {
                success: false,
                message: `API test failed: ${error.message}`
            };
        }
    }

    // Get available models
    async getAvailableModels() {
        try {
            // This requires different API call
            console.log('Fetching available models...');
            return {
                success: true,
                models: [
                    'gemini-2.0-flash-exp',
                    'gemini-1.5-flash',
                    'gemini-1.5-pro',
                    'gemini-1.0-pro'
                ],
                recommended: 'gemini-2.0-flash-exp'
            };
        } catch (error) {
            console.error('Failed to get models:', error);
            return {
                success: false,
                message: 'Failed to fetch models'
            };
        }
    }

    // ... rest of your methods (batchGeneratePrompts, enhancePrompt, etc.)
    async batchGeneratePrompts(inputs, category = 'creative') {
        try {
            const results = [];
            const errors = [];

            for (const input of inputs) {
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
                successful: results.length
            };
        } catch (error) {
            console.error('Batch generation error:', error);
            throw error;
        }
    }

    async enhancePrompt(prompt, enhancementType = 'detailed') {
        try {
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
                model: 'gemini-2.0-flash-exp',
                enhancementType
            };
        } catch (error) {
            console.error('Enhancement error:', error);
            throw error;
        }
    }

    getCategories() {
        return Object.keys(this.templates);
    }

    getModelInfo() {
        return {
            name: 'gemini-2.0-flash-exp',
            maxTokens: 2048,
            temperature: 0.9,
            capabilities: ['text-generation', 'prompt-optimization'],
            provider: 'Google Gemini'
        };
    }
}

// Create singleton instance
const aiService = new AIService();

module.exports = aiService;