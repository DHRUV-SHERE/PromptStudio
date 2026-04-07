import { useState, useEffect, useRef } from "react";
import { 
  Copy, Check, RefreshCw, Sparkles, Wand2, Info, AlertTriangle, X 
} from "lucide-react";
import { authAPI } from "../services/api";
import { useAuth } from "../context/authContext";
import { useToast } from "../context/toastContext";

// Category-specific options with chips
const categoryOptions = {
  '🎨 Image Generation': {
    aspectRatio: ['Portrait (9:16)', 'Landscape (16:9)', 'Square (1:1)', 'Wide (21:9)', '4K (3840x2160)'],
    style: ['Photorealistic', 'Digital Art', 'Oil Painting', 'Watercolor', 'Anime/Manga', '3D Render', 'Abstract', 'Minimalist'],
    mood: ['Happy', 'Melancholic', 'Dramatic', 'Peaceful', 'Mysterious', 'Energetic', 'Romantic'],
    lighting: ['Golden Hour', 'Blue Hour', 'Studio', 'Natural', 'Neon', 'Dramatic Shadows', 'Soft Diffused'],
    quality: ['4K', '8K', 'HD', 'Ultra HD']
  },
  '✍️ Content Writing': {
    tone: ['Professional', 'Casual', 'Friendly', 'Formal', 'Humorous', 'Inspirational', 'Educational'],
    length: ['Short (100-200 words)', 'Medium (300-500 words)', 'Long (800-1000 words)', 'Extended (1500+ words)'],
    format: ['Blog Post', 'Article', 'Newsletter', 'Social Media Post', 'Story', 'Essay'],
    audience: ['General Public', 'Tech Savvy', 'Business Professionals', 'Teenagers', 'Parents', 'Experts']
  },
  '💻 Code Generation': {
    language: ['JavaScript', 'Python', 'Java', 'C++', 'Go', 'Rust', 'TypeScript', 'Swift', 'Kotlin'],
    framework: ['React', 'Vue.js', 'Angular', 'Node.js', 'Django', 'Flask', 'Express', 'Spring Boot'],
    complexity: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    type: ['Function', 'Class', 'API Endpoint', 'Full Component', 'Algorithm', 'Database Query']
  },
  '📊 Business & Marketing': {
    platform: ['LinkedIn', 'Twitter/X', 'Instagram', 'Facebook', 'Website', 'Email', 'Presentation'],
    goal: ['Brand Awareness', 'Lead Generation', 'Sales', 'Engagement', 'Trust Building', 'Product Launch'],
    tone: ['Professional', 'Casual', 'Urgent', 'Inspirational', 'Educational', 'Persuasive'],
    audience: ['Startup Founders', 'Enterprise Executives', 'Small Business Owners', 'Marketing Professionals', 'General Consumers']
  },
  '🎬 Video Creation': {
    type: ['Tutorial', 'Promo/Ad', 'Vlog', 'Short Film', 'Explainer', 'Product Review', 'Unboxing'],
    duration: ['15 seconds', '30 seconds', '60 seconds', '2-3 minutes', '5-10 minutes', '10+ minutes'],
    style: ['Cinematic', 'Vlog Style', 'Corporate', 'Animation', 'Live Action', 'Motion Graphics'],
    platform: ['YouTube', 'TikTok', 'Instagram Reels', 'LinkedIn', 'Twitter/X']
  },
  '📱 Social Media': {
    platform: ['Instagram', 'Twitter/X', 'LinkedIn', 'Facebook', 'TikTok', 'Pinterest', 'Threads'],
    contentType: ['Post', 'Caption', 'Thread', 'Story', 'Reel Script', 'Poll', 'Carousel'],
    goal: ['Engagement', 'Followers Growth', 'Brand Awareness', 'Traffic', 'Conversions'],
    tone: ['Professional', 'Fun', 'Inspirational', 'Educational', 'Controversial', 'Casual']
  },
  '🎵 Music & Audio': {
    genre: ['Pop', 'Rock', 'Hip-Hop', 'Electronic', 'Classical', 'Jazz', 'R&B', 'Country', 'Lo-fi'],
    mood: ['Happy', 'Sad', 'Energetic', 'Calm', 'Epic', 'Romantic', 'Dark'],
    instrument: ['Piano', 'Guitar', 'Drums', 'Strings', 'Electronic', 'Full Band', 'Acapella'],
    useCase: ['Background Music', 'Songwriting', 'Soundtrack', 'Podcast Intro', 'Commercial']
  },
  '🎮 Game Development': {
    genre: ['RPG', 'Action', 'Adventure', 'Puzzle', 'Strategy', 'Simulation', 'Horror', 'Sports'],
    style: ['2D Pixel Art', '3D Realistic', 'Cartoon', 'Low Poly', 'Pixel Art', 'Hand-drawn'],
    platform: ['PC', 'Mobile', 'Console', 'Web Browser', 'VR/AR'],
    engine: ['Unity', 'Unreal Engine', 'Godot', 'GameMaker', 'Construct']
  },
  '📚 Education & Learning': {
    level: ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'All Levels'],
    subject: ['Science', 'Mathematics', 'History', 'Language', 'Programming', 'Business', 'Arts'],
    format: ['Lesson Plan', 'Quiz', 'Explanation', 'Tutorial', 'Study Guide', 'Flashcards'],
    goal: ['Exam Preparation', 'Skill Building', 'Concept Understanding', 'Review', 'Practice']
  }
};

