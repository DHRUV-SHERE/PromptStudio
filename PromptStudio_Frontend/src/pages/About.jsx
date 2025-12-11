import { Sparkles, Target, Zap, Users, Lightbulb, Heart, Shield } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background bg-particles">
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto space-y-20">
          {/* Hero */}
          <div className="text-center space-y-6">
            <div className="inline-block opacity-0 animate-fade-in">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full glass border-primary/30">
                <Lightbulb className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Our Story</span>
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold opacity-0 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              About{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent text-glow">
                PromptStudio
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto opacity-0 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              Empowering creators to harness AI through perfect prompts
            </p>
          </div>

          {/* Mission */}
          <div className="glass rounded-3xl p-8 md:p-12 border-gradient opacity-0 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  PromptStudio was created to bridge the gap between human creativity and AI capabilities. 
                  We believe that everyone should be able to harness the power of AI tools without struggling 
                  to craft the perfect prompt.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Our platform simplifies the process, making AI accessible to creators, 
                  developers, marketers, and researchers alike.
                </p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 gradient-primary opacity-20 blur-3xl rounded-full" />
                <div className="relative grid grid-cols-2 gap-4">
                  <div className="p-6 bg-secondary/50 rounded-2xl text-center">
                    <div className="text-3xl font-bold text-primary">10K+</div>
                    <div className="text-sm text-muted-foreground mt-1">Prompts Created</div>
                  </div>
                  <div className="p-6 bg-secondary/50 rounded-2xl text-center">
                    <div className="text-3xl font-bold text-accent">6</div>
                    <div className="text-sm text-muted-foreground mt-1">Categories</div>
                  </div>
                  <div className="p-6 bg-secondary/50 rounded-2xl text-center">
                    <div className="text-3xl font-bold text-primary">99%</div>
                    <div className="text-sm text-muted-foreground mt-1">Satisfaction</div>
                  </div>
                  <div className="p-6 bg-secondary/50 rounded-2xl text-center">
                    <div className="text-3xl font-bold text-accent">Free</div>
                    <div className="text-sm text-muted-foreground mt-1">Forever</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Values */}
          <div>
            <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: Target,
                  title: "Precision",
                  description: "Generate optimized prompts tailored to your specific needs and use cases.",
                  delay: "0.1s"
                },
                {
                  icon: Zap,
                  title: "Speed",
                  description: "Create perfect prompts in seconds, not hours. Time is valuable.",
                  delay: "0.2s"
                },
                {
                  icon: Users,
                  title: "Community",
                  description: "Built for creators by creators who understand your needs.",
                  delay: "0.3s"
                },
                {
                  icon: Shield,
                  title: "Privacy",
                  description: "Your prompts and history stay secure. We respect your data.",
                  delay: "0.4s"
                },
                {
                  icon: Lightbulb,
                  title: "Innovation",
                  description: "Continuously improving to bring you the best prompt generation tools.",
                  delay: "0.5s"
                },
                {
                  icon: Heart,
                  title: "Accessibility",
                  description: "Free for everyone. No barriers to AI-powered creativity.",
                  delay: "0.6s"
                },
              ].map((value, i) => (
                <div 
                  key={i}
                  className="glass rounded-2xl p-8 text-center border-gradient hover-lift opacity-0 animate-fade-in-up"
                  style={{ animationDelay: value.delay }}
                >
                  <div className="w-16 h-16 mx-auto rounded-2xl gradient-primary flex items-center justify-center mb-5 glow-soft">
                    <value.icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Team/Vision */}
          <div className="glass rounded-3xl p-8 md:p-12 border-gradient text-center">
            <h2 className="text-3xl font-bold mb-6">Our Vision</h2>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-8">
              We envision a world where everyone can effectively communicate with AI tools, 
              regardless of their technical background. PromptStudio is the first step toward 
              democratizing AI interaction—making it intuitive, efficient, and accessible to all.
            </p>
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-lg font-medium bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Building the future of human-AI collaboration
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;