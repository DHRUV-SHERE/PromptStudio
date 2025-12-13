import { Sparkles, Zap, Rocket, Image, Globe, Video, Code, Database, TrendingUp, CheckCircle2, Users, Layers, ArrowRight, Star, Shield, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import CategoryCard from "../components/CatrgoryCard";

const Index = () => {
  const user = null;

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
            <Link to={user ? "/generator" : "/auth"}>
              <button className="gradient-primary glow-primary hover:scale-105 transition-all duration-300 text-lg h-14 px-8 font-semibold shine rounded-lg flex items-center">
                <Zap className="mr-2 h-5 w-5 text-primary-foreground" />
                <span className="text-primary-foreground">{user ? "Start Generating" : "Get Started Free"}</span>
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
            { value: "6", label: "Categories", delay: "0.2s" },
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
            title="Website Creation"
            description="Build modern websites with AI assistance. Optimized for development tools."
            icon={Globe}
            delay="0.2s"
          />
          <CategoryCard
            title="Video Creation"
            description="Generate engaging video concepts and scripts for any platform."
            icon={Video}
            delay="0.3s"
          />
          <CategoryCard
            title="Coding Assistant"
            description="Write better code faster with AI-optimized programming prompts."
            icon={Code}
            delay="0.4s"
          />
          <CategoryCard
            title="Data & Research"
            description="Extract insights and analyze data with precision AI prompts."
            icon={Database}
            delay="0.5s"
          />
          <CategoryCard
            title="Marketing & Branding"
            description="Create compelling content and brand strategies with AI."
            icon={TrendingUp}
            delay="0.6s"
          />
        </div>
      </section>

      {/* How It Works - REMOVED OPACITY-0 */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gray-900 dark:text-white">How It </span>
            <span className="text-purple-600 dark:text-pink-500">Works</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Three simple steps to perfect prompts
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            { step: "1", title: "Choose Category", desc: "Select from image, website, video, coding, data, or marketing prompts.", icon: Layers },
            { step: "2", title: "Customize Options", desc: "Fine-tune your prompt with style, tone, theme, and specific details.", icon: Sparkles },
            { step: "3", title: "Generate & Use", desc: "Get your optimized prompt instantly. Copy and use with any AI tool.", icon: Zap },
          ].map((item, i) => (
            <div 
              key={i} 
              className="relative text-center p-8 glass rounded-2xl border-gradient hover-lift"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-sm font-bold text-white glow-primary">
                {item.step}
              </div>
              <div className="w-16 h-16 mx-auto mb-6 mt-4 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <item.icon className="h-8 w-8 text-purple-600 dark:text-pink-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{item.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to={user ? "/generator" : "/auth"}>
            <button className="gradient-primary glow-primary hover:scale-105 transition-all duration-300 shine rounded-lg px-6 py-3 flex items-center mx-auto">
              <span className="text-white">{user ? "Try It Now" : "Get Started"}</span>
              <ArrowRight className="ml-2 h-5 w-5 text-white" />
            </button>
          </Link>
        </div>
      </section>

      {/* Why Choose Us - REMOVED OPACITY-0 */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto glass rounded-3xl p-8 md:p-12 border-gradient">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-8">
                <span className="text-gray-900 dark:text-white">Why Choose </span>
                <span className="text-purple-600 dark:text-pink-500">PromptStudio?</span>
              </h2>
              <div className="space-y-5">
                {[
                  "Optimized prompts for better AI outputs",
                  "Save and access your prompt history",
                  "Multiple categories for any use case",
                  "Completely free to use",
                  "No AI experience required",
                ].map((feature, i) => (
                  <div 
                    key={i} 
                    className="flex items-center gap-4"
                  >
                    <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-lg text-gray-900 dark:text-white">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Users, title: "Easy to Use", desc: "No learning curve", color: "primary" },
                { icon: Layers, title: "Versatile", desc: "6+ categories", color: "accent" },
                { icon: Zap, title: "Instant", desc: "Generate in seconds", color: "primary" },
                { icon: Sparkles, title: "Quality", desc: "Optimized outputs", color: "accent" },
              ].map((item, i) => (
                <div 
                  key={i} 
                  className="p-6 bg-gray-100 dark:bg-gray-800 rounded-2xl text-center hover-lift"
                >
                  <item.icon className={`h-10 w-10 mx-auto mb-3 ${item.color === 'primary' ? 'text-purple-600 dark:text-purple-400' : 'text-pink-600 dark:text-pink-400'}`} />
                  <div className="font-semibold text-gray-900 dark:text-white">{item.title}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - REMOVED OPACITY-0 */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-gray-900 dark:text-white">Ready to Create </span>
            <span className="text-purple-600 dark:text-pink-500">Perfect Prompts?</span>
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-600 dark:text-gray-400">
            Join thousands of creators using PromptStudio to generate optimized AI prompts. It's free and takes just seconds.
          </p>
          <Link to={user ? "/generator" : "/auth"}>
            <button className="gradient-primary glow-primary hover:scale-105 transition-all duration-300 text-lg h-14 px-10 font-semibold shine rounded-lg flex items-center mx-auto">
              <Sparkles className="mr-2 h-5 w-5 text-white" />
              <span className="text-white">{user ? "Go to Generator" : "Start For Free"}</span>
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;