const Generator = () => {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [selectedOptions, setSelectedOptions] = useState({});
  const [customTags, setCustomTags] = useState([]);
  const [customTagInput, setCustomTagInput] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dailyUsage, setDailyUsage] = useState(null);
  const [currentProvider, setCurrentProvider] = useState(null);
  const customTagInputRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDailyUsage();
      fetchProviderInfo();
    }
  }, [isAuthenticated]);

  const fetchProviderInfo = async () => {
    try {
      const response = await authAPI.getCategories();
      if (response.success && response.data.modelInfo) {
        setCurrentProvider(response.data.modelInfo);
      }
    } catch (error) {
      console.error('Failed to fetch provider info:', error);
    }
  };

  const mapCategoryToEnum = (category) => {
    const categoryMap = {
      '🎨 Image Generation': 'creative',
      '✍️ Content Writing': 'creative', 
      '💻 Code Generation': 'coding',
      '📊 Business & Marketing': 'marketing',
      '🎬 Video Creation': 'creative',
      '📱 Social Media': 'marketing',
      '🎵 Music & Audio': 'creative',
      '🎮 Game Development': 'coding',
      '📚 Education & Learning': 'storytelling'
    };
    return categoryMap[category] || 'creative';
  };

  const fetchDailyUsage = async () => {
    try {
      const response = await authAPI.getDailyUsage();
      if (response.success) {
        setDailyUsage(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch daily usage:', error);
    }
  };

  const toggleOption = (optionType, option) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionType]: option
    }));
  };

  const handleCustomTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addCustomTag();
    }
  };

  const addCustomTag = () => {
    const tag = customTagInput.trim();
    if (tag && !customTags.includes(tag)) {
      setCustomTags([...customTags, tag]);
    }
    setCustomTagInput("");
  };

  const removeCustomTag = (tagToRemove) => {
    setCustomTags(customTags.filter(tag => tag !== tagToRemove));
  };

  const getCurrentCategoryOptions = () => {
    return categoryOptions[category] || {};
  };

  const generatePrompt = async () => {
    if (!category.trim() || !description.trim()) {
      showToast("Please fill in category and description", "error");
      return;
    }

    if (isAuthenticated && dailyUsage && !dailyUsage.canGenerate) {
      showToast(`Daily limit reached! You've used ${dailyUsage.todaysUsage}/${dailyUsage.dailyLimit} prompts today. Try again tomorrow!`, "error");
      return;
    }

    setIsLoading(true);
    
    try {
      if (isAuthenticated) {
        // Build options array for API
        const optionsArray = Object.entries(selectedOptions)
          .filter(([_, value]) => value)
          .map(([key, value]) => ({ type: key, value }));

        // Add custom tags as custom details
        const customDetailsArray = customTags.map(tag => ({ name: 'Custom', value: tag }));

        const result = await authAPI.generatePrompt({
          category: mapCategoryToEnum(category),
          description: description,
          additionalDetails: optionsArray,
          customDetails: customDetailsArray
        });
        
        if (result.success) {
          setGeneratedPrompt(result.data.generatedPrompt);
          showToast('Prompt generated successfully!', 'success');
          await fetchDailyUsage();
        } else {
          throw new Error(result.message);
        }
      } else {
        // Fallback for non-authenticated users
        let prompt = `${category}: ${description}`;
        
        Object.entries(selectedOptions).forEach(([key, value]) => {
          if (value) {
            prompt += `. ${key}: ${value}`;
          }
        });

        if (customTags.length > 0) {
          prompt += `. Additional details: ${customTags.join(', ')}`;
        }
        
        prompt += ". Make it detailed and professional.";
        setGeneratedPrompt(prompt);
        showToast('Basic prompt generated! Sign in for AI-enhanced prompts.', 'success');
      }
    } catch (error) {
      console.error('Generation error:', error);
      
      if (error.response?.status === 429) {
        showToast('Daily limit reached! Try again tomorrow.', 'error');
      } else {
        showToast(error.message || 'Failed to generate prompt', 'error');
        
        // Fallback prompt
        let fallbackPrompt = `${category}: ${description}`;
        Object.entries(selectedOptions).forEach(([key, value]) => {
          if (value) {
            fallbackPrompt += `. ${key}: ${value}`;
          }
        });

        if (customTags.length > 0) {
          fallbackPrompt += `. Additional details: ${customTags.join(', ')}`;
        }
        
        fallbackPrompt += ". Make it detailed and professional.";
        setGeneratedPrompt(fallbackPrompt);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      showToast('Prompt copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      showToast("Failed to copy prompt", "error");
    }
  };

  const currentCategoryOptions = getCurrentCategoryOptions();

  return (
    <div className="min-h-screen gradient-hero p-4 animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in-down">
          <div className="flex items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center glow-primary animate-pulse-glow">
              <Wand2 className="h-7 w-7 text-white animate-float" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent text-glow">
                PromptStudio
              </h1>
              <p className="text-lg text-muted-foreground animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                Create perfect AI prompts in 3 simple steps
              </p>
            </div>
          </div>
          
          {/* Daily Usage Display */}
          {isAuthenticated && dailyUsage && (
            <div className="glass rounded-2xl p-4 max-w-md mx-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span className="font-medium">Daily Usage</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${
                    dailyUsage.remainingToday <= 2 ? 'text-red-500' : 
                    dailyUsage.remainingToday <= 5 ? 'text-yellow-500' : 'text-green-500'
                  }`}>
                    {dailyUsage.todaysUsage}/{dailyUsage.dailyLimit}
                  </span>
                  {dailyUsage.remainingToday <= 2 && (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
              
              {dailyUsage.remainingToday === 0 && (
                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-600 dark:text-red-400 text-center">
                    ⚠️ Daily limit reached! Resets tomorrow.
                  </p>
                </div>
              )}
              
              {dailyUsage.remainingToday > 0 && dailyUsage.remainingToday <= 2 && (
                <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 text-center">
                    ⚡ Only {dailyUsage.remainingToday} prompts left today!
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* AI Provider Display */}
          {currentProvider && (
            <div className="glass rounded-2xl p-4 max-w-lg mx-auto mt-4 animate-scale-in hover-lift" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center justify-center gap-3">
                <div className={`w-3 h-3 rounded-full animate-pulse ${
                  currentProvider.status === 'online' ? 'bg-green-500' : 'bg-orange-500'
                }`} />
                <span className="text-sm font-medium">
                  Powered by <span className="text-primary font-bold animate-pulse-glow">{currentProvider.provider}</span>
                </span>
                {currentProvider.status === 'offline' && (
                  <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-1 rounded-full animate-fade-in">
                    Enhanced Mode
                  </span>
                )}
              </div>
              {currentProvider.note && (
                <p className="text-xs text-muted-foreground text-center mt-2 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                  {currentProvider.note}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Step 1: Category */}
        <div className="glass rounded-3xl p-6 border-gradient animate-fade-in-up hover-lift" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-2xl font-bold mb-4 animate-fade-in-left">Step 1: What category do you want?</h2>
          <div className="space-y-4">
            <input
              type="text"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setSelectedOptions({});
              }}
              placeholder="Select or type a category..."
              className="w-full bg-background border border-border/70 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 text-lg"
            />
            
            <div>
              <p className="text-sm text-muted-foreground mb-3">Or choose from popular categories:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.keys(categoryOptions).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setCategory(cat);
                      setSelectedOptions({});
                    }}
                    className={`p-3 text-sm rounded-xl transition-all text-left ${
                      category === cat 
                        ? 'bg-primary text-white' 
                        : 'bg-secondary/30 hover:bg-primary/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Description */}
        <div className="glass rounded-3xl p-6 border-gradient animate-fade-in-up hover-lift" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-2xl font-bold mb-4 animate-fade-in-left">Step 2: Describe what you want</h2>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe in detail what you want to create..."
            className="w-full bg-background border border-border/70 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 text-lg min-h-32 resize-y"
            rows={4}
          />
          
          <div className="mt-4 p-4 bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/20">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-foreground mb-2">How to write a good description:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Be specific about what you want</li>
                  <li>• Include the purpose or goal</li>
                  <li>• Mention your target audience if relevant</li>
                  <li>• Add any important context or requirements</li>
                  <li>• Example: "A professional headshot photo of a business woman in her 30s, wearing a navy blue blazer, with a confident smile, for a LinkedIn profile"</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Category-Specific Options */}
        {category && Object.keys(currentCategoryOptions).length > 0 && (
          <div className="glass rounded-3xl p-6 border-gradient animate-fade-in-up hover-lift" style={{ animationDelay: '0.3s' }}>
            <h2 className="text-2xl font-bold mb-4 animate-fade-in-left">Step 3: Choose your options</h2>
            <p className="text-muted-foreground mb-6">Select options that best match your requirements (all are optional):</p>
            
            <div className="space-y-6">
              {Object.entries(currentCategoryOptions).map(([optionType, options]) => (
                <div key={optionType}>
                  <h3 className="text-lg font-semibold mb-3 capitalize">{optionType.replace(/([A-Z])/g, ' $1').trim()}</h3>
                  <div className="flex flex-wrap gap-2">
                    {options.map((option) => (
                      <button
                        key={option}
                        onClick={() => toggleOption(optionType, selectedOptions[optionType] === option ? '' : option)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          selectedOptions[optionType] === option
                            ? 'bg-primary text-white'
                            : 'bg-secondary/50 hover:bg-primary/10 text-foreground'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {Object.keys(selectedOptions).length > 0 && (
              <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/20">
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Selected Options:</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(selectedOptions)
                        .filter(([_, value]) => value)
                        .map(([key, value]) => (
                          <span key={key} className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                            {key}: {value}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Custom Tags Input */}
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="text-lg font-semibold mb-3">Add Custom Details</h3>
              <p className="text-sm text-muted-foreground mb-3">Type a value and press Enter to add it as a chip:</p>
              <div 
                className="flex flex-wrap gap-2 p-3 bg-background border border-border/70 rounded-xl min-h-[60px] cursor-text"
                onClick={() => customTagInputRef.current?.focus()}
              >
                {customTags.map((tag, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1.5 bg-primary/10 text-primary text-sm rounded-full flex items-center gap-2"
                  >
                    {tag}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeCustomTag(tag);
                      }}
                      className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <input
                  ref={customTagInputRef}
                  type="text"
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  onKeyDown={handleCustomTagKeyDown}
                  onBlur={addCustomTag}
                  placeholder={customTags.length === 0 ? "Type here (e.g., professional, high quality)..." : ""}
                  className="flex-1 min-w-[150px] bg-transparent outline-none text-sm"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Tip: Press Enter or comma to add a tag
              </p>
            </div>
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={generatePrompt}
          disabled={isLoading || !category.trim() || !description.trim() || (isAuthenticated && dailyUsage && !dailyUsage.canGenerate)}
          className="w-full gradient-primary glow-primary hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed py-5 rounded-2xl font-bold text-xl transition-all shine animate-fade-in-up hover-lift" 
          style={{ animationDelay: '0.4s' }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Generating Perfect Prompt...</span>
            </div>
          ) : (isAuthenticated && dailyUsage && !dailyUsage.canGenerate) ? (
            <div className="flex items-center justify-center gap-3">
              <AlertTriangle className="h-6 w-6" />
              <span>Daily Limit Reached - Try Tomorrow</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <Sparkles className="h-6 w-6" />
              <span>✨ Generate My Perfect Prompt</span>
              {isAuthenticated && dailyUsage && (
                <span className="text-sm opacity-75">({dailyUsage.remainingToday} left)</span>
              )}
            </div>
          )}
        </button>

        {/* Generated Prompt */}
        {generatedPrompt && (
          <div className="glass rounded-3xl p-6 border-gradient glow-soft animate-scale-in hover-lift">
            <div className="flex items-center gap-3 mb-4 animate-fade-in-left">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center animate-success-bounce">
                <Check className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">🎉 Your Perfect Prompt is Ready!</h3>
                <p className="text-sm text-muted-foreground animate-fade-in-up" style={{ animationDelay: '0.2s' }}>Copy and paste into any AI tool</p>
              </div>
            </div>
            
            <div className="bg-background border-2 border-primary/20 rounded-xl p-6 relative mb-4 max-h-80 overflow-y-auto">
              <button
                onClick={copyToClipboard}
                className="absolute top-3 right-3 p-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-all z-10"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
              <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap pr-12">
                {generatedPrompt}
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={copyToClipboard}
                className="flex-1 bg-primary text-white hover:bg-primary/90 rounded-xl py-3 px-4 flex items-center justify-center gap-2 transition-all font-semibold"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "✅ Copied!" : "📋 Copy Prompt"}
              </button>
              
              <button
                onClick={generatePrompt}
                className="flex-1 bg-secondary/80 hover:bg-secondary border border-border rounded-xl py-3 px-4 flex items-center justify-center gap-2 transition-all font-semibold"
              >
                <RefreshCw className="h-4 w-4" />
                🔄 Generate Again
              </button>
            </div>
            
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mt-4">
              <p className="text-sm text-foreground">
                🚀 <strong>Ready to use!</strong> Paste this into ChatGPT, Claude, Gemini, Midjourney, or any AI tool.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Generator;
