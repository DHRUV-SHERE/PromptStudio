import { Sparkles, Image, Globe, Video, Code, Database, Copy, TrendingUp, Wand2 } from "lucide-react";

const categories = [
  { 
    id: "image", 
    name: "Image Generation", 
    icon: Image,
    description: "Create prompts for Midjourney, DALL-E, Stable Diffusion",
    examples: "Portraits, Logos, Art"
  },
  { 
    id: "website", 
    name: "Website Creation", 
    icon: Globe,
    description: "Generate prompts for web design and development",
    examples: "Landing pages, E-commerce"
  },
  { 
    id: "video", 
    name: "Video Creation", 
    icon: Video,
    description: "Create prompts for video scripts and animations",
    examples: "Ads, Tutorials, Stories"
  },
  { 
    id: "coding", 
    name: "Coding / App Dev", 
    icon: Code,
    description: "Generate code prompts for development tasks",
    examples: "Apps, APIs, Scripts"
  },
  { 
    id: "data", 
    name: "Data & Research", 
    icon: Database,
    description: "Create prompts for data analysis and research",
    examples: "Analytics, Reports, Insights"
  },
  { 
    id: "social", 
    name: "Social Media", 
    icon: TrendingUp,
    description: "Generate engaging social media content prompts",
    examples: "Posts, Captions, Campaigns"
  },
  { 
    id: "content", 
    name: "Content Writing", 
    icon: Copy,
    description: "Create prompts for blogs, articles, and copy",
    examples: "Blogs, Emails, Articles"
  },
  { 
    id: "business", 
    name: "Business & Marketing", 
    icon: Globe,
    description: "Generate business strategy and marketing prompts",
    examples: "Strategies, Plans, Pitches"
  },
];

const CategorySidebar = ({ selectedCategory, onSelectCategory }) => {
  return (
    <aside className="w-full h-full glass border-r border-border/50 p-4 sm:p-6 overflow-y-auto">
      <div className="space-y-4 sm:space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Wand2 className="h-5 w-5 text-primary" />
            <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Categories
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">Choose what you want to create</p>
        </div>
        
        <nav className="space-y-2">
          {categories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => onSelectCategory(category.id)}
                className={`w-full flex items-start gap-3 px-3 sm:px-4 py-3 sm:py-4 rounded-xl transition-all duration-300 text-left group ${
                  isSelected
                    ? "gradient-primary text-white glow-primary"
                    : "hover:bg-secondary/50 text-foreground hover:border-primary/20 border border-transparent"
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isSelected ? "bg-white/20" : "bg-primary/10 group-hover:bg-primary/20"
                }`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold block text-sm sm:text-base truncate">{category.name}</span>
                  <span className={`text-xs line-clamp-2 mt-1 ${
                    isSelected ? "opacity-90" : "text-muted-foreground"
                  }`}>{category.description}</span>
                  <div className="flex items-center gap-1 mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      isSelected ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                    }`}>
                      {category.examples}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="glass rounded-xl p-3 sm:p-4 border-gradient">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm sm:text-base">How it works</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-white">1</span>
              <span className="text-xs sm:text-sm">Pick a category</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-white">2</span>
              <span className="text-xs sm:text-sm">Describe what you want</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-white">3</span>
              <span className="text-xs sm:text-sm">Get perfect prompt</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-white">4</span>
              <span className="text-xs sm:text-sm">Use in any AI tool!</span>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <h4 className="font-semibold text-xs sm:text-sm text-green-600 dark:text-green-400">Ready to Use</h4>
          </div>
          <p className="text-xs text-muted-foreground">
            All prompts are optimized and ready to paste into ChatGPT, Claude, Gemini, Midjourney, and more.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default CategorySidebar;