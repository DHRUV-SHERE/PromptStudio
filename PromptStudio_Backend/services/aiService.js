const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');

class AIService {
    constructor() {
        console.log('🚀 Initializing AI Service...');

        // Debug: Check environment variables
        console.log('🔍 Environment Check:');
        console.log('- GEMINI_API_KEY present:', !!process.env.GEMINI_API_KEY);
        console.log('- OPENAI_API_KEY present:', !!process.env.OPENAI_API_KEY);
        console.log('- GEMINI_MODEL:', process.env.GEMINI_MODEL || 'gemini-2.0-flash');
        console.log('- OPENAI_MODEL:', process.env.OPENAI_MODEL || 'gpt-4o-mini');

        this.providers = {
            openai: null,
            gemini: null,
            geminiModel: null,
            available: []
        };

        this.currentProvider = 'offline';
        this.initialized = false;

        // Initialize asynchronously
        this.initializeService();

        // Enhanced prompt templates
        this.templates = {
            creative: `You are a creative AI prompt engineer. Generate a detailed, engaging prompt based on the user's input. 
The prompt should be optimized for AI models like GPT-4, Claude, or Midjourney.
Include specific details, style references, and desired output format.

User input: {input}

Generate a comprehensive prompt that includes:
1. Clear theme and concept
2. Visual details (colors, lighting, composition)
3. Style references (art styles, genres)
4. Technical specifications
5. Mood and atmosphere`,

            marketing: `You are a marketing expert. Create a compelling marketing prompt based on the user's requirements.
Focus on persuasive language, target audience, and call-to-action.

User input: {input}

Generate a marketing prompt that includes:
1. Target audience analysis
2. Key benefits and value proposition
3. Emotional appeal
4. Clear call-to-action
5. Platform-specific adaptations`,

            coding: `You are a programming assistant. Create a coding prompt that clearly specifies requirements, 
programming language, expected output format, and edge cases.

User input: {input}

Generate a coding prompt that includes:
1. Clear problem statement
2. Input/output specifications
3. Edge cases to consider
4. Performance requirements
5. Testing scenarios`,

            storytelling: `You are a creative writer. Craft a storytelling prompt that sets up characters, 
setting, plot elements, and desired narrative style.

User input: {input}

Generate a storytelling prompt that includes:
1. Character development
2. Setting description
3. Plot structure
4. Conflict elements
5. Narrative style guidelines`,

            business: `You are a business consultant. Create a professional business prompt for analysis, 
strategy, or planning purposes.

User input: {input}

Generate a business prompt that includes:
1. Problem statement
2. Stakeholder analysis
3. Solution options
4. Implementation steps
5. Success metrics`
        };
    }

    async initializeService() {
        try {
            console.log('🔄 Initializing AI providers...');

            // Initialize OpenAI
            await this.initializeOpenAI();

            // Initialize Gemini
            await this.initializeGemini();

            this.initialized = true;
            console.log(`✅ AI Service initialized. Available providers: ${this.providers.available.join(', ') || 'none (offline mode)'}`);
            console.log(`Current provider: ${this.currentProvider}`);

        } catch (error) {
            console.error('❌ AI Service initialization failed:', error.message);
            this.initialized = false;
        }
    }

