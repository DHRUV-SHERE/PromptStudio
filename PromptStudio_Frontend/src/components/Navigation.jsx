import { Sparkles, History, LogIn, LogOut, User, Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Resource from "../Resource";
import { useAuth } from "../context/authContext";

const Navigation = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isActive = (path) => location.pathname === path;

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Navigation items based on auth state
  const publicLinks = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact"},
  ];

  const authLinks = [
    { to: "/", label: "Home"},
    { to: "/about", label: "About"},
    { to: "/contact", label: "Contact"},
    { to: "/generator", label: "Generator"},
    { to: "/history", label: "History"},
  ];

  const navLinks = isAuthenticated ? authLinks : publicLinks;

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    navigate("/login");
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "glass border-b border-border/50 shadow-lg" 
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
<Link 
  to="/" 
  className="flex items-center gap-3 hover:opacity-80 transition-all duration-300 group"
>
  <div className="relative">
    {/* Logo Image Container with dark mode support */}
    <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 dark:from-primary/10 dark:to-accent/10">
      <img 
        src={Resource.logo} 
        alt="PromptStudio Logo" 
        className="w-full h-full object-contain p-1.5 dark:brightness-0 dark:invert dark:contrast-200"
        /* Alternative filters:
           dark:filter dark:brightness-0 dark:invert dark:saturate-0 dark:hue-rotate-180
        */
      />
      {/* Optional: Add a subtle glow effect for dark mode */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 dark:from-primary/10 dark:to-accent/5 rounded-xl" />
    </div>
  </div>
  
  <div className="flex flex-col">
    <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent dark:from-primary/90 dark:to-accent/90">
      PromptStudio
    </span>
    <span className="text-xs text-muted-foreground -mt-1 hidden sm:block dark:text-muted-foreground">
      AI Prompt Generator
    </span>
  </div>
</Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to}>
                <button 
                  className={`relative px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 ${
                    isActive(link.to) 
                      ? "text-primary bg-primary/10" 
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`}
                >
                  <span className="text-sm font-medium">{link.label}</span>
                  {isActive(link.to) && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary animate-pulse-glow" />
                  )}
                </button>
              </Link>
            ))}
          </div>

          {/* Right Section - Auth Only */}
          <div className="flex items-center gap-2 sm:gap-3">

            {isAuthenticated ? (
              <div className="relative" onMouseLeave={() => setDropdownOpen(false)}>
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  onMouseEnter={() => setDropdownOpen(true)}
                  className="gap-2 border border-primary/30 hover:border-primary/60 hover:bg-primary/10 transition-all duration-300 px-3 sm:px-4 py-2 rounded-xl flex items-center group"
                >
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full gradient-primary flex items-center justify-center overflow-hidden">
                    {user?.profilePicture ? (
                      <img 
                        src={user.profilePicture} 
                        alt={user.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-3 w-3 sm:h-4 sm:w-4 text-primary-foreground" />
                    )}
                  </div>
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="text-sm font-medium">{user?.name || 'User'}</span>
                    <span className="text-xs text-muted-foreground">Welcome back!</span>
                  </div>
                </button>
                
                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 glass border border-border/50 rounded-xl shadow-xl z-50 animate-fade-in-down overflow-hidden">
                    <div className="p-4 border-b border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center overflow-hidden">
                          {user?.profilePicture ? (
                            <img 
                              src={user.profilePicture} 
                              alt={user.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="h-5 w-5 text-primary-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{user?.name || 'User'}</p>
                          <p className="text-xs text-muted-foreground">{user?.email || ''}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="py-2">
                      <Link 
                        to="/profile" 
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 cursor-pointer transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Profile</p>
                          <p className="text-xs text-muted-foreground">Manage your account</p>
                        </div>
                      </Link>
                      
                      <Link 
                        to="/history" 
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 cursor-pointer transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <History className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">History</p>
                          <p className="text-xs text-muted-foreground">View your prompts</p>
                        </div>
                      </Link>
                    </div>
                    
                    <div className="border-t border-border/50 p-2">
                      <button 
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 cursor-pointer text-red-500 w-full text-left rounded-lg transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                          <LogOut className="h-4 w-4 text-red-500" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Logout</p>
                          <p className="text-xs text-red-500/70">Sign out of your account</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <button className="px-3 sm:px-4 py-2 rounded-xl glass hover:bg-primary/10 hover:text-primary transition-all duration-300 gap-2 flex items-center group">
                    <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <LogIn className="h-3 w-3 sm:h-4 sm:w-4" />
                    </div>
                    <span className="text-sm font-medium hidden sm:inline">Login</span>
                  </button>
                </Link>
                <Link to="/signup">
                  <button className="gradient-primary glow-primary hover:scale-105 transition-all duration-300 gap-2 px-3 sm:px-4 py-2 rounded-xl flex items-center shine group">
                    <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                      <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                    </div>
                    <span className="text-sm font-medium text-white hidden sm:inline">Sign Up</span>
                  </button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 rounded-xl hover:bg-secondary/50 transition-colors ml-1"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Menu className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50 animate-fade-in-down glass mt-2 rounded-xl">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link 
                  key={link.to} 
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <button 
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                      isActive(link.to) 
                        ? "text-primary bg-primary/10" 
                        : "text-muted-foreground hover:bg-secondary/50"
                    }`}
                  >
                    <span className="font-medium">{link.label}</span>
                    {isActive(link.to) && (
                      <span className="ml-auto w-2 h-2 rounded-full bg-primary animate-pulse" />
                    )}
                  </button>
                </Link>
              ))}
              
              {/* Mobile Auth Buttons */}
              {!isAuthenticated && (
                <div className="flex flex-col gap-2 pt-4 border-t border-border/50 mt-2 px-4">
                  <Link 
                    to="/login" 
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <button className="w-full text-left px-4 py-3 rounded-lg glass hover:bg-primary/10 hover:text-primary transition-all flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <LogIn className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">Login</p>
                        <p className="text-xs text-muted-foreground">Access your account</p>
                      </div>
                    </button>
                  </Link>
                  <Link 
                    to="/signup" 
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <button className="w-full text-left px-4 py-3 rounded-lg gradient-primary glow-primary transition-all flex items-center gap-3 group">
                      <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-white">Sign Up</p>
                        <p className="text-xs text-white/70">Create free account</p>
                      </div>
                    </button>
                  </Link>
                </div>
              )}
              
              {/* Mobile User Info for Authenticated Users */}
              {isAuthenticated && (
                <div className="pt-4 border-t border-border/50 mt-2 px-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center overflow-hidden">
                      {user?.profilePicture ? (
                        <img 
                          src={user.profilePicture} 
                          alt={user.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 text-primary-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">{user?.name || 'User'}</p>
                      <p className="text-xs text-muted-foreground">{user?.email || ''}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Link 
                      to="/profile" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 rounded-lg hover:bg-secondary/50 transition-colors text-center"
                    >
                      <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-1">
                        <User className="h-3 w-3" />
                      </div>
                      <span className="text-xs">Profile</span>
                    </Link>
                    
                    <Link 
                      to="/history" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 rounded-lg hover:bg-secondary/50 transition-colors text-center"
                    >
                      <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-1">
                        <History className="h-3 w-3" />
                      </div>
                      <span className="text-xs">History</span>
                    </Link>
                  </div>
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full mt-4 px-4 py-3 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors flex items-center justify-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;