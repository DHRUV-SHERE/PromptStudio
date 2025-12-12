import { Sparkles, History, LogIn, LogOut, User, Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import Resource from "../Resource";
import { useAuth } from "../context/authContext";

const Navigation = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isActive = (path) => location.pathname === path;
    // Navigation items based on auth state
  const publicLinks = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
  ];

  const authLinks = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
    { to: "/generator", label: "Generator" },
    { to: "/history", label: "History" },
  ];

  const navLinks = isAuthenticated ? authLinks : publicLinks;  

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    navigate("/login"); // ✅ Redirect to login after logout
  };


  return (
    <nav className="glass border-b border-border/50 sticky top-0 z-50">
      <div className="mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo with Image */}
          <Link 
            to="/" 
            className="flex items-center gap-3 hover:opacity-80 transition-all duration-300 group"
          >
            <div className="relative">
              {/* Logo Image Container */}
              <div className="relative w-12 h-12 rounded-xl overflow-hidden">
                <img 
                  src={Resource.logo} 
                  alt="PromptStudio Logo" 
                  className="w-full h-full object-contain p-1"
                />
              </div>
            </div>
            
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                PromptStudio
              </span>
              <span className="text-xs text-muted-foreground -mt-1">
                AI Prompt Generator
              </span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to}>
                <button 
                  className={`relative px-4 py-2 rounded-lg transition-all duration-300 ${
                    isActive(link.to) 
                      ? "text-primary" 
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`}
                >
                  {link.label}
                  {isActive(link.to) && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary animate-pulse-glow" />
                  )}
                </button>
              </Link>
            ))}
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative" onMouseLeave={() => setDropdownOpen(false)}>
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  onMouseEnter={() => setDropdownOpen(true)}
                  className="gap-2 border border-primary/30 hover:border-primary/60 hover:bg-primary/10 transition-all duration-300 px-4 py-2 rounded-lg flex items-center"
                >
                  <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center">
                    {user?.profilePicture ? (
                      <img 
                        src={user.profilePicture} 
                        alt={user.name} 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-3 w-3 text-primary-foreground" />
                    )}
                  </div>
                  <span className="hidden sm:inline">{user?.name || 'User'}</span>
                </button>
                
                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 glass border border-border/50 rounded-lg shadow-lg z-50 animate-fade-in-down">
                    <Link 
                      to="/profile" 
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 hover:bg-secondary/50 cursor-pointer rounded-t-lg transition-colors"
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                    <Link 
                      to="/history" 
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 hover:bg-secondary/50 cursor-pointer transition-colors"
                    >
                      <History className="h-4 w-4" />
                      History
                    </Link>
                    <div className="border-t border-border/50 my-1"></div>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-3 hover:bg-secondary/50 cursor-pointer text-red-500 w-full text-left rounded-b-lg transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <button className="px-4 py-2 rounded-lg glass hover:bg-primary/10 hover:text-primary transition-all duration-300 gap-2 flex items-center">
                    <LogIn className="h-4 w-4" />
                    <span className="hidden sm:inline">Login</span>
                  </button>
                </Link>
                <Link to="/signup">
                  <button className="gradient-primary glow-primary hover:scale-105 transition-all duration-300 gap-2 px-4 py-2 rounded-lg flex items-center shine">
                    <Sparkles className="h-4 w-4" />
                    <span className="hidden sm:inline">Sign Up</span>
                  </button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-secondary/50 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50 animate-fade-in-down">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link 
                  key={link.to} 
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <button 
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                      isActive(link.to) 
                        ? "text-primary bg-primary/10" 
                        : "text-muted-foreground hover:bg-secondary/50"
                    }`}
                  >
                    {link.label}
                  </button>
                </Link>
              ))}
              
              {/* Mobile Auth Buttons */}
              {!isAuthenticated && (
                <div className="flex flex-col gap-2 pt-4 border-t border-border/50">
                  <Link 
                    to="/login" 
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <button className="w-full text-left px-4 py-3 rounded-lg glass hover:bg-primary/10 hover:text-primary transition-all">
                      <div className="flex items-center gap-2">
                        <LogIn className="h-4 w-4" />
                        Login
                      </div>
                    </button>
                  </Link>
                  <Link 
                    to="/signup" 
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <button className="w-full text-left px-4 py-3 rounded-lg gradient-primary glow-primary transition-all shine">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Sign Up
                      </div>
                    </button>
                  </Link>
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