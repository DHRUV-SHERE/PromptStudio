import { Mail, MessageSquare, Send, MapPin, Clock } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api"; // or use authAPI if you prefer

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error("Please fill in all fields");
      return;
    }
    
    if (formData.message.length < 10) {
      toast.error("Message must be at least 10 characters");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await api.post('/contact', formData);
      
      if (response.data.success) {
        toast.success(response.data.message || "Message sent successfully!");
        
        // Reset form
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: ""
        });
      }
    } catch (error) {
      console.error('Contact form error:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Failed to send message. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-particles opacity-50" />
      <div className="absolute top-1/4 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      
      <main className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center space-y-6 mb-16">
            <div className="inline-block">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-primary/30">
                <MessageSquare className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Get In Touch</span>
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold">
              Contact{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Us
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-8">
            {/* Contact Info */}
            <div className="md:col-span-2 space-y-6">
              {[
                {
                  icon: Mail,
                  title: "Email Us",
                  description: "hello@promptstudio.com",
                  subtitle: "We reply within 24 hours",
                },
                {
                  icon: MessageSquare,
                  title: "Live Chat",
                  description: "Available 24/7",
                  subtitle: "Instant support for quick questions",
                },
                {
                  icon: Clock,
                  title: "Response Time",
                  description: "Under 24 hours",
                  subtitle: "We value your time",
                },
                {
                  icon: MapPin,
                  title: "Location",
                  description: "Global",
                  subtitle: "Remote-first team",
                },
              ].map((item, i) => (
                <div 
                  key={i}
                  className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                      <item.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{item.title}</h3>
                      <p className="text-foreground">{item.description}</p>
                      <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact Form */}
            <div className="md:col-span-3 bg-card border border-border rounded-3xl p-8">
              <h2 className="text-2xl font-bold mb-6">Send a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium text-foreground">
                      Name
                    </label>
                    <input 
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      className="w-full px-4 py-2 rounded-lg bg-secondary border border-border focus:border-primary focus:outline-none transition-colors"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-foreground">
                      Email
                    </label>
                    <input 
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      className="w-full px-4 py-2 rounded-lg bg-secondary border border-border focus:border-primary focus:outline-none transition-colors"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="block text-sm font-medium text-foreground">
                    Subject
                  </label>
                  <input 
                    id="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What's this about?"
                    className="w-full px-4 py-2 rounded-lg bg-secondary border border-border focus:border-primary focus:outline-none transition-colors"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="block text-sm font-medium text-foreground">
                    Message
                  </label>
                  <textarea 
                    id="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us more about your inquiry..."
                    className="w-full min-h-40 px-4 py-2 rounded-lg bg-secondary border border-border focus:border-primary focus:outline-none transition-colors resize-none"
                    required
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum 10 characters required
                  </p>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-white hover:bg-primary/90 transition-all duration-300 h-12 text-lg font-semibold rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* FAQ Teaser */}
          <div className="mt-20 text-center bg-card border border-border rounded-3xl p-8">
            <h2 className="text-2xl font-bold mb-4">Have a quick question?</h2>
            <p className="text-muted-foreground mb-6">
              Most questions can be answered in our documentation or FAQ section.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {["How does it work?", "Is it free?", "Can I save prompts?", "Which AI tools work?"].map((q, i) => (
                <button
                  key={i}
                  className="px-4 py-2 rounded-full bg-secondary text-sm hover:bg-primary hover:text-white transition-all duration-300"
                  onClick={() => toast(q, { 
                    icon: 'ℹ️',
                    duration: 3000 
                  })}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contact;