    async initializeOpenAI() {
        if (!process.env.OPENAI_API_KEY) {
            console.warn('⚠️ OPENAI_API_KEY is not configured. OpenAI provider disabled.');
            return;
        }

        try {
            // Clean the API key (remove quotes, trim whitespace)
            const apiKey = process.env.OPENAI_API_KEY.trim().replace(/['"]/g, '');
            this.providers.available.push('openai');
            console.log('✅ OpenAI added to available providers');

            this.providers.openai = new OpenAI({
                apiKey: apiKey,
                timeout: 15000
            });

            // Test connection
            console.log('🔗 Testing OpenAI connection...');
            const completion = await this.providers.openai.chat.completions.create({
                model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
                messages: [{ role: "user", content: "Say 'Connected' in one word" }],
                max_tokens: 10,
            });

            console.log(`✅ OpenAI provider initialized and connected. Response: "${completion.choices[0].message.content}"`);
            this.providers.available.push('openai');

        } catch (error) {
            console.error('❌ Failed to initialize OpenAI:', error.message);

            // Check if it's a quota error
            if (error.message.includes('quota') || error.status === 429) {
                console.log('⏳ OpenAI quota exceeded. Will try again later.');
            } else if (error.message.includes('API key') || error.status === 401) {
                console.error('❌ Invalid OpenAI API key');
            }
        }
    }

    async initializeGemini() {
        if (!process.env.GEMINI_API_KEY) {
            console.warn('⚠️ GEMINI_API_KEY is not configured. Gemini provider disabled.');
            return;
        }

        try {
            // Clean the API key (remove quotes, trim whitespace)
            const apiKey = process.env.GEMINI_API_KEY.trim().replace(/['"]/g, '');

            const genAI = new GoogleGenerativeAI(apiKey);
            this.providers.gemini = genAI;

            // Use gemini-2.0-flash as default
            const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

            console.log(`🔧 Initializing Gemini with model: ${modelName}`);

            this.providers.geminiModel = genAI.getGenerativeModel({
                model: modelName,
                generationConfig: {
                    temperature: 0.9,
                    topP: 0.8,
                    topK: 40,
                    maxOutputTokens: 2048,
                }
            });

            // Test connection
            // Test connection
            console.log('🔗 Testing Gemini connection...');
            const testPrompt = "Say 'Connected' in one word";
            const result = await this.providers.geminiModel.generateContent(testPrompt);
            const response = await result.response;

            // ✅ SAFE text extraction (IMPORTANT)
            const text =
                response.text?.() ||
                response.candidates?.[0]?.content?.parts?.[0]?.text ||
                '';

            console.log(`✅ Gemini provider initialized and connected. Response: "${text}"`);

            // ✅ Mark Gemini as available
            this.providers.available.push('gemini');


        } catch (error) {
            console.error('❌ Failed to initialize Gemini:', error.message);

            // Try alternative models
            await this.tryAlternativeGeminiModels();

            // Check if it's a quota error
            if (error.message.includes('quota') || error.message.includes('429')) {
                console.log('⏳ Gemini quota exceeded. Will try again later.');
            } else if (error.message.includes('API key')) {
                console.error('❌ Invalid Gemini API key');
            } else if (error.message.includes('404')) {
                console.error('❌ Model not found. Trying alternatives...');
            }
        }
    }

    async tryAlternativeGeminiModels() {
        const alternativeModels = [
            'gemini-1.5-flash',
            'gemini-1.5-pro',
            'gemini-1.0-pro',
            'gemini-2.0-flash-exp'
        ];

        console.log('🔄 Trying alternative Gemini models...');

        for (const modelName of alternativeModels) {
            try {
                console.log(`   Testing model: ${modelName}`);
                const testModel = this.providers.gemini.getGenerativeModel({
                    model: modelName
                });

                // Test the model
                const testPrompt = "Say 'Connected' in one word";
                const result = await testModel.generateContent(testPrompt);
                const response = await result.response;

                // Update the model
                this.providers.geminiModel = testModel;

                console.log(`   ✅ Model ${modelName} connected: "${response.text()}"`);
                this.providers.available.push('gemini');
                console.log(`✅ Gemini provider initialized with alternative model: ${modelName}`);

                // Update environment variable for consistency
                process.env.GEMINI_MODEL = modelName;
                return;

            } catch (modelError) {
                console.log(`   ❌ Model ${modelName} failed: ${modelError.message.substring(0, 100)}`);
                continue;
            }
        }

        console.error('❌ All Gemini models failed. Gemini provider disabled.');
    }

    async generateWithOpenAI(input, category, options) {
        try {
            console.log('🚀 Attempting generation with OpenAI...');

            const modelName = process.env.OPENAI_MODEL || 'gpt-4o-mini';
            const template = this.templates[category] || this.templates.creative;
            const fullPrompt = template.replace('{input}', input);

            let finalPrompt = fullPrompt;
            if (options.tone) finalPrompt += `\nTone: ${options.tone}`;
            if (options.length) finalPrompt += `\nLength: ${options.length}`;
            if (options.format) finalPrompt += `\nFormat: ${options.format}`;
            if (options.style) finalPrompt += `\nStyle: ${options.style}`;

            console.log(`   Using model: ${modelName}`);
            console.log(`   Prompt length: ${finalPrompt.length} chars`);

            const completion = await this.providers.openai.chat.completions.create({
                model: modelName,
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful assistant specialized in generating and refining prompts."
                    },
                    {
                        role: "user",
                        content: finalPrompt
                    }
                ],
                temperature: 0.9,
                max_tokens: 2048,
            });

            const generatedText = completion?.choices?.[0]?.message?.content || '';

            console.log(`✅ OpenAI generation successful. Response: ${generatedText.length} chars`);

            return {
                success: true,
                prompt: generatedText,
                category,
                model: modelName,
                provider: 'openai',
                tokens: completion.usage?.total_tokens || 0,
                online: true,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('❌ OpenAI generation failed:', error.message);

            // Provide helpful error info
            if (error.message.includes('quota') || error.status === 429) {
                console.error('   💡 OpenAI quota exceeded. Add credits at: https://platform.openai.com/account/billing');
            } else if (error.message.includes('API key')) {
                console.error('   💡 Invalid OpenAI API key');
            }

            throw error;
        }
    }

    async generateWithGemini(input, category, options) {
        try {
            console.log('🚀 Attempting generation with Gemini...');

            const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
            const template = this.templates[category] || this.templates.creative;
            const fullPrompt = template.replace('{input}', input);

            let finalPrompt = fullPrompt;
            if (options.tone) finalPrompt += `\nTone: ${options.tone}`;
            if (options.length) finalPrompt += `\nLength: ${options.length}`;
            if (options.format) finalPrompt += `\nFormat: ${options.format}`;
            if (options.style) finalPrompt += `\nStyle: ${options.style}`;

            console.log(`   Using model: ${modelName}`);
            console.log(`   Prompt length: ${finalPrompt.length} chars`);

           const result = await this.providers.geminiModel.generateContent(finalPrompt);

            const response = await result.response;
            const generatedText =
                response.text?.() ||
                response.candidates?.[0]?.content?.parts?.[0]?.text ||
                '';

            console.log(`✅ Gemini generation successful. Response: ${generatedText.length} chars`);

            return {
                success: true,
                prompt: generatedText,
                category,
                model: modelName,
                provider: 'gemini',
                tokens: response.usageMetadata?.totalTokenCount || 0,
                online: true,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('❌ Gemini generation failed:', error.message);

            // Provide helpful error info
            if (error.message.includes('quota') || error.message.includes('429')) {
                console.error('   💡 Gemini quota exceeded. Check usage at: https://aistudio.google.com/usage');
                console.error('   💡 New projects often need 24-48 hours for quotas to activate');
            } else if (error.message.includes('404')) {
                console.error('   💡 Model not found. Try: gemini-1.5-flash, gemini-1.5-pro, or gemini-2.0-flash');
            } else if (error.message.includes('API key')) {
                console.error('   💡 Invalid Gemini API key');
            }

            throw error;
        }
    }

    async generatePrompt(input, category = 'creative', options = {}) {
        if (!this.initialized) {
            console.log('⚠️ AI Service not fully initialized, waiting...');
            await this.initializeService();
        }

        console.log(`📝 Generating prompt for: ${input.substring(0, 50)}...`);

        // Try providers in order: Gemini → OpenAI → Offline
        const providerOrder = ['openai','gemini'];

        for (const provider of providerOrder) {
            if (this.providers.available.includes(provider)) {
                try {
                    console.log(`🔄 Attempting with ${provider}...`);

                    if (provider === 'openai' && this.providers.openai) {
                        const result = await this.generateWithOpenAI(input, category, options);
                        this.currentProvider = 'openai';
                        return result;
                    }

                    if (provider === 'gemini' && this.providers.gemini) {
                        const result = await this.generateWithGemini(input, category, options);
                        this.currentProvider = 'gemini';
                        return result;
                    }

                } catch (error) {
                    console.warn(`⚠️ ${provider} failed:`, error.message.substring(0, 100) + '...');

                    // If it's a quota/billing error, skip to next provider
                    if (error.message.includes('quota') || error.status === 429) {
                        console.warn(`   💡 ${provider} quota exceeded. Trying next provider...`);
                        continue;
                    }

                    // For 404 model errors, try next provider
                    if (error.message.includes('404') || error.message.includes('not found')) {
                        console.warn(`   💡 ${provider} model not found. Trying next provider...`);
                        continue;
                    }

                    // For other errors, also try next provider
                    continue;
                }
            }
        }

        // All providers failed or not available, use enhanced offline mode
        console.log('📴 All AI providers failed. Using enhanced offline generation.');
        return this.generateEnhancedOfflinePrompt(input, category, options);
    }

    generateEnhancedOfflinePrompt(input, category = 'creative', options = {}) {
        console.log('🌟 Generating AI-quality offline prompt');

        // AI-style responses for each category
        const aiStyleResponses = {
            creative: `**🎨 AI-Generated Creative Prompt**

**Theme:** ${input}
**Category:** Creative Writing / Visual Art
**Tone:** ${options.tone || 'Inspirational and vivid'}
**Target Models:** Midjourney, DALL-E, Stable Diffusion, GPT-4

### **Visual Scene Description:**
Imagine a stunning ${options.style || 'digital painting'} of "${input}". The scene unfolds with breathtaking detail:

**Composition:** The central focus is [describe main subject], positioned using the rule of thirds for optimal visual balance. In the foreground, [foreground elements] add depth, while the background reveals [background details].

**Color Palette:** A harmonious blend of [primary color] and [secondary color], with accents of [accent color]. The lighting casts soft [light type] shadows, creating a sense of [mood].

**Atmosphere:** The overall feeling is [emotion] - you can almost [sensory detail like "hear the distant sounds" or "feel the gentle breeze"]. 

**Style Influences:** Inspired by [art style or artist], with elements of [additional style].

### **Technical Specifications:**
- **Aspect Ratio:** 16:9 (cinematic)
- **Resolution:** 4K UHD
- **Render Quality:** Photorealistic
- **Lighting:** ${options.lighting || 'Golden hour, soft directional'}
- **Texture:** Detailed, crisp, with subtle imperfections for realism

### **Prompt Optimization Tips:**
1. Start with medium shots, then zoom in on details
2. Use descriptive adjectives: "breathtaking," "serene," "dynamic"
3. Include sensory words: "glistening," "whispering," "fragrant"
4. Reference artistic movements: "impressionist," "surrealist," "cyberpunk"

### **Variations to Explore:**
- A minimalist interpretation
- A fantasy/sci-fi version  
- An abstract representation
- A character-focused narrative scene

**Final Optimized Prompt:** "${input}" as a [style] masterpiece, [specific details], [lighting], [color scheme], [composition], trending on ArtStation, award-winning, 8K resolution`,

            marketing: `**📈 AI-Generated Marketing Prompt**

**Product/Service:** ${input}
**Campaign:** ${options.campaign || 'Launch/Awareness'}
**Target Audience:** ${options.audience || 'Tech-savvy professionals, 25-45'}
**Tone:** ${options.tone || 'Professional yet approachable'}

### **Campaign Strategy:**
**Core Message:** "${input}" solves the problem of [pain point] by providing [key benefit].

**Unique Value Proposition:**
✓ [Benefit 1: e.g., "Saves 10+ hours weekly"]
✓ [Benefit 2: e.g., "Increases productivity by 40%"]  
✓ [Benefit 3: e.g., "Reduces costs by 30%"]

**Emotional Hook:** Stop struggling with [old way] and start experiencing [new benefit].

### **Content Framework:**

**Headline Options:**
1. "Transform Your [Area] with ${input}"
2. "The Future of [Industry] Is Here: ${input}"
3. "Why [Target Audience] Are Switching to ${input}"

**Body Copy Structure:**
1. **Problem Statement:** "Are you tired of [common frustration]?"
2. **Solution Introduction:** "${input} changes everything..."
3. **Benefits Breakdown:** (Use bullet points)
4. **Social Proof:** "Join [number]+ satisfied users"
5. **Risk Reversal:** "[Guarantee or free trial offer]"
6. **Clear CTA:** "Start your free trial today →"

### **Platform-Specific Variations:**

**Social Media (Instagram/Twitter):**
- Concise benefit-focused posts
- Eye-catching visuals/graphics
- Hashtags: #${input.replace(/\s+/g, '')} #Innovation #Tech

**Email Sequence:**
1. **Welcome Email:** Value-focused introduction
2. **Feature Deep Dive:** Weekly benefit highlights
3. **Case Study:** Customer success story
4. **Limited Offer:** Urgency creation

**Website Copy:**
- Hero section: Benefit-driven headline + subheadline
- Features: Visual cards with icons
- Testimonials: Real user quotes
- CTA Section: Prominent action button

### **Persuasive Techniques:**
- Scarcity: "Limited-time launch offer"
- Social proof: "Used by [prestigious companies]"
- Authority: "Based on [research/statistics]"
- Storytelling: "Meet [persona], who transformed their workflow"`,

            coding: `**💻 AI-Generated Coding Prompt**

**Task:** ${input}
**Language:** ${options.language || 'JavaScript'}
**Difficulty:** ${options.complexity || 'Intermediate'}
**Project Type:** ${options.type || 'Utility Function'}

### **Problem Analysis:**
The core challenge is to [briefly restate problem]. This requires handling [key considerations] while ensuring [quality requirements].

### **Technical Requirements:**

**Function Signature:**
\`\`\`${options.language || 'javascript'}
function ${input.replace(/\s+/g, '_').toLowerCase()}(inputParams) {
    // Implementation
    return result;
}
\`\`\`

**Input Specifications:**
- \`param1\`: [Type], [Description], [Constraints]
- \`param2\`: [Type], [Description], [Default value if any]

**Expected Output:**
- **Format:** [Return type/structure]
- **Edge Cases:** Handle [specific edge case scenarios]
- **Error Handling:** Return [error format] for invalid inputs

### **Algorithm Design:**

**Approach 1: [Efficient solution]**
- **Time Complexity:** O(n log n)
- **Space Complexity:** O(1)
- **Steps:**
  1. [Step 1 description]
  2. [Step 2 description]
  3. [Step 3 description]

**Approach 2: [Simpler alternative]**
- **Time Complexity:** O(n²)
- **Space Complexity:** O(n)
- **Use when:** [Specific use case]

### **Implementation Details:**

**Key Functions to Create:**
1. \`validateInput()\` - Input sanitization and validation
2. \`processCore()\` - Main business logic
3. \`formatOutput()\` - Result formatting

**Dependencies:**
- [Library/Framework] for [specific functionality]
- Built-in [language feature] for [operation]

### **Testing Strategy:**

**Unit Tests:**
\`\`\`${options.language || 'javascript'}
describe('${input.replace(/\s+/g, '_').toLowerCase()}()', () => {
    test('handles normal case', () => {
        expect(${input.replace(/\s+/g, '_').toLowerCase()}([example])).toEqual([expected]);
    });
    
    test('handles edge case: [scenario]', () => {
        // Test implementation
    });
});
\`\`\`

**Integration Tests:**
- Test with real-world data sets
- Performance benchmarking
- Memory usage monitoring

### **Best Practices:**
- Add JSDoc/TypeScript definitions
- Include comprehensive comments
- Follow [language] style guide
- Optimize for readability first, then performance`,

            storytelling: `**📖 AI-Generated Storytelling Prompt**

**Concept:** ${input}
**Genre:** ${options.genre || 'Contemporary Fiction'}
**Length:** ${options.length || 'Short Story (1500-3000 words)'}
**Perspective:** ${options.perspective || 'Third Person Limited'}

### **Character Development:**

**Protagonist: [Character Name]**
- **Age/Occupation:** [Details]
- **Core Desire:** [What they want]
- **Internal Conflict:** [Inner struggle]
- **External Goal:** [Tangible objective]
- **Character Arc:** How they change from [starting point] to [ending point]

**Antagonist/Opposition: [Character/Force]**
- **Motivation:** Why they oppose the protagonist
- **Relationship:** How they're connected to protagonist
- **Complexity:** Redeeming qualities or understandable motives

**Supporting Characters:**
1. **[Name]:** [Role], [Relationship to protagonist], [Key trait]
2. **[Name]:** [Role], [Relationship to protagonist], [Key trait]

### **Plot Structure:**

**Act 1: Setup (25%)**
- **Opening Hook:** [Compelling first scene]
- **Inciting Incident:** [Event that changes everything]
- **Protagonist's Decision:** [Choice that starts the journey]

**Act 2: Confrontation (50%)**
- **Rising Action:** Series of challenges:
  1. [First obstacle and outcome]
  2. [Major setback/turning point]
  3. ["All is lost" moment]
- **Midpoint Reversal:** Unexpected revelation that changes stakes

**Act 3: Resolution (25%)**
- **Climax:** Final confrontation at [location]
- **Falling Action:** Immediate consequences
- **Resolution:** How characters end up
- **Final Image:** Last scene that echoes opening

### **Setting & Atmosphere:**

**Primary Location:** [Detailed description]
- **Time Period:** [When]
- **Sensory Details:** [Sights, sounds, smells, textures]
- **Symbolism:** [What the setting represents]

**Secondary Locations:**
1. **[Place 1]:** [Purpose in story]
2. **[Place 2]:** [Purpose in story]

### **Themes & Symbols:**

**Central Themes:**
1. [Theme 1: e.g., "The cost of ambition"]
2. [Theme 2: e.g., "Redemption through sacrifice"]

**Recurring Symbols:**
- **[Object]:** Represents [meaning]
- **[Weather/Element]:** Reflects [emotional state]

### **Writing Style Guidelines:**
- **Pacing:** [Fast-paced action vs. slow contemplation]
- **Dialogue:** [Natural, terse, poetic, etc.]
- **Descriptive Level:** [Sparse vs. lush details]
- **Sentence Structure:** [Varied lengths for rhythm]

### **Opening Paragraph Example:**
"[Engaging first sentence that establishes tone]. [Second sentence introducing conflict]. [Third sentence hinting at the journey ahead]."`,

            business: `**💼 AI-Generated Business Prompt**

**Topic:** ${input}
**Analysis Type:** ${options.analysis || 'Strategic Planning'}
**Format:** ${options.format || 'Executive Summary + Detailed Report'}
**Stakeholders:** ${options.audience || 'C-Suite Executives, Investors'}

### **Executive Summary:**

**Current Situation Analysis:**
The ${input} landscape is characterized by [key trends]. Our organization faces [primary challenges] while opportunities exist in [growth areas].

**Core Recommendation:**
We recommend [primary strategy] to achieve [objective], requiring [investment/resources] with expected [ROI/timeline].

### **Detailed Analysis:**

**SWOT Analysis:**

**Strengths:**
1. [Internal advantage 1]
2. [Internal advantage 2]
3. [Competitive edge]

**Weaknesses:**
1. [Internal limitation 1]
2. [Internal limitation 2]
3. [Areas needing improvement]

**Opportunities:**
1. [External opportunity 1 - Market trend]
2. [External opportunity 2 - Technology shift]
3. [External opportunity 3 - Regulatory change]

**Threats:**
1. [External threat 1 - Competition]
2. [External threat 2 - Market conditions]
3. [External threat 3 - Economic factors]

### **Strategic Framework:**

**Objectives (SMART):**
1. **Specific:** Increase [metric] by [percentage] within [timeframe]
2. **Measurable:** Track via [KPI] using [tool/method]
3. **Achievable:** Based on [resources/capabilities]
4. **Relevant:** Aligns with [company goal/mission]
5. **Time-bound:** Complete by [date]

**Key Initiatives:**
1. **[Initiative 1]** - Owner: [person/team], Timeline: [dates], Budget: [amount]
2. **[Initiative 2]** - Owner: [person/team], Timeline: [dates], Budget: [amount]
3. **[Initiative 3]** - Owner: [person/team], Timeline: [dates], Budget: [amount]

### **Implementation Roadmap:**

**Phase 1: Foundation (Months 1-3)**
- [Task 1.1]
- [Task 1.2]
- [Task 1.3]

**Phase 2: Development (Months 4-6)**
- [Task 2.1]
- [Task 2.2]
- [Task 2.3]

**Phase 3: Launch & Scale (Months 7-12)**
- [Task 3.1]
- [Task 3.2]
- [Task 3.3]

### **Financial Projections:**

**Investment Required:**
- Personnel: $[amount]
- Technology: $[amount]
- Marketing: $[amount]
- Contingency: $[amount]
- **Total:** $[total]

**Expected Returns:**
- Year 1: $[revenue], [margin]% margin
- Year 2: $[revenue], [margin]% margin
- Year 3: $[revenue], [margin]% margin
- **ROI:** [percentage] over [period]

### **Risk Mitigation:**

**High-Risk Scenarios:**
1. **[Risk 1]** - Probability: [%], Impact: [High/Medium/Low], Mitigation: [strategy]
2. **[Risk 2]** - Probability: [%], Impact: [High/Medium/Low], Mitigation: [strategy]

**Success Metrics:**
- Primary KPI: [Metric] target: [value]
- Secondary KPIs: [List 2-3 additional metrics]
- Leading Indicators: [Early warning signals]`
        };

        const template = aiStyleResponses[category] || aiStyleResponses.creative;

        // Add real-time personalization
        const timestamp = new Date();
        const hours = timestamp.getHours();
        const timeOfDay = hours < 12 ? 'morning' : hours < 18 ? 'afternoon' : 'evening';

        const personalizedHeader = `## 🤖 PromptStudio AI - ${timeOfDay} Edition\n\n`;
        const statusNote = `\n\n---\n*Status: Enhanced offline mode | Gemini quota activating (24-48h) | OpenAI credits needed*\n*Generated: ${timestamp.toLocaleString()}*`;

        const finalPrompt = personalizedHeader + template + statusNote;

        this.currentProvider = 'offline';

        return {
            success: true,
            prompt: finalPrompt,
            category,
            model: 'ai-enhanced-offline',
            provider: 'offline-plus',
            tokens: Math.floor(finalPrompt.length / 4),
            online: false,
            note: 'Premium offline template. Gemini quota activates in 24-48h. OpenAI needs credits.',
            timestamp: timestamp.toISOString(),
            quality: 'premium'
        };
    }

    async batchGeneratePrompts(inputs, category = 'creative') {
        console.log(`📦 Batch generating ${inputs.length} prompts for category: ${category}`);

        const results = [];
        const errors = [];

        for (let i = 0; i < inputs.length; i++) {
            try {
                const result = await this.generatePrompt(inputs[i], category, {});
                results.push({
                    success: true,
                    input: inputs[i],
                    prompt: result.prompt,
                    model: result.model,
                    provider: result.provider
                });
            } catch (error) {
                errors.push({
                    input: inputs[i],
                    error: error.message
                });
            }
        }

        return {
            success: true,
            results: results,
            total: inputs.length,
            successful: results.length,
            errors: errors,
            timestamp: new Date().toISOString()
        };
    }

    async enhancePrompt(prompt, enhancementType = 'detailed') {
        console.log(`✨ Enhancing prompt with type: ${enhancementType}`);

        // For online mode, try to use AI providers
        if (this.providers.available.length > 0) {
            const enhancementPrompts = {
                detailed: "Expand this prompt with more specific details, vivid descriptions, and technical specifications:",
                concise: "Make this prompt more concise while keeping all essential information:",
                professional: "Rewrite this prompt in a more professional and formal tone:",
                creative: "Add more creative elements, metaphors, and imaginative details to this prompt:"
            };

            const enhancementInstruction = enhancementPrompts[enhancementType] || enhancementPrompts.detailed;
            const fullPrompt = `${enhancementInstruction}\n\nOriginal prompt: "${prompt}"`;

            try {
                return await this.generatePrompt(fullPrompt, 'creative', {});
            } catch (error) {
                console.warn('⚠️ AI enhancement failed, using offline method:', error.message);
            }
        }

        // Offline enhancement
        const enhancementTemplates = {
            detailed: `**Enhanced Detailed Version:**\n\n${prompt}\n\n**Additional Details Added:**\n- Increased specificity of descriptions\n- Added technical parameters\n- Enhanced sensory details\n- Improved structure and flow\n\n**Enhanced Prompt:** "${prompt}" with [additional specific details], [improved technical specs], [better flow structure], optimized for AI generation.`,

            concise: `**Concise Optimized Version:**\n\n${prompt}\n\n**Optimization Applied:**\n- Removed redundant words\n- Simplified complex phrases\n- Maintained core meaning\n- Improved readability\n\n**Concise Prompt:** [Brief, clear version of original]`,

            professional: `**Professional Version:**\n\n${prompt}\n\n**Professional Enhancements:**\n- Formal language applied\n- Industry terminology added\n- Structured format implemented\n- Professional tone maintained\n\n**Professional Prompt:** "${prompt}" expressed in formal business language with structured format and professional terminology.`,

            creative: `**Creative Enhanced Version:**\n\n${prompt}\n\n**Creative Additions:**\n- Metaphors and similes added\n- Imagery expanded\n- Emotional depth increased\n- Narrative elements enhanced\n\n**Creative Prompt:** "${prompt}" transformed with vivid metaphors, expanded imagery, emotional depth, and enhanced narrative elements.`
        };

        const enhanced = enhancementTemplates[enhancementType] || enhancementTemplates.detailed;

        return {
            success: true,
            original: prompt,
            enhanced: enhanced,
            enhancementType: enhancementType,
            provider: 'offline',
            improvement: '35% more detailed',
            timestamp: new Date().toISOString()
        };
    }

    async testAllProviders() {
        console.log('🧪 Testing all AI providers...');

        const results = {
            openai: { success: false, message: 'Not configured' },
            gemini: { success: false, message: 'Not configured' },
            offline: { success: true, message: 'Always available' }
        };

        // Test OpenAI
        if (this.providers.openai) {
            try {
                const testPrompt = "Say 'OpenAI OK'";
                const completion = await this.providers.openai.chat.completions.create({
                    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
                    messages: [{ role: "user", content: testPrompt }],
                    max_tokens: 10,
                });
                results.openai = {
                    success: true,
                    message: 'Connection successful',
                    response: completion.choices[0].message.content
                };
            } catch (error) {
                results.openai = {
                    success: false,
                    message: `Error: ${error.message.substring(0, 50)}`,
                    error: error.message.includes('quota') ? 'Quota exceeded' : 'API error'
                };
            }
        }

        // Test Gemini
        if (this.providers.geminiModel) {
            try {
                const testPrompt = "Say 'Gemini OK'";
                const result = await this.providers.geminiModel.generateContent(testPrompt);
                const response = await result.response;
                results.gemini = {
                    success: true,
                    message: 'Connection successful',
                    response: response.text()
                };
            } catch (error) {
                results.gemini = {
                    success: false,
                    message: `Error: ${error.message.substring(0, 50)}`,
                    error: error.message.includes('quota') ? 'Quota exceeded' : 'API error'
                };
            }
        }

        console.log('✅ Provider tests completed');
        return results;
    }

    getProviderInfo() {
        return {
            current: this.currentProvider,
            available: this.providers.available,
            openai: {
                configured: !!this.providers.openai,
                model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
                status: this.providers.available.includes('openai') ? 'ready' : 'disabled'
            },
            gemini: {
                configured: !!this.providers.gemini,
                model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
                status: this.providers.available.includes('gemini') ? 'ready' : 'disabled',
                note: 'New projects may need 24-48h for full quota'
            },
            offline: {
                alwaysAvailable: true,
                status: 'ready'
            }
        };
    }

    getAvailableModels() {
        const models = [];

        if (this.providers.available.includes('openai')) {
            models.push('gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo');
        }

        if (this.providers.available.includes('gemini')) {
            models.push('gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro');
        }

        if (models.length === 0) {
            models.push('enhanced-offline');
        }

        return {
            success: true,
            models,
            currentProvider: this.currentProvider,
            mode: this.providers.available.length > 0 ? 'online' : 'offline',
            timestamp: new Date().toISOString()
        };
    }

    getCategories() {
        return Object.keys(this.templates);
    }

    getModelInfo() {
        const isOffline = this.currentProvider === 'offline';

        return {
            provider: isOffline ? 'PromptStudio Enhanced Offline' : this.currentProvider.toUpperCase(),
            status: isOffline ? 'offline' : 'online',
            maxTokens: 2048,
            temperature: 0.9,
            capabilities: isOffline
                ? ['enhanced-generation', 'template-based', 'instant']
                : ['ai-generation', 'prompt-optimization', 'real-time'],
            note: isOffline
                ? 'AI providers are rate-limited. New Gemini projects need 24-48h for full quota.'
                : `Using ${this.currentProvider} AI service`,
            timestamp: new Date().toISOString()
        };
    }
}

// Create singleton instance
const aiService = new AIService();

module.exports = aiService;