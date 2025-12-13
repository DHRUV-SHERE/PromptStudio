import { Sparkles, Image, Globe, Video, Code, Database, Copy, TrendingUp } from "lucide-react";

const categories = [
  { 
    id: "image", 
    name: "Image Generation", 
    icon: Image,
    description: "Generate prompts for AI image generation tools"
  },
  { 
    id: "website", 
    name: "Website Creation", 
    icon: Globe,
    description: "Create prompts for website design and development"
  },
  { 
    id: "video", 
    name: "Video Creation", 
    icon: Video,
    description: "Generate video prompts for scripts and animations"
  },
  { 
    id: "coding", 
    name: "Coding / App Dev", 
    icon: Code,
    description: "Create prompts for code generation and debugging"
  },
  { 
    id: "data", 
    name: "Data & Research", 
    icon: Database,
    description: "Generate prompts for data analysis and visualization"
  },
  { 
    id: "social", 
    name: "Social Media", 
    icon: TrendingUp,
    description: "Create engaging social media content prompts"
  },
  { 
    id: "content", 
    name: "Content Writing", 
    icon: Copy,
    description: "Generate prompts for blogs and articles"
  },
  { 
    id: "business", 
    name: "Business & Marketing", 
    icon: Globe,
    description: "Create prompts for business strategies and planning"
  },
];

const CategorySidebar = ({ selectedCategory, onSelectCategory }) => {
  return (
    <aside className="w-full h-full glass border-r border-border/50 p-4 sm:p-6 overflow-y-auto">
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Categories
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Select your prompt type</p>
        </div>
        
        <nav className="space-y-2">
          {categories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => onSelectCategory(category.id)}
                className={`w-full flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-all duration-300 text-left ${
                  isSelected
                    ? "gradient-primary text-white glow-primary"
                    : "hover:bg-secondary/50 text-foreground"
                }`}
              >
                <Icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="font-medium block text-sm sm:text-base truncate">{category.name}</span>
                  <span className="text-xs opacity-75 line-clamp-1 hidden sm:block">{category.description}</span>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="glass rounded-xl p-3 sm:p-4">
          <h3 className="font-semibold text-sm sm:text-base mb-2">How it works</h3>
          <ol className="text-xs sm:text-sm text-muted-foreground space-y-1">
            <li className="flex items-center gap-2">
              <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs">1</span>
              <span>Select a category</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs">2</span>
              <span>Fill in the details</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs">3</span>
              <span>Generate your prompt</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs">4</span>
              <span>Copy & use anywhere!</span>
            </li>
          </ol>
        </div>

        <div className="glass rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-accent" />
            <h4 className="font-semibold text-xs sm:text-sm">Pro Tip</h4>
          </div>
          <p className="text-xs text-muted-foreground">
            The more specific your details, the better the AI prompt will be.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default CategorySidebar;