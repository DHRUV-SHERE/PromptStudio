import { Sparkles, Github, Twitter, Mail, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-card/30 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center glow-soft group-hover:glow-primary transition-all duration-300">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                PromptStudio
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Generate perfect AI prompts for any creative need. Fast, simple, and powerful.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-5 text-foreground">Product</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/generator" className="text-muted-foreground hover:text-primary transition-colors duration-300">
                  Generator
                </Link>
              </li>
              <li>
                <Link to="/history" className="text-muted-foreground hover:text-primary transition-colors duration-300">
                  History
                </Link>
              </li>
              <li>
                <a href="#categories" className="text-muted-foreground hover:text-primary transition-colors duration-300">
                  Categories
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-5 text-foreground">Company</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors duration-300">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors duration-300">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold mb-5 text-foreground">Connect</h4>
            <div className="flex gap-3">
              <a 
                href="#" 
                className="p-2.5 rounded-xl bg-secondary hover:bg-primary/20 hover:text-primary transition-all duration-300"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="p-2.5 rounded-xl bg-secondary hover:bg-primary/20 hover:text-primary transition-all duration-300"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a 
                href="mailto:hello@promptstudio.com" 
                className="p-2.5 rounded-xl bg-secondary hover:bg-primary/20 hover:text-primary transition-all duration-300"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border/50 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Made with <Heart className="h-4 w-4 text-accent fill-accent" /> by PromptStudio Team
          </p>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} PromptStudio. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;