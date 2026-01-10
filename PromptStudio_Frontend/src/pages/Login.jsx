import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Sparkles, Mail, Lock, ArrowLeft, Zap, Shield, Rocket, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/authContext';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState({});
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Get return URL from location state or default to home
  const from = location.state?.from || '/';

  const validateForm = () => {
    const errors = {};
    
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    setIsLoading(true);
    setFormErrors({});
    
    try {
      const result = await login({
        email,
        password
      });
      
      if (result?.success) {
        toast.success('Welcome back! You have successfully logged in.', {
          icon: '👋',
          duration: 3000
        });
        
        // Small delay for better UX
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 500);
      } else {
        toast.error(result?.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle specific error cases
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password';
      } else if (error.response?.status === 429) {
        errorMessage = 'Too many attempts. Please try again later.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      
      // Clear password on error
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit(e);
    }
  };

  const features = [
    { icon: Sparkles, text: 'AI-Optimized prompts', desc: 'Get the best results from any AI model' },
    { icon: Zap, text: 'Lightning fast generation', desc: 'Create prompts in seconds' },
    { icon: Rocket, text: 'Advanced templates', desc: 'Professional templates for every use case' },
    { icon: Shield, text: 'Secure & private', desc: 'Your data is encrypted and secure' },
  ];

  return (
    <div className="min-h-screen gradient-hero relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(120,119,198,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(120,119,198,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/3 right-20 w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-3/4 left-1/3 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
        
        {/* Animated gradient lines */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-slide" />
      </div>

      {/* Back Button - Fixed position on mobile */}
      <div className="container mx-auto px-4 pt-6 sm:pt-8 relative z-10">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 glass px-4 py-2 sm:py-2.5 rounded-xl hover:bg-primary/10 transition-all duration-300 group hover-lift active:scale-95 w-fit"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-6 sm:py-8 relative z-10">
        <div className="w-full max-w-6xl animate-scale-in">
          <div className="glass rounded-3xl overflow-hidden border border-border/20 shadow-2xl shadow-primary/5 backdrop-blur-sm">
            <div className="grid lg:grid-cols-2 min-h-[600px]">
              {/* Left Side - Form */}
              <div className="p-6 sm:p-8 lg:p-12 flex flex-col justify-center">
                <div className="mb-6 sm:mb-8 animate-fade-in-left">
                  {/* Logo */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
                      <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        PromptStudio
                      </h1>
                      <p className="text-xs sm:text-sm text-muted-foreground">AI-Powered Prompt Generation</p>
                    </div>
                  </div>
                  
                  {/* Welcome text */}
                  <h2 className="text-2xl sm:text-3xl font-bold mb-2">Welcome Back</h2>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Sign in to continue your AI journey and access your personalized dashboard
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 animate-fade-in-up">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Email Address</label>
                    <div className="relative group">
                      <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 transition-all duration-300 ${
                        formErrors.email ? 'text-red-500' : 'text-primary'
                      } group-hover:scale-110`} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (formErrors.email) setFormErrors({...formErrors, email: ''});
                        }}
                        onKeyPress={handleKeyPress}
                        placeholder="you@example.com"
                        className={`w-full pl-10 sm:pl-12 pr-4 py-3 rounded-xl transition-all duration-300 ${
                          formErrors.email 
                            ? 'border-red-500/50 bg-red-500/5 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                            : 'glass border border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20'
                        } focus:outline-none`}
                        disabled={isLoading}
                      />
                    </div>
                    {formErrors.email && (
                      <div className="flex items-center gap-1 text-red-500 text-xs sm:text-sm">
                        <AlertCircle className="h-3 w-3 flex-shrink-0" />
                        {formErrors.email}
                      </div>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-foreground">Password</label>
                      <Link 
                        to="/forgot-password" 
                        className="text-xs text-primary hover:text-accent transition-colors active:opacity-70"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative group">
                      <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 transition-all duration-300 ${
                        formErrors.password ? 'text-red-500' : 'text-primary'
                      } group-hover:scale-110`} />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (formErrors.password) setFormErrors({...formErrors, password: ''});
                        }}
                        onKeyPress={handleKeyPress}
                        placeholder="••••••••"
                        className={`w-full pl-10 sm:pl-12 pr-4 py-3 rounded-xl transition-all duration-300 ${
                          formErrors.password 
                            ? 'border-red-500/50 bg-red-500/5 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                            : 'glass border border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20'
                        } focus:outline-none`}
                        disabled={isLoading}
                      />
                    </div>
                    {formErrors.password && (
                      <div className="flex items-center gap-1 text-red-500 text-xs sm:text-sm">
                        <AlertCircle className="h-3 w-3 flex-shrink-0" />
                        {formErrors.password}
                      </div>
                    )}
                  </div>

                  {/* Remember me */}
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="remember"
                      className="rounded border-border bg-input focus:ring-primary focus:ring-offset-0 w-4 h-4 sm:w-5 sm:h-5 cursor-pointer"
                    />
                    <label htmlFor="remember" className="text-xs sm:text-sm cursor-pointer select-none">
                      Remember me for 30 days
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full gradient-primary glow-primary hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg shine relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-3">
                        <Zap className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                        <span>Sign In</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </button>
                </form>

                {/* Sign up link */}
                <div className="mt-6 sm:mt-8 text-center animate-fade-in">
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    Don't have an account?{' '}
                    <Link 
                      to="/signup" 
                      className="text-primary font-semibold hover:text-accent transition-colors active:opacity-70"
                    >
                      Sign up now
                    </Link>
                  </p>
                </div>
              </div>

              {/* Right Side - Features (Hidden on mobile, shown on lg+) */}
              <div className="hidden lg:flex p-8 lg:p-12 gradient-card border-l border-border/20 flex-col justify-center relative overflow-hidden">
                {/* Background pattern for features */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,var(--primary)_1px,transparent_1px)] bg-[size:40px_40px]" />
                </div>
                
                <div className="space-y-6 lg:space-y-8 animate-fade-in-right relative z-10">
                  {/* Header */}
                  <div>
                    <h3 className="text-2xl lg:text-3xl font-bold mb-3 lg:mb-4">Start Creating Perfect Prompts</h3>
                    <p className="text-base lg:text-lg text-muted-foreground">
                      Access your saved prompts, templates, and personalized AI recommendations.
                    </p>
                  </div>

                  {/* Features list */}
                  <div className="space-y-4 lg:space-y-6">
                    {features.map((item, i) => (
                      <div 
                        key={i} 
                        className="flex items-start gap-4 group hover-lift p-3 lg:p-4 rounded-xl transition-all duration-300 hover:bg-primary/5 cursor-default"
                        style={{ animationDelay: `${i * 100}ms` }}
                      >
                        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                          <item.icon className="h-5 w-5 lg:h-6 lg:w-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm lg:text-base">{item.text}</h4>
                          <p className="text-xs lg:text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Free forever card */}
                  <div className="glass rounded-xl p-4 lg:p-6 border border-border/20 mt-4 lg:mt-6 hover-lift transition-all duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <CheckCircle className="h-5 w-5 lg:h-6 lg:w-6 text-accent animate-pulse" />
                      <h4 className="font-bold text-base lg:text-lg">Free Forever</h4>
                    </div>
                    <p className="text-xs lg:text-sm text-muted-foreground">
                      No credit card required. Get started with our free plan and unlock premium features anytime.
                    </p>
                  </div>
                </div>
              </div>

              {/* Mobile Features Slider (Shown only on mobile) */}
              <div className="lg:hidden p-6 gradient-card border-t border-border/20">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold">Why Join PromptStudio?</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {features.slice(0, 4).map((item, i) => (
                    <div key={i} className="glass rounded-lg p-3 flex flex-col items-center text-center">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                        <item.icon className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-xs font-medium">{item.text}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <CheckCircle className="h-4 w-4 text-accent inline-block mr-1 animate-pulse" />
                  <span className="text-xs text-muted-foreground">Free Forever • No credit card needed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile extra info */}
          <div className="mt-4 text-center lg:hidden">
            <p className="text-xs text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-medium">
                Sign in instead
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Add CSS animations */}
      <style jsx ="true">{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        
        @keyframes slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes scale-in {
          0% { transform: scale(0.95); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes fade-in-left {
          0% { transform: translateX(-20px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes fade-in-up {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes fade-in-right {
          0% { transform: translateX(20px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-slide {
          animation: slide 3s linear infinite;
        }
        
        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }
        
        .animate-fade-in-left {
          animation: fade-in-left 0.6s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out 0.1s both;
        }
        
        .animate-fade-in-right {
          animation: fade-in-right 0.6s ease-out 0.2s both;
        }
        
        .hover-lift {
          transition: all 0.3s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-2px);
        }
        
        .shine {
          position: relative;
          overflow: hidden;
        }
        
        .shine::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            to right,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.1) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          transform: rotate(30deg);
          animation: shine 3s infinite;
        }
        
        @keyframes shine {
          0% { transform: translateX(-100%) rotate(30deg); }
          100% { transform: translateX(100%) rotate(30deg); }
        }
      `}</style>
    </div>
  );
};

export default Login;