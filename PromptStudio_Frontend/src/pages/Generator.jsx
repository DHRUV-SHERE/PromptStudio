import { useState, useEffect } from "react";
import { 
  Copy, Check, RefreshCw, Sparkles, Wand2, Plus, X, Info, AlertTriangle 
} from "lucide-react";
import { authAPI } from "../services/api";
import { useAuth } from "../context/authContext";
import toast from 'react-hot-toast';

// Predefined categories for quick selection
const quickCategories = [
  "🎨 Image Generation", "✍️ Content Writing", "💻 Code Generation", 
  "📊 Business & Marketing", "🎬 Video Creation", "📱 Social Media",
  "🎵 Music & Audio", "🎮 Game Development", "📚 Education & Learning"
];

// Additional detail options
const additionalDetailOptions = [
  "Style", "Color", "Size", "Tone", "Audience", "Platform", "Duration", 
  "Quality", "Format", "Language", "Mood", "Theme", "Budget", "Timeline"
];

const Generator = () => {
  const { isAuthenticated } = useAuth();
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState([]);
  const [customDetails, setCustomDetails] = useState([]);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dailyUsage, setDailyUsage] = useState(null);
  const [currentProvider, setCurrentProvider] = useState(null);

  // Fetch daily usage and provider info on component mount
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

  // Map frontend categories to backend enum values
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

  const addAdditionalDetail = () => {
    setAdditionalDetails([...additionalDetails, { type: "", value: "" }]);
  };

  const updateAdditionalDetail = (index, field, value) => {
    const updated = [...additionalDetails];
    updated[index][field] = value;
    setAdditionalDetails(updated);
  };

  const removeAdditionalDetail = (index) => {
    setAdditionalDetails(additionalDetails.filter((_, i) => i !== index));
  };

  const addCustomDetail = () => {
    setCustomDetails([...customDetails, { name: "", value: "" }]);
  };

  const updateCustomDetail = (index, field, value) => {
    const updated = [...customDetails];
    updated[index][field] = value;
    setCustomDetails(updated);
  };

  const removeCustomDetail = (index) => {
    setCustomDetails(customDetails.filter((_, i) => i !== index));
  };

  const generatePrompt = async () => {
    if (!category.trim() || !description.trim()) {
      toast.error("Please fill in category and description");
      return;
    }

    // Check daily limit for authenticated users
    if (isAuthenticated && dailyUsage && !dailyUsage.canGenerate) {
      toast.error(`Daily limit reached! You've used ${dailyUsage.todaysUsage}/${dailyUsage.dailyLimit} prompts today. Try again tomorrow!`);
      return;
    }

    setIsLoading(true);
    
    try {
      if (isAuthenticated) {
        // Use new API structure for authenticated users
        const result = await authAPI.generatePrompt({
          category: mapCategoryToEnum(category),
          description: description,
          additionalDetails: additionalDetails.filter(d => d.type && d.value),
          customDetails: customDetails.filter(d => d.name && d.value)
        });
        
        if (result.success) {
          setGeneratedPrompt(result.data.generatedPrompt);
          toast.success('Prompt generated successfully!');
          // Update daily usage
          await fetchDailyUsage();
        } else {
          throw new Error(result.message);
        }
      } else {
        // Fallback for non-authenticated users
        let prompt = `Create ${category}: ${description}`;
        
        // Add additional details
        additionalDetails.forEach(detail => {
          if (detail.type && detail.value) {
            prompt += `. ${detail.type}: ${detail.value}`;
          }
        });
        
        // Add custom details
        customDetails.forEach(detail => {
          if (detail.name && detail.value) {
            prompt += `. ${detail.name}: ${detail.value}`;
          }
        });
        
        prompt += ". Make it detailed and professional.";
        setGeneratedPrompt(prompt);
        toast.success('Basic prompt generated! Sign in for AI-enhanced prompts.');
      }
    } catch (error) {
      console.error('Generation error:', error);
      
      if (error.response?.status === 429) {
        toast.error('Daily limit reached! Try again tomorrow.');
      } else {
        toast.error(error.message || 'Failed to generate prompt');
        
        // Fallback prompt
        let fallbackPrompt = `Create ${category}: ${description}`;
        additionalDetails.forEach(detail => {
          if (detail.type && detail.value) {
            fallbackPrompt += `. ${detail.type}: ${detail.value}`;
          }
        });
        customDetails.forEach(detail => {
          if (detail.name && detail.value) {
            fallbackPrompt += `. ${detail.name}: ${detail.value}`;
          }
        });
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
      toast.success('Prompt copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy prompt");
    }
  };

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
          
          {/* Daily Usage Display for Authenticated Users */}
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
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Enter your category (e.g., Image Generation, Blog Writing, etc.)"
              className="w-full bg-background border border-border/70 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 text-lg"
            />
            
            <div>
              <p className="text-sm text-muted-foreground mb-3">Or choose from popular categories:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {quickCategories.map((cat, index) => (
                  <button
                    key={index}
                    onClick={() => setCategory(cat)}
                    className="p-3 text-sm bg-secondary/30 hover:bg-primary/10 rounded-xl transition-all text-left"
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
          
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">How to write a good description:</h4>
                <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
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

        {/* Step 3: Additional Details */}
        <div className="glass rounded-3xl p-6 border-gradient animate-fade-in-up hover-lift" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-2xl font-bold mb-4 animate-fade-in-left">Step 3: Additional Details (Optional)</h2>
          
          {/* Additional Details */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold">Add specific details:</h3>
            {additionalDetails.map((detail, index) => (
              <div key={index} className="flex gap-3 items-start">
                <input
                  type="text"
                  value={detail.type || ""}
                  onChange={(e) => updateAdditionalDetail(index, 'type', e.target.value)}
                  placeholder="Detail title (e.g., Style, Color, Size)"
                  className="w-40 bg-background border border-border/70 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <input
                  type="text"
                  value={detail.value}
                  onChange={(e) => updateAdditionalDetail(index, 'value', e.target.value)}
                  placeholder="Detail content (e.g., Modern minimalist, Blue and white)"
                  className="flex-1 bg-background border border-border/70 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button
                  onClick={() => removeAdditionalDetail(index)}
                  className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              onClick={addAdditionalDetail}
              className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-all"
            >
              <Plus className="h-4 w-4" />
              Add Detail
            </button>
          </div>

          {/* Custom Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Add custom details:</h3>
            {customDetails.map((detail, index) => (
              <div key={index} className="flex gap-3 items-start">
                <input
                  type="text"
                  value={detail.name}
                  onChange={(e) => updateCustomDetail(index, 'name', e.target.value)}
                  placeholder="Detail name (e.g., Background)"
                  className="w-40 bg-background border border-border/70 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <input
                  type="text"
                  value={detail.value}
                  onChange={(e) => updateCustomDetail(index, 'value', e.target.value)}
                  placeholder="Detail description (e.g., White studio background)"
                  className="flex-1 bg-background border border-border/70 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button
                  onClick={() => removeCustomDetail(index)}
                  className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              onClick={addCustomDetail}
              className="flex items-center gap-2 px-4 py-2 bg-secondary/50 hover:bg-secondary/70 rounded-xl transition-all"
            >
              <Plus className="h-4 w-4" />
              Add Custom Detail
            </button>
          </div>

          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">How additional details work:</h4>
                <div className="text-sm text-green-600 dark:text-green-400 space-y-2">
                  <p><strong>Additional Details:</strong> Add any specific requirements using two text boxes.</p>
                  <p><strong>Example:</strong> Detail title: "Style" → Detail content: "Modern minimalist design"</p>
                  <p><strong>Custom Details:</strong> Add your own detail type if needed.</p>
                  <p><strong>Example:</strong> Detail name: "Lighting" → Description: "Soft natural lighting from the left"</p>
                </div>
              </div>
            </div>
          </div>
        </div>

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
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center animate-success-bounce">
                <Check className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-600 dark:text-green-400">🎉 Your Perfect Prompt is Ready!</h3>
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
            
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mt-4">
              <p className="text-sm text-green-700 dark:text-green-300">
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