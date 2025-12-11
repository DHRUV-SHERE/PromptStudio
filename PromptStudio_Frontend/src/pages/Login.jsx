import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, Mail, Lock, ArrowLeft, Zap, Shield, Rocket, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api'; // Add this import

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email');
    const password = formData.get('password');
    
    try {
      if (!email || !password) {
        toast.error('Please fill in all fields');
        setIsLoading(false);
        return;
      }
      
      // Call real API instead of mock
      const result = await authAPI.login({
        email,
        password
      });
      
      if (result.success) {
        toast.success('Welcome back! You have successfully logged in.');
        navigate('/'); // Redirect to dashboard after login
      }
    } catch (error) {
      // Handle specific error messages from backend
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-particles" />
      <div className="absolute top-1/4 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/3 right-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      
      {/* Floating Particles */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-primary/20 rounded-full animate-float"
          style={{
            left: `${20 + i * 15}%`,
            top: `${10 + i * 10}%`,
            animationDelay: `${i * 0.5}s`,
            animationDuration: '3s'
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
            <div className="grid md:grid-cols-2 min-h-[580px]">
              {/* Left Side - Form */}
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <div className="mb-8 animate-fade-in-left">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        PromptStudio
                      </h1>
                      <p className="text-sm text-muted-foreground">AI-Powered Prompt Generation</p>
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
                  <p className="text-muted-foreground">
                    Sign in to continue your AI journey and access your personalized dashboard
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up">
                  <div className="space-y-4">
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
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-foreground">Password</label>
                        <Link to="/forgot-password" className="text-xs text-primary hover:text-accent transition-colors">
                          Forgot password?
                        </Link>
                      </div>
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
                    </div>

                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="remember"
                        className="rounded border-border bg-input focus:ring-primary focus:ring-offset-0"
                      />
                      <label htmlFor="remember" className="text-sm cursor-pointer select-none">
                        Remember me for 30 days
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
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Zap className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                        <span>Sign In</span>
                      </div>
                    )}
                  </button>
                </form>

                <div className="mt-8 text-center animate-fade-in">
                  <p className="text-muted-foreground text-sm">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-primary font-semibold hover:text-accent transition-colors">
                      Sign up now
                    </Link>
                  </p>
                </div>
              </div>

              {/* Right Side - Features */}
              <div className="p-8 md:p-12 gradient-card border-l border-border/50 hidden md:flex flex-col justify-center">
                <div className="space-y-8 animate-fade-in-right">
                  <div>
                    <h3 className="text-2xl font-bold mb-4">Start Creating Perfect Prompts</h3>
                    <p className="text-lg text-muted-foreground">
                      Access your saved prompts, templates, and personalized AI recommendations.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {[
                      { icon: Sparkles, text: 'AI-Optimized prompts', desc: 'Get the best results from any AI model' },
                      { icon: Zap, text: 'Lightning fast generation', desc: 'Create prompts in seconds' },
                      { icon: Rocket, text: 'Advanced templates', desc: 'Professional templates for every use case' },
                      { icon: Shield, text: 'Secure & private', desc: 'Your data is encrypted and secure' },
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

                  <div className="glass rounded-xl p-6 border-gradient">
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle className="h-6 w-6 text-accent animate-pulse" />
                      <h4 className="font-bold text-lg">Free Forever</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      No credit card required. Get started with our free plan and unlock premium features anytime.
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

export default Login;