import { Sparkles, Image, Globe, Video, Code, Database, Copy } from "lucide-react";

const categories = [
  { 
    id: "image", 
    name: "Image Generation", 
    icon: Image,
    description: "Generate prompts for AI image generation tools like Midjourney, DALL-E, Stable Diffusion",
    fields: ["theme", "style", "colorPalette", "tone", "details", "aspectRatio", "lighting", "artStyle"]
  },
  { 
    id: "website", 
    name: "Website Creation", 
    icon: Globe,
    description: "Create prompts for website design, development, and optimization",
    fields: ["theme", "style", "colorPalette", "tone", "details", "platform", "targetAudience", "functionality"]
  },
  { 
    id: "video", 
    name: "Video Creation", 
    icon: Video,
    description: "Generate video prompts for scripts, animations, and video editing",
    fields: ["theme", "style", "colorPalette", "tone", "details", "duration", "platform", "musicStyle"]
  },
  { 
    id: "coding", 
    name: "Coding / App Dev", 
    icon: Code,
    description: "Create prompts for code generation, debugging, and software architecture",
    fields: ["theme", "language", "framework", "tone", "details", "complexity", "testing", "dependencies"]
  },
  { 
    id: "data", 
    name: "Data & Research", 
    icon: Database,
    description: "Generate prompts for data analysis, research, and visualization",
    fields: ["theme", "methodology", "dataType", "tone", "details", "tools", "timeframe", "outputFormat"]
  },
  { 
    id: "social", 
    name: "Social Media", 
    icon: Sparkles,
    description: "Create engaging social media content prompts",
    fields: ["theme", "platform", "tone", "targetAudience", "details", "hashtags", "callToAction", "format"]
  },
  { 
    id: "content", 
    name: "Content Writing", 
    icon: Copy,
    description: "Generate prompts for blogs, articles, and written content",
    fields: ["theme", "writingStyle", "tone", "targetAudience", "details", "wordCount", "keywords", "structure"]
  },
  { 
    id: "business", 
    name: "Business & Marketing", 
    icon: Globe,
    description: "Create prompts for business strategies, marketing, and planning",
    fields: ["theme", "industry", "targetAudience", "tone", "details", "goals", "budget", "timeline"]
  },
];

const CategorySidebar = ({ selectedCategory, onSelectCategory }) => {
  return (
    <aside className="w-80 glass border-r border-border/50 p-6 min-h-screen sticky top-0">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Categories
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Select your prompt type</p>
        </div>
        
        <nav className="space-y-2">
          {categories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => onSelectCategory(category.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-left ${
                  isSelected
                    ? "gradient-primary text-white glow-primary"
                    : "hover:bg-secondary/50 text-foreground"
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <div className="flex-1">
                  <span className="font-medium block">{category.name}</span>
                  <span className="text-xs opacity-75 line-clamp-1">{category.description}</span>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="glass rounded-xl p-4 mt-8">
          <h3 className="font-semibold mb-2">How it works</h3>
          <ol className="text-sm text-muted-foreground space-y-1">
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs">1</span>
              <span>Select a category</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs">2</span>
              <span>Fill in the details</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs">3</span>
              <span>Generate your prompt</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs">4</span>
              <span>Copy & use anywhere!</span>
            </li>
          </ol>
        </div>

        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-accent" />
            <h4 className="font-semibold text-sm">Pro Tip</h4>
          </div>
          <p className="text-xs text-muted-foreground">
            The more specific your details, the better the AI prompt will be. Don't hesitate to add custom requirements!
          </p>
        </div>
      </div>
    </aside>
  );
};

export default CategorySidebar;