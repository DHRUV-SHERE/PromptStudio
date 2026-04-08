import { Sparkles, Zap, Rocket, Image, Video, Code2, TrendingUp, Shield, Star, Clock, Pen, BarChart3, Smartphone, BookOpen, Layers } from "lucide-react";
import { Link } from "react-router-dom";
import CategoryCard from "../components/CatrgoryCard";
import { useAuth } from "../context/authContext";

const Index = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background bg-particles">
      
      {/* Hero Section */}
      <section className="relative container mx-auto px-4 pt-20 pb-32 text-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] gradient-hero opacity-50 blur-3xl" />
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute top-40 right-20 w-40 h-40 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        
        <div className="relative max-w-5xl mx-auto space-y-8">
          <div className="inline-block animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center gap-2 px-5 py-2.5 rounded-full glass border-primary/30 animate-pulse-glow">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">AI-Powered Prompt Generation</span>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Generate Perfect{" "}
            <span className="text-primary dark:text-accent">
              AI Prompts
            </span>
            <br />
            <span className="text-foreground">Instantly</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.3s" }}>
            Select your category → Customize options → Get an optimized prompt ready to use with any AI tool
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <Link to={isAuthenticated ? "/generator" : "/signup"}>
              <button className="gradient-primary glow-primary hover:scale-105 transition-all duration-300 text-lg h-14 px-8 font-semibold shine rounded-lg flex items-center">
                <Zap className="mr-2 h-5 w-5 text-primary-foreground" />
                <span className="text-primary-foreground">{isAuthenticated ? "Start Generating" : "Get Started Free"}</span>
              </button>
            </Link>
            <a href="#categories">
              <button className="text-lg h-14 px-8 font-semibold hover:scale-105 transition-all duration-300 border border-primary/30 hover:border-primary/60 hover:bg-primary/10 rounded-lg flex items-center">
                <Rocket className="mr-2 h-5 w-5 text-foreground" />
                <span className="text-foreground">Explore Categories</span>
              </button>
            </a>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center items-center gap-6 pt-8 animate-fade-in" style={{ animationDelay: "0.5s" }}>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm">100% Free</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4 text-accent" />
              <span className="text-sm">Instant Results</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Star className="h-4 w-4 text-primary" />
              <span className="text-sm">No AI Experience Needed</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { value: "10K+", label: "Prompts Generated", delay: "0.1s" },
            { value: "9+", label: "Categories", delay: "0.2s" },
            { value: "99%", label: "User Satisfaction", delay: "0.3s" },
            { value: "Free", label: "To Use", delay: "0.4s" },
          ].map((stat, i) => (
            <div 
              key={i} 
              className="text-center p-6 glass rounded-2xl border-gradient hover-lift animate-fade-in-up"
              style={{ animationDelay: stat.delay }}
            >
              <div className="text-3xl md:text-4xl font-bold text-primary">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground mt-2">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="categories" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <span className="text-foreground">Choose Your </span>
            <span className="text-primary dark:text-accent">Prompt Category</span>
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Specialized prompt generators for every creative need
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <CategoryCard
            title="Image Generation"
            description="Create stunning visuals with AI. Perfect for DALL-E, Midjourney, Stable Diffusion."
            icon={Image}
            delay="0.1s"
          />
          <CategoryCard
            title="Content Writing"
            description="Generate high-quality articles, blog posts, and creative stories instantly."
            icon={Pen}
            delay="0.2s"
          />
          <CategoryCard
            title="Code Generation"
            description="Write better code faster with AI-optimized programming prompts."
            icon={Code2}
            delay="0.3s"
          />
          <CategoryCard
            title="Business & Marketing"
            description="Create compelling marketing strategies and business content with AI."
            icon={BarChart3}
            delay="0.4s"
          />
          <CategoryCard
            title="Social Media"
            description="Optimize your social presence with engaging post ideas and captions."
            icon={Smartphone}
            delay="0.5s"
          />
          <CategoryCard
            title="Education & Learning"
            description="Create lesson plans, study guides, and educational materials effortlessly."
            icon={BookOpen}
            delay="0.6s"
          />
        </div>
        
        <div className="text-center mt-12">
          <Link to="/generator">
            <button className="text-primary hover:text-accent font-medium flex items-center gap-2 mx-auto group transition-all">
              View All 9+ Categories
              <Layers className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-foreground">How to Use </span>
            <span className="text-primary dark:text-accent">PromptStudio</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Generate perfect AI prompts in 3 simple steps - no technical knowledge required!
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Step by step guide */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              { 
                step: "1", 
                title: "Choose What You Want to Create", 
                desc: "Pick from 9+ categories like Images, Content, Code, or Business. Each category is designed for specific AI tools.", 
                icon: Layers,
                example: "Example: Select 'Image Generation' for Midjourney prompts"
              },
              { 
                step: "2", 
                title: "Describe Your Idea", 
                desc: "Simply write what you want in plain English. Add details like style, colors, or target audience using our simple dropdown menus.", 
                icon: Sparkles,
                example: "Example: 'A sunset over mountains in watercolor style'"
              },
              { 
                step: "3", 
                title: "Copy & Use Anywhere", 
                desc: "Get your optimized prompt instantly. Copy it and paste directly into ChatGPT, Claude, Midjourney, or any AI tool. It's ready to use!", 
                icon: Zap,
                example: "Works with: ChatGPT, Claude, Gemini, Midjourney, DALL-E"
              },
            ].map((item, i) => (
              <div 
                key={i} 
                className="relative text-center p-8 glass rounded-2xl border-gradient hover-lift"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-lg font-bold text-white glow-primary">
                  {item.step}
                </div>
                <div className="w-16 h-16 mx-auto mb-6 mt-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <item.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">{item.title}</h3>
                <p className="text-muted-foreground mb-4">{item.desc}</p>
                <div className="text-xs text-primary bg-primary/10 rounded-lg p-2">
                  {item.example}
                </div>
              </div>
            ))}
          </div>

          {/* Visual example */}
          <div className="glass rounded-3xl p-8 border-gradient">
            <h3 className="text-2xl font-bold text-center mb-8 text-foreground">See It In Action</h3>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h4 className="text-lg font-semibold mb-4 text-primary">What You Type:</h4>
                <div className="bg-background border border-border/70 rounded-xl p-4 mb-4">
                  <p className="text-sm text-muted-foreground mb-2">Category: Image Generation</p>
                  <p className="text-foreground">"A cozy coffee shop interior with warm lighting"</p>
                  <p className="text-sm text-muted-foreground mt-2">Style: Realistic • Colors: Warm Tones</p>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4 text-primary">What You Get:</h4>
                <div className="bg-secondary border border-border rounded-xl p-4">
                  <p className="text-sm text-foreground font-mono leading-relaxed">
                    "Create a photorealistic image of a cozy coffee shop interior with warm, ambient lighting. Include comfortable seating, wooden furniture, soft warm color palette with browns and golds, steam rising from coffee cups, and a welcoming atmosphere. High resolution, professional photography style."
                  </p>
                </div>
              </div>
            </div>
            <div className="text-center mt-6">
              <p className="text-sm text-muted-foreground mb-4 flex items-center justify-center gap-1"><Sparkles className="h-4 w-4" /> Perfect for pasting into Midjourney, DALL-E, or any image AI!</p>
              <Link to="/generator">
                <button className="gradient-primary text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all">
                  Try It Yourself →
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto glass rounded-3xl p-8 md:p-12 border-gradient">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-8">
                <span className="text-foreground">Why Choose </span>
                <span className="text-primary dark:text-accent">PromptStudio?</span>
              </h2>
              <div className="space-y-5">
                {[
                  { text: "No technical knowledge required - anyone can use it", icon: Shield },
                  { text: "Works with ALL AI tools (ChatGPT, Claude, Midjourney, etc.)", icon: Rocket },
                  { text: "Get better results from AI with optimized prompts", icon: Sparkles },
                  { text: "Save time by using our pre-built categories and options", icon: Clock },
                  { text: "100% free to use for all your creative projects", icon: Star }
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-lg text-foreground font-medium">{feature.text}</span>
                  </div>
                ))}
              </div>
              <div className="mt-10">
                <Link to="/signup">
                  <button className="gradient-primary text-white px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-all shadow-lg glow-primary">
                    Create Your Free Account
                  </button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="w-full h-[400px] rounded-2xl overflow-hidden glass border-gradient rotate-2 hover:rotate-0 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <Zap className="w-32 h-32 text-primary animate-pulse-glow" />
                </div>
              </div>
              {/* Floating badges */}
              <div className="absolute -top-6 -right-6 glass p-4 rounded-2xl border-gradient animate-float shadow-xl">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm font-bold">10,000+ Users</span>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 glass p-4 rounded-2xl border-gradient animate-float shadow-xl" style={{ animationDelay: "1.5s" }}>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-bold">Top Rated AI Tool</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground">
            Ready to Unlock the Full Power of <span className="text-primary">AI?</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Join thousands of creators using PromptStudio to generate perfect prompts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <button className="w-full sm:w-auto gradient-primary text-white px-10 py-5 rounded-2xl font-bold text-xl hover:scale-105 transition-all shadow-xl glow-primary">
                Get Started for Free
              </button>
            </Link>
            <Link to="/about">
              <button className="w-full sm:w-auto glass text-foreground px-10 py-5 rounded-2xl font-bold text-xl hover:bg-secondary/50 transition-all border border-border">
                Learn More
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;