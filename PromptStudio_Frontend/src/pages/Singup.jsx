import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Sparkles, Mail, Lock, User, ArrowLeft, Shield, Zap, Rocket, CheckCircle, Star, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/authContext';

const Signup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { register, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Calculate password strength
  useEffect(() => {
    if (!formData.password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    
    // Length check
    if (formData.password.length >= 8) strength += 1;
    if (formData.password.length >= 12) strength += 1;
    
    // Character variety checks
    if (/[A-Z]/.test(formData.password)) strength += 1;
    if (/[a-z]/.test(formData.password)) strength += 1;
    if (/[0-9]/.test(formData.password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(formData.password)) strength += 1;
    
    setPasswordStrength(Math.min(strength, 5));
  }, [formData.password]);

  const validateForm = () => {
    const errors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    } else if (passwordStrength < 2) {
      errors.password = 'Password is too weak';
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password
      });
      
      if (result?.success) {
        toast.success('🎉 Account created successfully! Welcome to PromptStudio.', {
          duration: 4000,
          icon: '👋'
        });
        
        // Redirect to home/dashboard
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 500);
      } else {
        toast.error(result?.message || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      
      let errorMessage = 'Signup failed. Please try again.';
      
      if (error.response?.status === 409) {
        errorMessage = 'An account with this email already exists';
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data.message || 'Invalid input data';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      
      // Clear sensitive data on error
      setFormData(prev => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit(e);
    }
  };

  const benefits = [
    { icon: Sparkles, text: 'Unlimited prompt generation', desc: 'Create as many prompts as you need' },
    { icon: Zap, text: 'Advanced AI models', desc: 'GPT-4, Claude, Midjourney & more' },
    { icon: Rocket, text: 'Priority access', desc: 'Get new features first' },
    { icon: Shield, text: 'Export & save', desc: 'Download and organize your prompts' },
    { icon: Star, text: 'Premium templates', desc: 'Access exclusive prompt templates' },
    { icon: CheckCircle, text: 'Community access', desc: 'Join our Discord community' },
  ];

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength <= 2) return 'bg-orange-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    if (passwordStrength <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength <= 1) return 'Very Weak';
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 3) return 'Fair';
    if (passwordStrength <= 4) return 'Good';
    return 'Strong';
  };

  return (
    <div className="min-h-screen gradient-hero relative overflow-hidden bg-gradient-to-br from-background via-background to-accent/5">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(120,119,198,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(120,119,198,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-10 w-64 h-64 bg-accent/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/3 right-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-3/4 left-1/4 w-96 h-96 bg-accent/3 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        
        {/* Animated gradient lines */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent/20 to-transparent animate-slide" style={{ animationDelay: '1s' }} />
      </div>

      {/* Back Button */}
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
          <div className="glass rounded-3xl overflow-hidden border border-border/20 shadow-2xl shadow-accent/5 backdrop-blur-sm">
            <div className="grid lg:grid-cols-2 min-h-[640px]">
              {/* Left Side - Form */}
              <div className="p-6 sm:p-8 lg:p-12 flex flex-col justify-center">
                <div className="mb-6 sm:mb-8 animate-fade-in-left">
                  {/* Logo */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
                      <Star className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                        Join PromptStudio
                      </h1>
                      <p className="text-xs sm:text-sm text-muted-foreground">Start your AI journey today</p>
                    </div>
                  </div>
                  
                  {/* Welcome text */}
                  <h2 className="text-2xl sm:text-3xl font-bold mb-2">Create Account</h2>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Sign up to unlock all features and start generating perfect AI prompts
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 animate-fade-in-up">
                  {/* Name Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Full Name</label>
                    <div className="relative group">
                      <User className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 transition-all duration-300 ${
                        formErrors.name ? 'text-red-500' : 'text-primary'
                      } group-hover:scale-110`} />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="John Doe"
                        className={`w-full pl-10 sm:pl-12 pr-4 py-3 rounded-xl transition-all duration-300 ${
                          formErrors.name 
                            ? 'border-red-500/50 bg-red-500/5 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                            : 'glass border border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20'
                        } focus:outline-none`}
                        disabled={isLoading}
                      />
                    </div>
                    {formErrors.name && (
                      <div className="flex items-center gap-1 text-red-500 text-xs sm:text-sm">
                        <AlertCircle className="h-3 w-3 flex-shrink-0" />
                        {formErrors.name}
                      </div>
                    )}
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Email Address</label>
                    <div className="relative group">
                      <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 transition-all duration-300 ${
                        formErrors.email ? 'text-red-500' : 'text-primary'
                      } group-hover:scale-110`} />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
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
                    <label className="text-sm font-medium text-foreground">Password</label>
                    <div className="relative group">
                      <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 transition-all duration-300 ${
                        formErrors.password ? 'text-red-500' : 'text-primary'
                      } group-hover:scale-110`} />
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
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
                    
                    {/* Password Strength Indicator */}
                    {formData.password && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Password strength:</span>
                          <span className={`text-xs font-medium ${
                            passwordStrength <= 1 ? 'text-red-500' :
                            passwordStrength <= 2 ? 'text-orange-500' :
                            passwordStrength <= 3 ? 'text-yellow-500' :
                            passwordStrength <= 4 ? 'text-blue-500' : 'text-green-500'
                          }`}>
                            {getPasswordStrengthText()}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${getPasswordStrengthColor()}`}
                            style={{ width: `${(passwordStrength / 5) * 100}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">Use at least 8 characters with uppercase, lowercase, numbers & symbols</p>
                      </div>
                    )}
                    
                    {formErrors.password && (
                      <div className="flex items-center gap-1 text-red-500 text-xs sm:text-sm">
                        <AlertCircle className="h-3 w-3 flex-shrink-0" />
                        {formErrors.password}
                      </div>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Confirm Password</label>
                    <div className="relative group">
                      <Shield className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 transition-all duration-300 ${
                        formErrors.confirmPassword ? 'text-red-500' : 'text-primary'
                      } group-hover:scale-110`} />
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="••••••••"
                        className={`w-full pl-10 sm:pl-12 pr-4 py-3 rounded-xl transition-all duration-300 ${
                          formErrors.confirmPassword 
                            ? 'border-red-500/50 bg-red-500/5 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                            : 'glass border border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20'
                        } focus:outline-none`}
                        disabled={isLoading}
                      />
                    </div>
                    {formErrors.confirmPassword && (
                      <div className="flex items-center gap-1 text-red-500 text-xs sm:text-sm">
                        <AlertCircle className="h-3 w-3 flex-shrink-0" />
                        {formErrors.confirmPassword}
                      </div>
                    )}
                  </div>

                  {/* Terms Checkbox */}
                  <div className="flex items-start gap-2 pt-2">
                    <input 
                      type="checkbox" 
                      id="terms"
                      className="rounded border-border bg-input focus:ring-primary focus:ring-offset-0 w-4 h-4 sm:w-5 sm:h-5 mt-1 cursor-pointer"
                      required
                    />
                    <label htmlFor="terms" className="text-xs sm:text-sm cursor-pointer select-none">
                      I agree to the{' '}
                      <Link to="/terms" className="text-primary hover:text-accent transition-colors active:opacity-70">
                        Terms of Service
                      </Link>
                      {' '}and{' '}
                      <Link to="/privacy" className="text-primary hover:text-accent transition-colors active:opacity-70">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full gradient-primary glow-primary hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg shine relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Creating account...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-3">
                        <Rocket className="h-5 w-5 group-hover:translate-y-[-2px] transition-transform" />
                        <span>Create Account</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </button>
                </form>

                {/* Sign in link */}
                <div className="mt-6 sm:mt-8 text-center animate-fade-in">
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    Already have an account?{' '}
                    <Link 
                      to="/login" 
                      className="text-primary font-semibold hover:text-accent transition-colors active:opacity-70"
                    >
                      Sign in instead
                    </Link>
                  </p>
                </div>
              </div>

              {/* Right Side - Benefits (Hidden on mobile, shown on lg+) */}
              <div className="hidden lg:flex p-8 lg:p-12 gradient-card border-l border-border/20 flex-col justify-center relative overflow-hidden">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,var(--accent)_1px,transparent_1px)] bg-[size:40px_40px]" />
                </div>
                
                <div className="space-y-6 lg:space-y-8 animate-fade-in-right relative z-10">
                  {/* Header */}
                  <div>
                    <h3 className="text-2xl lg:text-3xl font-bold mb-3 lg:mb-4">Unlock All Features</h3>
                    <p className="text-base lg:text-lg text-muted-foreground">
                      Join thousands of creators who use PromptStudio daily for their AI workflow.
                    </p>
                  </div>

                  {/* Benefits Grid */}
                  <div className="grid grid-cols-2 gap-3 lg:gap-4">
                    {benefits.slice(0, 4).map((item, i) => (
                      <div 
                        key={i} 
                        className="glass rounded-lg lg:rounded-xl p-3 lg:p-4 hover-lift transition-all duration-300 hover:bg-primary/5 cursor-default group"
                        style={{ animationDelay: `${i * 100}ms` }}
                      >
                        <div className="flex items-center gap-3 lg:gap-4 mb-2">
                          <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                            <item.icon className="h-4 w-4 lg:h-5 lg:w-5 text-primary" />
                          </div>
                          <h4 className="font-semibold text-sm lg:text-base">{item.text}</h4>
                        </div>
                        <p className="text-xs lg:text-sm text-muted-foreground pl-11 lg:pl-14">{item.desc}</p>
                      </div>
                    ))}
                  </div>

                  {/* Special Offer Card */}
                  <div className="glass rounded-xl p-4 lg:p-6 border border-border/20 mt-2 lg:mt-4 hover-lift transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-500" />
                    <div className="flex items-center gap-3 mb-3 relative z-10">
                      <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full gradient-primary flex items-center justify-center">
                        <Star className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                      </div>
                      <h4 className="font-bold text-base lg:text-lg">Special Offer</h4>
                    </div>
                    <p className="text-xs lg:text-sm text-muted-foreground relative z-10">
                      First 1000 members get{' '}
                      <span className="text-accent font-semibold animate-pulse-glow">lifetime access</span>{' '}
                      to premium features!
                    </p>
                  </div>

                  {/* Bottom Features List */}
                  <div className="space-y-3">
                    {benefits.slice(4).map((item, i) => (
                      <div 
                        key={i} 
                        className="flex items-center gap-3 group hover-lift p-2 rounded-lg transition-all duration-300 hover:bg-primary/5 cursor-default"
                      >
                        <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <item.icon className="h-3 w-3 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{item.text}</h4>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mobile Benefits (Shown only on mobile) */}
              <div className="lg:hidden p-6 gradient-card border-t border-border/20">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold">Why Join PromptStudio?</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Join thousands of AI creators
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {benefits.slice(0, 4).map((item, i) => (
                    <div key={i} className="glass rounded-lg p-3 flex flex-col">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                          <item.icon className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-xs font-medium">{item.text.split(' ')[0]}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>
                
                <div className="glass rounded-lg p-3 border border-accent/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-4 w-4 text-accent animate-pulse" />
                    <span className="text-sm font-semibold text-accent">Special Offer</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    First 1000 members get <span className="text-accent font-semibold">lifetime premium</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile extra info */}
          <div className="mt-4 text-center lg:hidden">
            <p className="text-xs text-muted-foreground">
              By signing up, you agree to our{' '}
              <Link to="/terms" className="text-primary font-medium">
                Terms
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-primary font-medium">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-15px) translateX(10px); }
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
        
        @keyframes pulse-glow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        
        .animate-slide {
          animation: slide 4s linear infinite;
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
        
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
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

export default Signup;