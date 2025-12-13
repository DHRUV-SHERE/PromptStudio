import { Sparkles, Target, Zap, Users, Lightbulb, Heart, Shield, Code, ExternalLink, Mail } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background bg-particles">
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto space-y-20">
          {/* Hero */}
          <div className="text-center space-y-6">
            <div className="inline-block">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full glass border-primary/30">
                <Lightbulb className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Our Story</span>
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold">
              About{" "}
              <span className="text-purple-600 dark:text-pink-500">
                PromptStudio
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              A solo project by Dhruv Shere - Empowering creators to harness AI through perfect prompts
            </p>
          </div>

          {/* Developer Section */}
          <div className="glass rounded-3xl p-8 md:p-12 border-gradient">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-full gradient-primary flex items-center justify-center mb-4">
                  <Code className="h-16 w-16 text-white" />
                </div>
              </div>
              <div className="flex-grow">
                <h2 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">Built by Dhruv Shere</h2>
                <p className="text-lg font-medium text-purple-600 dark:text-pink-500 mb-2">Full-Stack MERN Developer</p>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Gujarat, India • Building innovative web solutions
                </p>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                  PromptStudio is a solo project developed by me, Dhruv Shere, as part of my journey to create 
                  practical, user-friendly applications. As a full-stack developer, I built this platform 
                  from concept to deployment using modern web technologies.
                </p>
                
                {/* Skills */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Built With</h3>
                  <div className="flex flex-wrap gap-2">
                    {["React", "Node.js", "Express JS", "MongoDB", "Tailwind CSS", "JavaScript"].map((skill, i) => (
                      <span key={i} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm text-gray-700 dark:text-gray-300">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Contact Links - UPDATED WITH BUTTON ELEMENTS */}
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    onClick={() => window.open("https://portfolio-dhruvshere.vercel.app", "_blank", "noopener,noreferrer")}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/30 hover:border-primary/60 hover:bg-primary/10 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4 text-gray-900 dark:text-white" />
                    <span className="text-gray-900 dark:text-white">Portfolio</span>
                  </button>
                  {/* Gradient Primary Button */}
                  <button
                    onClick={() => window.location.href = "mailto:sheredhruv@gmail.com"}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg gradient-primary glow-primary text-white font-medium hover:scale-105 transition-all duration-300 shine"
                  >
                    <Mail className="h-4 w-4" />
                    Contact Dhruv
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mission */}
          <div className="glass rounded-3xl p-8 md:p-12 border-gradient">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Project Mission</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                  PromptStudio was created to bridge the gap between human creativity and AI capabilities. 
                  I believe that everyone should be able to harness the power of AI tools without struggling 
                  to craft the perfect prompt.
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  As a solo developer, I built this platform to simplify the process, making AI accessible 
                  to creators, developers, marketers, and researchers alike.
                </p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 gradient-primary opacity-20 blur-3xl rounded-full" />
                <div className="relative grid grid-cols-2 gap-4">
                  <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-2xl text-center">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">MERN</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Tech Stack</div>
                  </div>
                  <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-2xl text-center">
                    <div className="text-3xl font-bold text-pink-600 dark:text-pink-400">Solo</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Developer Project</div>
                  </div>
                  <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-2xl text-center">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">Free</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Forever</div>
                  </div>
                  <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-2xl text-center">
                    <div className="text-3xl font-bold text-pink-600 dark:text-pink-400">6+</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Categories</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Values */}
          <div>
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">Development Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: Target,
                  title: "Clean Code",
                  description: "Writing maintainable, efficient code following best practices and industry standards.",
                },
                {
                  icon: Zap,
                  title: "Performance",
                  description: "Optimizing for speed and responsiveness across all devices and network conditions.",
                },
                {
                  icon: Users,
                  title: "User-First",
                  description: "Prioritizing intuitive user experience and accessibility in every feature.",
                },
                {
                  icon: Shield,
                  title: "Security",
                  description: "Implementing robust authentication and data protection measures.",
                },
                {
                  icon: Lightbulb,
                  title: "Innovation",
                  description: "Exploring new technologies and approaches to solve real-world problems.",
                },
                {
                  icon: Heart,
                  title: "Accessibility",
                  description: "Ensuring the platform is usable by everyone, regardless of technical background.",
                },
              ].map((value, i) => (
                <div 
                  key={i}
                  className="glass rounded-2xl p-8 text-center border-gradient hover-lift"
                >
                  <div className="w-16 h-16 mx-auto rounded-2xl gradient-primary flex items-center justify-center mb-5 glow-soft">
                    <value.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{value.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Vision */}
          <div className="glass rounded-3xl p-8 md:p-12 border-gradient text-center">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Project Vision</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mx-auto mb-8">
              As a solo developer, I envision PromptStudio evolving into a comprehensive platform 
              that makes AI interaction intuitive for everyone. This project represents my commitment 
              to building practical solutions that bridge technology and everyday creativity.
            </p>
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600 dark:text-pink-500" />
              <span className="text-lg font-medium text-purple-600 dark:text-pink-500">
                Solo-built • Continuously Improving • Open to Feedback
              </span>
            </div>
            
            {/* Contact CTA - UPDATED WITH BUTTON ELEMENT */}
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Have feedback or want to collaborate? I'd love to hear from you!
              </p>
              <button
                onClick={() => window.location.href = "mailto:sheredhruv@gmail.com"}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg gradient-primary glow-primary text-white font-medium hover:scale-105 transition-all duration-300 shine"
              >
                <Mail className="h-4 w-4" />
                Contact Dhruv
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;