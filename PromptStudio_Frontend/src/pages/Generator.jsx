import { useState, useEffect } from "react";
import { Copy, Check, RefreshCw, Save, Sparkles, Plus, X, AlertCircle, ChevronDown, Zap } from "lucide-react";
import CategorySidebar from "../components/CatrgorySideabar";
import { authAPI } from "../services/api"; // Import your API service
import { useAuth } from "../context/authContext"; // Import auth context

// Style options for all categories
const styleOptions = [
  "Modern", "Minimalist", "Vibrant", "Professional", "Creative", "Elegant", "Bold", "Retro", "Futuristic"
];

// Tone options for all categories
const toneOptions = [
  "Friendly", "Professional", "Casual", "Formal", "Energetic", "Authoritative", "Playful", "Serious", "Inspirational"
];

// Color palette options
const colorOptions = [
  "Vibrant Colors", "Pastel Colors", "Monochrome", "Warm Tones", "Cool Tones", "Dark Mode", "Light Mode", "Neon Colors"
];

// Category mapping to backend categories
const categoryMap = {
  image: "creative",
  website: "creative",
  video: "creative",
  coding: "coding",
  data: "business",
  social: "marketing",
  content: "creative",
  business: "business"
};

const Generator = () => {
  const { isAuthenticated, user } = useAuth(); // Get auth state
  const [selectedCategory, setSelectedCategory] = useState("image");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [usageStats, setUsageStats] = useState(null);
  const [savedPrompts, setSavedPrompts] = useState([]);
  
  // Base form states
  const [theme, setTheme] = useState("");
  const [style, setStyle] = useState("");
  const [colorPalette, setColorPalette] = useState("");
  const [tone, setTone] = useState("");
  const [details, setDetails] = useState("");
  
  // Dynamic field states
  const [dynamicFields, setDynamicFields] = useState({});
  const [customFields, setCustomFields] = useState([]);
  const [newCustomField, setNewCustomField] = useState("");

  // Load usage stats
  useEffect(() => {
    if (isAuthenticated) {
      loadUsageStats();
      loadSavedPrompts();
    }
  }, [isAuthenticated]);

  const loadUsageStats = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      // You might need to add prompt stats to your user model
      // For now, we'll use localStorage or make a separate endpoint
    } catch (error) {
      console.error("Failed to load usage stats:", error);
    }
  };

  const loadSavedPrompts = () => {
    const saved = JSON.parse(localStorage.getItem('savedPrompts') || '[]');
    setSavedPrompts(saved);
  };

  const showToast = (message, type = "success") => {
    // Your existing toast implementation
    console.log(`Toast: ${message} (${type})`);
    
    // Remove any existing toasts
    const existingToasts = document.querySelectorAll('.custom-toast');
    existingToasts.forEach(toast => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    });
    
    const toast = document.createElement('div');
    toast.className = `custom-toast fixed top-4 right-4 z-50 glass border-gradient p-4 rounded-xl max-w-sm animate-fade-in-down ${
      type === "success" ? "border-primary/30" : 
      type === "error" ? "border-red-500/30" : 
      "border-blue-500/30"
    }`;
    
    toast.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="w-6 h-6 rounded-full ${
          type === "success" ? "bg-primary/20 text-primary" : 
          type === "error" ? "bg-red-500/20 text-red-500" : 
          "bg-blue-500/20 text-blue-500"
        } flex items-center justify-center flex-shrink-0">
          ${type === "success" ? "✓" : type === "error" ? "!" : "i"}
        </div>
        <div>
          <h4 class="font-semibold">${type === "success" ? "Success" : type === "error" ? "Error" : "Info"}</h4>
          <p class="text-sm text-muted-foreground mt-1">${message}</p>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-muted-foreground hover:text-foreground">
          ×
        </button>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 3000);
  };

  useEffect(() => {
    // Reset fields when category changes
    setDynamicFields({});
    setCustomFields([]);
    setGeneratedPrompt("");
    setStyle("");
    setColorPalette("");
    setTone("");
    setDetails("");
  }, [selectedCategory]);

  const handleDynamicFieldChange = (fieldName, value) => {
    setDynamicFields(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const addCustomField = () => {
    if (newCustomField.trim()) {
      const id = `custom_${Date.now()}`;
      setCustomFields(prev => [...prev, {
        id,
        label: newCustomField.trim(),
        value: ""
      }]);
      setNewCustomField("");
      showToast("Custom field added");
    }
  };

  const removeCustomField = (id) => {
    setCustomFields(prev => prev.filter(field => field.id !== id));
    showToast("Custom field removed");
  };

  const updateCustomFieldValue = (id, value) => {
    setCustomFields(prev => prev.map(field => 
      field.id === id ? { ...field, value } : field
    ));
  };

  const buildPromptInput = () => {
    let input = `Create a ${getCategoryName(selectedCategory)} with the following specifications:\n\n`;
    
    // Add base fields
    if (theme) input += `• Theme/Subject: ${theme}\n`;
    if (style) input += `• Style: ${style}\n`;
    if (colorPalette) input += `• Color Palette: ${colorPalette}\n`;
    if (tone) input += `• Tone: ${tone}\n`;
    if (details) input += `• Details: ${details}\n`;
    
    // Add dynamic fields
    Object.entries(dynamicFields).forEach(([field, value]) => {
      if (value) {
        input += `• ${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: ${value}\n`;
      }
    });
    
    // Add custom fields
    customFields.forEach(field => {
      if (field.value) {
        input += `• ${field.label}: ${field.value}\n`;
      }
    });
    
    return input;
  };

  const generatePrompt = async () => {
    console.log("Generate button clicked");
    
    if (!theme.trim()) {
      showToast("Please enter a theme/topic", "error");
      return;
    }

    if (!isAuthenticated) {
      showToast("Please login to generate prompts", "error");
      return;
    }

    setIsLoading(true);
    
    try {
      const input = buildPromptInput();
      const backendCategory = categoryMap[selectedCategory] || "creative";
      
      const options = {};
      if (tone) options.tone = tone;
      if (style) options.style = style;
      if (colorPalette) options.colorPalette = colorPalette;
      
      const result = await authAPI.generatePrompt({
        input: theme, // Use theme as main input
        category: backendCategory,
        options: options
      });
      
      if (result.success) {
        setGeneratedPrompt(result.data.generatedPrompt);
        showToast("Prompt generated successfully!");
        
        // Update usage stats
        if (result.data.dailyUsage) {
          setUsageStats({
            used: result.data.dailyUsage.split('/')[0],
            total: result.data.dailyUsage.split('/')[1]
          });
        }
      } else {
        showToast(result.message || "Failed to generate prompt", "error");
      }
    } catch (error) {
      console.error("Generation error:", error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Failed to generate prompt. Please try again.";
      
      // Check for rate limit error
      if (errorMessage.includes("limit reached") || errorMessage.includes("429")) {
        showToast("Daily limit reached! Upgrade for unlimited prompts.", "error");
      } else {
        showToast(errorMessage, "error");
      }
      
      // Fallback to local generation if API fails
      setTimeout(() => {
        let fallbackPrompt = `Create a ${getCategoryName(selectedCategory)} with theme: "${theme}"`;
if (style) fallbackPrompt += ` in ${style} style`;
if (tone) fallbackPrompt += ` with ${tone} tone`;
if (colorPalette) fallbackPrompt += ` using ${colorPalette}`;
        setGeneratedPrompt(fallbackPrompt);
        showToast("Using fallback generation (API unavailable)", "info");
      }, 500);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryName = (categoryId) => {
    const categoryMap = {
      image: "image generation prompt",
      website: "website creation prompt",
      video: "video creation prompt",
      coding: "code generation prompt",
      data: "data analysis prompt",
      social: "social media content prompt",
      content: "content writing prompt",
      business: "business strategy prompt"
    };
    return categoryMap[categoryId] || "AI prompt";
  };

  const copyToClipboard = async () => {
    console.log("Copy button clicked");
    
    if (!generatedPrompt) {
      showToast("No prompt to copy", "error");
      return;
    }
    
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      showToast("Prompt copied to clipboard!");
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      showToast("Failed to copy to clipboard", "error");
    }
  };

  const savePrompt = async () => {
    console.log("Save button clicked");
    
    if (!generatedPrompt) {
      showToast("No prompt to save", "error");
      return;
    }
    
    try {
      // Save to localStorage
      const savedPrompts = JSON.parse(localStorage.getItem('savedPrompts') || '[]');
      const newPrompt = {
        id: Date.now(),
        prompt: generatedPrompt,
        category: selectedCategory,
        theme: theme,
        date: new Date().toISOString(),
      };
      
      savedPrompts.push(newPrompt);
      localStorage.setItem('savedPrompts', JSON.stringify(savedPrompts));
      setSavedPrompts(savedPrompts);
      
      // If you have a backend endpoint for saving prompts, you can call it here
      // await authAPI.savePrompt({ prompt: generatedPrompt, category: selectedCategory });
      
      showToast("Prompt saved successfully!");
    } catch (error) {
      console.error("Save error:", error);
      showToast("Failed to save prompt", "error");
    }
  };

  const regeneratePrompt = () => {
    console.log("Regenerate button clicked");
    generatePrompt();
  };

  const CustomSelect = ({ label, value, onChange, options, placeholder }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground block">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => {
            console.log(`${label} changed to:`, e.target.value);
            onChange(e.target.value);
          }}
          className="w-full bg-background border border-border/70 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all cursor-pointer pr-10 appearance-none text-foreground"
          style={{ 
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239C27B0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 1rem center",
            backgroundSize: "1em"
          }}
        >
          <option value="" className="text-muted-foreground">{placeholder || `Select ${label.toLowerCase()}`}</option>
          {options.map(option => (
            <option key={option} value={option} className="text-foreground bg-card">{option}</option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <ChevronDown className="h-4 w-4 text-primary" />
        </div>
      </div>
    </div>
  );

  const getCurrentCategory = () => {
    const categories = [
      { id: "image", name: "Image Generation" },
      { id: "website", name: "Website Creation" },
      { id: "video", name: "Video Creation" },
      { id: "coding", name: "Coding / App Dev" },
      { id: "data", name: "Data & Research" },
      { id: "social", name: "Social Media" },
      { id: "content", name: "Content Writing" },
      { id: "business", name: "Business & Marketing" },
    ];
    return categories.find(cat => cat.id === selectedCategory)?.name || "Image Generation";
  };

  const getCategoryDescription = () => {
    const descriptions = {
      image: "Generate prompts for AI image generation tools like Midjourney, DALL-E, Stable Diffusion",
      website: "Create prompts for website design, development, and optimization",
      video: "Generate video prompts for scripts, animations, and video editing",
      coding: "Create prompts for code generation, debugging, and software architecture",
      data: "Generate prompts for data analysis, research, and visualization",
      social: "Create engaging social media content prompts",
      content: "Generate prompts for blogs, articles, and written content",
      business: "Create prompts for business strategies, marketing, and planning",
    };
    return descriptions[selectedCategory] || "";
  };

  const renderCategoryFields = () => {
    // Your existing renderCategoryFields function
    // ... keep your existing code ...
  };

  return (
    <div className="min-h-screen gradient-hero">
      <main className="flex">
        {/* Category Sidebar */}
        <CategorySidebar 
          selectedCategory={selectedCategory} 
          onSelectCategory={setSelectedCategory} 
        />
        
        {/* Main Content */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Header with Auth Status */}
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl gradient-primary flex items-center justify-center">
                  <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    AI Prompt Generator
                  </h1>
                  <p className="text-sm md:text-base text-muted-foreground mt-1">
                    Customize your parameters and generate perfect prompts for any AI tool
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <div className="px-3 py-1 glass rounded-full flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  <span className="text-sm">Currently generating: <strong>{getCurrentCategory()}</strong></span>
                </div>
                
                {isAuthenticated && usageStats && (
                  <div className="px-3 py-1 glass rounded-full flex items-center gap-2">
                    <Zap className="h-3 w-3 text-accent" />
                    <span className="text-sm">
                      Today: <strong>{usageStats.used}/{usageStats.total}</strong> prompts
                    </span>
                  </div>
                )}
                
                {!isAuthenticated && (
                  <div className="px-3 py-1 bg-yellow-500/10 text-yellow-600 rounded-full text-sm">
                    Login to save prompts and track usage
                  </div>
                )}
              </div>
            </div>

            {/* Category Info */}
            <div className="glass rounded-2xl md:rounded-3xl p-4 md:p-6 border-gradient animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl md:text-2xl font-bold">{getCurrentCategory()}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {getCategoryDescription()}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="px-2 py-1 bg-primary/10 rounded-full text-xs">Customizable</span>
                    <span className="px-2 py-1 bg-primary/10 rounded-full text-xs">AI Optimized</span>
                    <span className="px-2 py-1 bg-primary/10 rounded-full text-xs">Multi-format</span>
                    <span className="px-2 py-1 bg-accent/10 text-accent rounded-full text-xs">Powered by Gemini AI</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Container */}
            <div className="glass rounded-2xl md:rounded-3xl p-4 md:p-6 space-y-6 animate-fade-in-delay border-gradient">
              <h3 className="text-lg md:text-xl font-bold">Customize Your Prompt</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* Theme Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground block">
                    Theme / Topic *
                  </label>
                  <input
                    type="text"
                    value={theme}
                    onChange={(e) => {
                      console.log("Theme changed:", e.target.value);
                      setTheme(e.target.value);
                    }}
                    placeholder="e.g., Futuristic city, E-commerce store, Data analysis..."
                    className="w-full bg-background border border-border/70 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-foreground"
                    required
                  />
                </div>

                {/* Style Dropdown */}
                <CustomSelect
                  label="Style"
                  value={style}
                  onChange={setStyle}
                  options={styleOptions}
                  placeholder="Select style"
                />

                {/* Tone Dropdown */}
                <CustomSelect
                  label="Tone / Voice"
                  value={tone}
                  onChange={setTone}
                  options={toneOptions}
                  placeholder="Select tone"
                />

                {/* Color Palette Dropdown */}
                <CustomSelect
                  label="Color Palette / Visual Theme"
                  value={colorPalette}
                  onChange={setColorPalette}
                  options={colorOptions}
                  placeholder="Select colors"
                />

                {/* Category-specific fields */}
                {renderCategoryFields()}
              </div>

              {/* Additional Details */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground block">
                  Additional Details & Requirements
                </label>
                <textarea
                  value={details}
                  onChange={(e) => {
                    console.log("Details changed:", e.target.value);
                    setDetails(e.target.value);
                  }}
                  placeholder="Add specific requirements, constraints, or special instructions..."
                  className="w-full bg-background border border-border/70 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all min-h-32 resize-y text-foreground"
                  rows={4}
                />
              </div>

              {/* Custom Fields Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Custom Requirements</h4>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newCustomField}
                      onChange={(e) => {
                        console.log("New custom field:", e.target.value);
                        setNewCustomField(e.target.value);
                      }}
                      placeholder="Add custom requirement..."
                      className="bg-background border border-border/70 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all w-40 md:w-auto text-foreground"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCustomField();
                        }
                      }}
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log("Add custom field button clicked");
                        addCustomField();
                      }}
                      className="bg-primary text-white p-2 rounded-xl hover:bg-primary/90 transition-colors"
                      title="Add custom field"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {customFields.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    {customFields.map(field => (
                      <div key={field.id} className="space-y-2">
                        <label className="text-sm font-medium text-foreground block">
                          {field.label}
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={field.value}
                            onChange={(e) => {
                              console.log(`Custom field ${field.id} changed:`, e.target.value);
                              updateCustomFieldValue(field.id, e.target.value);
                            }}
                            placeholder={`Specify ${field.label.toLowerCase()}`}
                            className="flex-1 bg-background border border-border/70 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-sm text-foreground"
                          />
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log("Remove custom field clicked:", field.id);
                              removeCustomField(field.id);
                            }}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                            title="Remove field"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Generate Button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("Generate button clicked");
                  generatePrompt();
                }}
                disabled={isLoading || !theme.trim()}
                className="w-full gradient-primary glow-primary hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 py-3 md:py-4 rounded-xl font-semibold text-base md:text-lg shine relative overflow-hidden group active:scale-95"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Generating with Gemini AI...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Sparkles className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                    <span>Generate AI Prompt</span>
                  </div>
                )}
              </button>
            </div>

            {/* Generated Prompt */}
            {generatedPrompt && (
              <div className="glass rounded-2xl md:rounded-3xl p-4 md:p-6 space-y-4 md:space-y-6 animate-fade-in border-gradient">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg md:text-xl font-bold">Your Generated Prompt</h3>
                    <p className="text-sm text-muted-foreground">Powered by Google Gemini AI</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-primary/10 rounded-full text-xs">
                      {getCurrentCategory()}
                    </span>
                    <span className="px-2 py-1 bg-accent/10 rounded-full text-xs">
                      AI Generated
                    </span>
                  </div>
                </div>
                
                <div className="bg-background border border-border/70 rounded-xl md:rounded-2xl p-4 md:p-6 font-mono text-sm leading-relaxed whitespace-pre-wrap overflow-x-auto text-foreground">
                  {generatedPrompt}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log("Copy button clicked");
                      copyToClipboard();
                    }}
                    className="flex-1 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl py-3 px-4 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied!" : "Copy Prompt"}
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log("Regenerate button clicked");
                      regeneratePrompt();
                    }}
                    className="flex-1 bg-secondary/50 hover:bg-secondary border border-border rounded-xl py-3 px-4 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Regenerate
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log("Save button clicked");
                      savePrompt();
                    }}
                    className="flex-1 bg-secondary/50 hover:bg-secondary border border-border rounded-xl py-3 px-4 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
                  >
                    <Save className="h-4 w-4" />
                    Save Prompt
                  </button>
                </div>
              </div>
            )}

            {/* Tips Section */}
            <div className="glass rounded-2xl md:rounded-3xl p-4 md:p-6 border-gradient">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-2">Pro Tips for Better Prompts</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Be specific about what you want - vague prompts produce vague results</li>
                    <li>• Include technical specifications when applicable (resolution, format, etc.)</li>
                    <li>• Mention what to avoid in your prompts</li>
                    <li>• Use clear, concise language without unnecessary jargon</li>
                    <li>• Include context about your target audience</li>
                    <li className="text-accent">• Powered by Google Gemini 1.5 Flash (Free tier: 1500 requests/month)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Generator;