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
            
            // Try different model names - gemini-2.0-flash is newer and more available
            // You can also try 'gemini-1.5-flash-8b' or 'gemini-1.5-flash-latest'
            const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash-latest';
            
            console.log(`Attempting to initialize model: ${modelName}`);
            
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
                model: 'gemini-ai',
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
                console.warn('Content blocked by safety filters. Using offline mode.');
                return this.generateOfflinePrompt(input, category, options);
            }
            if (error.message.includes('model') || error.message.includes('not found')) {
                console.warn('Model not found. Trying alternative approach or offline mode.');
                return this.generateOfflinePrompt(input, category, options);
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
        
        // Enhanced offline templates
        const baseTemplates = {
            creative: `## Creative Prompt Generator
**Theme:** ${input}

### Visual Specifications:
- **Style:** Digital art, cinematic composition
- **Color Palette:** Vibrant colors with contrasting highlights
- **Lighting:** Dynamic lighting with soft shadows
- **Atmosphere:** ${options.tone || 'Inspiring and imaginative'}
- **Composition:** Rule of thirds, balanced elements

### Key Elements:
1. Central subject based on "${input}"
2. Supporting elements that enhance the theme
3. Background that complements the main subject

### Technical Details:
- Resolution: 4K ultra HD
- Aspect Ratio: 16:9
- Render Quality: Photorealistic
- Style Reference: Trending digital art styles

### Additional Notes:
- Optimized for AI image generation models
- Includes specific artistic terminology
- Balanced between creativity and clarity`,
            
            marketing: `## Marketing Campaign Generator
**Product/Service:** ${input}

### Target Audience:
- Demographics: 25-45 years, tech-savvy professionals
- Interests: Innovation, productivity, digital tools
- Pain Points: Time management, efficiency, quality

### Key Messages:
1. Value Proposition: How "${input}" solves problems
2. Unique Selling Points: Key differentiators
3. Emotional Appeal: Benefits beyond features

### Campaign Elements:
- **Headline:** Attention-grabbing, benefit-focused
- **Subheadline:** Supporting details and features
- **Body Copy:** Persuasive storytelling
- **Call to Action:** Clear, compelling instruction

### Tone & Voice:
- ${options.tone || 'Professional yet approachable'}
- Confident but not pushy
- Benefit-oriented language

### Platform Adaptation:
- Social Media: Concise, visual, hashtag-friendly
- Email: Personalized, value-focused
- Website: SEO-optimized, conversion-focused`,
            
            coding: `## Programming Task Generator
**Task Description:** ${input}

### Requirements:
- **Language:** ${options.language || 'JavaScript/Python'}
- **Functionality:** ${input}
- **Input:** Clearly defined parameters and data types
- **Output:** Expected format and structure

### Specifications:
- **Performance:** Efficient algorithms, optimal complexity
- **Error Handling:** Graceful degradation, informative messages
- **Testing:** Unit tests, edge cases, integration tests
- **Documentation:** Code comments, API documentation

### Code Style:
- **Formatting:** Consistent indentation and naming
- **Structure:** Modular, reusable components
- **Best Practices:** Following language-specific guidelines

### Deliverables:
1. Working solution code
2. Test suite with comprehensive coverage
3. Documentation and usage examples
4. Performance metrics if applicable`,
            
            storytelling: `## Story Generator
**Concept:** ${input}

### Characters:
- **Protagonist:** Relatable character with clear motivations
- **Antagonist:** Compelling opposition with depth
- **Supporting Cast:** Characters that enhance the narrative

### Setting:
- **World:** ${options.style || 'Immersive and detailed'}
- **Time Period:** Contemporary/fantasy/futuristic
- **Location:** Vividly described environments

### Plot Structure:
- **Inciting Incident:** Event that starts the journey
- **Rising Action:** Challenges and developments
- **Climax:** Peak conflict and resolution
- **Falling Action:** Consequences and aftermath
- **Resolution:** Satisfying conclusion

### Themes:
- Central message or moral
- Character development arcs
- Symbolic elements

### Writing Style:
- **Narrative Voice:** ${options.tone || 'Engaging and descriptive'}
- **Pacing:** Balanced action and reflection
- **Dialogue:** Natural, character-revealing`,
            
            business: `## Business Strategy Generator
**Focus Area:** ${input}

### Analysis Framework:
- **SWOT Analysis:** Strengths, Weaknesses, Opportunities, Threats
- **Market Research:** Target market, competitors, trends
- **Financial Projections:** Revenue, costs, ROI

### Strategy Components:
- **Objectives:** SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound)
- **Tactics:** Actionable steps and initiatives
- **Timeline:** Phased implementation schedule

### Stakeholder Considerations:
- **Internal:** Team capabilities, resources, constraints
- **External:** Customers, partners, regulatory environment
- **Market:** Trends, opportunities, challenges

### Implementation Plan:
- **Phase 1:** Foundation and setup
- **Phase 2:** Core development
- **Phase 3:** Launch and scaling
- **Phase 4:** Optimization and growth

### Success Metrics:
- **KPIs:** Key performance indicators
- **Milestones:** Critical checkpoints
- **Reporting:** Progress tracking and analysis`
        };
        
        const basePrompt = baseTemplates[category] || baseTemplates.creative;
        
        // Enhance with options
        let enhancedPrompt = basePrompt;
        if (options.tone && !basePrompt.includes(options.tone)) {
            enhancedPrompt += `\n\n**Tone Enhancement:** ${options.tone}`;
        }
        if (options.length) {
            enhancedPrompt += `\n**Length Guideline:** ${options.length}`;
        }
        if (options.format && !basePrompt.includes('Format')) {
            enhancedPrompt += `\n**Format:** ${options.format}`;
        }
        if (options.style && !basePrompt.includes(options.style)) {
            enhancedPrompt += `\n**Style Reference:** ${options.style}`;
        }
        
        return {
            success: true,
            prompt: enhancedPrompt,
            category,
            model: 'offline-advanced',
            tokens: Math.floor(enhancedPrompt.length / 4), // Approximate token count
            online: false,
            note: 'Generated with enhanced offline templates. Add GEMINI_API_KEY for AI-powered prompts.'
        };
    }
    
    // Test the API connection with multiple model options
    async testConnection() {
        try {
            if (!process.env.GEMINI_API_KEY) {
                return {
                    success: false,
                    message: 'GEMINI_API_KEY is not configured',
                    mode: 'offline'
                };
            }
            
            if (!this.useAPI || !this.genAI) {
                return {
                    success: false,
                    message: 'API is disabled or not initialized',
                    mode: 'offline'
                };
            }
            
            console.log('Testing Gemini API connection...');
            
            // Try different models
            const testModels = [
                'gemini-1.5-flash-latest',
                'gemini-1.5-flash-8b',
                'gemini-1.0-pro',
                'gemini-1.5-pro',
                'gemini-2.0-flash-exp'
            ];
            
            for (const modelName of testModels) {
                try {
                    console.log(`Testing model: ${modelName}`);
                    const model = this.genAI.getGenerativeModel({ model: modelName });
                    const testPrompt = "Say 'Hello from PromptStudio' if you're working";
                    const result = await model.generateContent(testPrompt);
                    const response = await result.response;
                    const text = response.text();
                    
                    console.log(`✅ API Test Successful with model: ${modelName}`);
                    this.model = model; // Set the working model
                    return {
                        success: true,
                        message: `API connection successful with ${modelName}`,
                        model: modelName,
                        response: text,
                        mode: 'online'
                    };
                } catch (modelError) {
                    console.log(`Model ${modelName} failed: ${modelError.message}`);
                    continue;
                }
            }
            
            throw new Error('All model tests failed');
            
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
                'gemini-1.5-flash-latest',
                'gemini-1.5-flash-8b',
                'gemini-1.0-pro',
                'gemini-1.5-pro',
                'gemini-2.0-flash-exp'
            ],
            current: this.model ? 'dynamic' : 'offline',
            mode: this.useAPI ? 'online' : 'offline'
        };
    }
    
    // Get categories
    getCategories() {
        return Object.keys(this.templates);
    }
    
    // Get model info
    getModelInfo() {
        return {
            name: this.useAPI ? 'gemini-dynamic' : 'offline-advanced',
            status: this.useAPI ? 'online' : 'offline',
            maxTokens: 2048,
            temperature: 0.9,
            capabilities: this.useAPI ? ['text-generation', 'prompt-optimization'] : ['offline-generation', 'enhanced-templates'],
            provider: this.useAPI ? 'Google Gemini' : 'PromptStudio Offline Engine',
            note: this.useAPI ? null : 'Add GEMINI_API_KEY environment variable to enable AI generation'
        };
    }
}

// Create singleton instance
const aiService = new AIService();

module.exports = aiService;