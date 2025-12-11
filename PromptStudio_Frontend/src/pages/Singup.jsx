import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, Mail, Lock, User, ArrowLeft, Shield, Zap, Rocket, CheckCircle, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api'; // Add this import

const Signup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    
    try {
      // Validation
      if (!name || !email || !password || !confirmPassword) {
        toast.error('Please fill in all fields');
        setIsLoading(false);
        return;
      }
      
      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        setIsLoading(false);
        return;
      }
      
      if (password.length < 6) {
        toast.error('Password must be at least 6 characters');
        setIsLoading(false);
        return;
      }
      
      // Call real API instead of mock
      const result = await authAPI.register({
        name,
        email,
        password
      });
      
      if (result.success) {
        toast.success('Account created successfully! Welcome to PromptStudio.');
        navigate('/login'); // Redirect to dashboard after signup
      }
    } catch (error) {
      // Handle specific error messages from backend
      const errorMessage = error.response?.data?.message || error.message || 'Signup failed';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-particles" />
      <div className="absolute top-1/4 left-10 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/3 right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
      
      {/* Floating Stars */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-accent/30 rounded-full animate-float"
          style={{
            left: `${10 + i * 10}%`,
            top: `${20 + i * 7}%`,
            animationDelay: `${i * 0.3}s`,
            animationDuration: '4s'
          }}
        />
      ))}

      {/* Back Button */}
      <div className="container mx-auto px-4 pt-8">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full hover:bg-primary/10 transition-all duration-300 group hover-lift"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-4xl animate-scale-in">
          <div className="glass rounded-3xl overflow-hidden border-gradient glow-soft">
            <div className="grid md:grid-cols-2 min-h-[620px]">
              {/* Left Side - Form */}
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <div className="mb-8 animate-fade-in-left">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
                      <Star className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                        Join PromptStudio
                      </h1>
                      <p className="text-sm text-muted-foreground">Start your AI journey today</p>
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold mb-2">Create Account</h2>
                  <p className="text-muted-foreground">
                    Sign up to unlock all features and start generating perfect AI prompts
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in-up">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Full Name</label>
                      <div className="relative group">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary group-hover:scale-110 transition-transform duration-300" />
                        <input
                          name="name"
                          type="text"
                          placeholder="John Doe"
                          className="w-full pl-10 pr-4 py-3 rounded-xl glass border border-border/50 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Email Address</label>
                      <div className="relative group">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary group-hover:scale-110 transition-transform duration-300" />
                        <input
                          name="email"
                          type="email"
                          placeholder="you@example.com"
                          className="w-full pl-10 pr-4 py-3 rounded-xl glass border border-border/50 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Password</label>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary group-hover:scale-110 transition-transform duration-300" />
                        <input
                          name="password"
                          type="password"
                          placeholder="••••••••"
                          className="w-full pl-10 pr-4 py-3 rounded-xl glass border border-border/50 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                          required
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Confirm Password</label>
                      <div className="relative group">
                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary group-hover:scale-110 transition-transform duration-300" />
                        <input
                          name="confirmPassword"
                          type="password"
                          placeholder="••••••••"
                          className="w-full pl-10 pr-4 py-3 rounded-xl glass border border-border/50 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-start gap-2 pt-2">
                      <input 
                        type="checkbox" 
                        id="terms"
                        className="rounded border-border bg-input focus:ring-primary focus:ring-offset-0 mt-1"
                        required
                      />
                      <label htmlFor="terms" className="text-sm cursor-pointer select-none">
                        I agree to the{' '}
                        <Link to="/terms" className="text-primary hover:text-accent transition-colors">
                          Terms of Service
                        </Link>
                        {' '}and{' '}
                        <Link to="/privacy" className="text-primary hover:text-accent transition-colors">
                          Privacy Policy
                        </Link>
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full gradient-primary glow-primary hover:scale-[1.02] transition-all duration-300 py-4 rounded-xl font-semibold text-lg shine relative overflow-hidden group"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Creating account...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Rocket className="h-5 w-5 group-hover:translate-y-[-2px] transition-transform" />
                        <span>Create Account</span>
                      </div>
                    )}
                  </button>
                </form>

                <div className="mt-8 text-center animate-fade-in">
                  <p className="text-muted-foreground text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary font-semibold hover:text-accent transition-colors">
                      Sign in instead
                    </Link>
                  </p>
                </div>
              </div>

              {/* Right Side - Benefits */}
              <div className="p-8 md:p-12 gradient-card border-l border-border/50 hidden md:flex flex-col justify-center">
                <div className="space-y-8 animate-fade-in-right">
                  <div>
                    <h3 className="text-2xl font-bold mb-4">Unlock All Features</h3>
                    <p className="text-lg text-muted-foreground">
                      Join thousands of creators who use PromptStudio daily for their AI workflow.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {[
                      { icon: Sparkles, text: 'Unlimited prompt generation', desc: 'Create as many prompts as you need' },
                      { icon: Zap, text: 'Advanced AI models', desc: 'GPT-4, Claude, Midjourney & more' },
                      { icon: Rocket, text: 'Priority access', desc: 'Get new features first' },
                      { icon: Shield, text: 'Export & save', desc: 'Download and organize your prompts' },
                      { icon: Star, text: 'Premium templates', desc: 'Access exclusive prompt templates' },
                      { icon: CheckCircle, text: 'Community access', desc: 'Join our Discord community' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-4 group hover-lift p-3 rounded-lg transition-all duration-300">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <item.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{item.text}</h4>
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="glass rounded-xl p-6 border-gradient animate-pulse-glow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                        <Star className="h-4 w-4 text-white" />
                      </div>
                      <h4 className="font-bold text-lg">Special Offer</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      First 1000 members get <span className="text-accent font-semibold">lifetime access</span> to premium features!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;