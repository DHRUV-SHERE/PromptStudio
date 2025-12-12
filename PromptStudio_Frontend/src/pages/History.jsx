import { useState, useEffect, useCallback } from 'react';
import { useAuth } from "../context/authContext";
import { 
  Clock, 
  Copy, 
  Download, 
  Trash2, 
  Filter, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle,
  Loader2,
  Sparkles,
  Tag,
  Eye,
  RefreshCw,
  Calendar
} from "lucide-react";
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';

const History = () => {
  const { user } = useAuth();
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  
  // Filter states
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);
  
  // Categories with metadata
  const categories = [
    { id: 'all', name: 'All Prompts', icon: '✨', color: 'bg-purple-500/10 text-purple-500' },
    { id: 'creative', name: 'Creative', icon: '🎨', color: 'bg-blue-500/10 text-blue-500' },
    { id: 'marketing', name: 'Marketing', icon: '📈', color: 'bg-green-500/10 text-green-500' },
    { id: 'coding', name: 'Coding', icon: '💻', color: 'bg-orange-500/10 text-orange-500' },
    { id: 'storytelling', name: 'Storytelling', icon: '📖', color: 'bg-pink-500/10 text-pink-500' },
    { id: 'business', name: 'Business', icon: '💼', color: 'bg-indigo-500/10 text-indigo-500' },
  ];

  // Fetch prompt history
  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        ...(activeCategory !== 'all' && { category: activeCategory }),
        ...(searchQuery && { search: searchQuery })
      };
      
      const response = await authAPI.getPromptHistory(params);
      
      if (response.success) {
        setHistoryItems(response.data.prompts);
        setStats(response.data.stats);
        setTotalPages(response.data.pagination.pages);
        setTotalItems(response.data.pagination.total);
      } else {
        throw new Error(response.message || 'Failed to fetch history');
      }
    } catch (err) {
      console.error('Error fetching history:', err);
      setError(err.message || 'Failed to load prompt history');
      toast.error('Failed to load history. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeCategory, searchQuery, itemsPerPage]);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user, fetchHistory]);

  // Handle prompt deletion
  const handleDeletePrompt = async (promptId, e) => {
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this prompt?')) {
      return;
    }
    
    try {
      const response = await authAPI.deletePrompt(promptId);
      
      if (response.success) {
        toast.success('Prompt deleted successfully');
        // Remove from local state
        setHistoryItems(prev => prev.filter(item => item._id !== promptId));
        // Refresh stats
        fetchHistory();
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      console.error('Error deleting prompt:', err);
      toast.error(err.message || 'Failed to delete prompt');
    }
  };

  // Handle copy to clipboard
  const handleCopyPrompt = async (text, e) => {
    e.stopPropagation();
    
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Prompt copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy prompt');
    }
  };

  // Handle download prompt
  const handleDownloadPrompt = async (prompt, e) => {
    e.stopPropagation();
    
    const content = `PromptStudio History Entry\n\n` +
      `Input: ${prompt.input}\n\n` +
      `Generated Prompt:\n${prompt.generatedPrompt}\n\n` +
      `Category: ${prompt.category}\n` +
      `Generated on: ${new Date(prompt.createdAt).toLocaleString()}\n` +
      `Model: ${prompt.model}\n\n` +
      `---\nExported from PromptStudio`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt-${prompt._id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Prompt downloaded!');
  };

  // Handle bulk selection
  const handleSelectItem = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === historyItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(historyItems.map(item => item._id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) {
      toast.error('No prompts selected');
      return;
    }
    
    if (!window.confirm(`Delete ${selectedItems.length} selected prompts?`)) {
      return;
    }
    
    try {
      const deletePromises = selectedItems.map(id => authAPI.deletePrompt(id));
      await Promise.all(deletePromises);
      
      toast.success(`${selectedItems.length} prompts deleted successfully`);
      setSelectedItems([]);
      fetchHistory();
    } catch (err) {
      console.error('Bulk delete error:', err);
      toast.error('Failed to delete some prompts');
    }
  };

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim() !== '') {
        fetchHistory();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, fetchHistory]);

  // Pagination handlers
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today at ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday at ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'long', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  // Get category display info
  const getCategoryInfo = (category) => {
    return categories.find(cat => cat.id === category) || categories[0];
  };

  if (loading && historyItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-muted-foreground">Loading your prompt history...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Prompt History
              </h1>
              <p className="text-muted-foreground">
                View and manage all your previously generated prompts
              </p>
            </div>
            
            {/* Stats */}
            {stats && (
              <div className="flex flex-wrap gap-3">
                <div className="glass rounded-xl p-3 min-w-[120px]">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Total Prompts</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.totalPrompts}</p>
                </div>
                
                <div className="glass rounded-xl p-3 min-w-[120px]">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Today's Usage</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {stats.todaysPrompts} / {stats.dailyLimit}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stats.remainingToday} remaining
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Search and Actions Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search prompts by content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl glass border border-border/50 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            
            {/* Refresh Button */}
            <button
              onClick={fetchHistory}
              disabled={loading}
              className="px-4 py-3 rounded-xl glass hover:bg-primary/10 transition-all duration-300 flex items-center gap-2 justify-center"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          {/* Category Filters */}
          <div className="mb-6 overflow-x-auto">
            <div className="flex gap-2 pb-2 min-w-max">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => {
                    setActiveCategory(category.id);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 whitespace-nowrap ${
                    activeCategory === category.id
                      ? 'gradient-primary text-white'
                      : 'glass hover:bg-primary/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedItems.length > 0 && (
          <div className="mb-6 glass rounded-xl p-4 flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Tag className="h-4 w-4 text-primary" />
              </div>
              <span className="font-medium">
                {selectedItems.length} prompt{selectedItems.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Delete Selected</span>
              </button>
            </div>
          </div>
        )}

        {/* History List */}
        <div className="glass rounded-2xl p-4 md:p-6">
          {error ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Failed to Load History</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <button
                onClick={fetchHistory}
                className="px-4 py-2 rounded-lg gradient-primary text-white"
              >
                Try Again
              </button>
            </div>
          ) : historyItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No prompts yet</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? 'No prompts match your search'
                  : 'Generate your first prompt to see it here!'}
              </p>
              {!searchQuery && (
                <a
                  href="/generator"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-white"
                >
                  <Sparkles className="h-4 w-4" />
                  Generate First Prompt
                </a>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table (hidden on mobile) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="py-3 px-4 text-left">
                        <input
                          type="checkbox"
                          checked={selectedItems.length === historyItems.length}
                          onChange={handleSelectAll}
                          className="rounded border-border"
                        />
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Prompt</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Category</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Generated</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyItems.map((item) => {
                      const categoryInfo = getCategoryInfo(item.category);
                      return (
                        <tr
                          key={item._id}
                          className="border-b border-border/30 hover:bg-primary/5 transition-colors group"
                        >
                          <td className="py-4 px-4">
                            <input
                              type="checkbox"
                              checked={selectedItems.includes(item._id)}
                              onChange={() => handleSelectItem(item._id)}
                              className="rounded border-border"
                            />
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-medium line-clamp-2 mb-1">
                                {item.input}
                              </p>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {item.generatedPrompt.substring(0, 100)}...
                              </p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${categoryInfo.color}`}>
                              {categoryInfo.icon} {categoryInfo.name}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(item.createdAt)}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => handleCopyPrompt(item.generatedPrompt, e)}
                                className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors"
                                title="Copy prompt"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={(e) => handleDownloadPrompt(item, e)}
                                className="p-1.5 rounded-lg hover:bg-green-500/10 transition-colors"
                                title="Download prompt"
                              >
                                <Download className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={(e) => handleDeletePrompt(item._id, e)}
                                className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                                title="Delete prompt"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards (hidden on desktop) */}
              <div className="md:hidden space-y-4">
                {historyItems.map((item) => {
                  const categoryInfo = getCategoryInfo(item.category);
                  return (
                    <div
                      key={item._id}
                      className="p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item._id)}
                            onChange={() => handleSelectItem(item._id)}
                            className="rounded border-border mt-1"
                          />
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${categoryInfo.color}`}>
                            {categoryInfo.icon} {categoryInfo.name}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => handleCopyPrompt(item.generatedPrompt, e)}
                            className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => handleDownloadPrompt(item, e)}
                            className="p-1.5 rounded-lg hover:bg-green-500/10 transition-colors"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => handleDeletePrompt(item._id, e)}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="mb-2">
                        <p className="font-medium line-clamp-2 mb-2">
                          {item.input}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {item.generatedPrompt}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(item.createdAt)}
                        </div>
                        {item.isEnhanced && (
                          <span className="px-2 py-1 rounded-full bg-purple-500/10 text-purple-500 text-xs">
                            Enhanced
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Pagination */}
          {historyItems.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-border/50">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} prompts
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1 || loading}
                  className="p-2 rounded-lg glass hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        disabled={loading}
                        className={`w-8 h-8 rounded-lg transition-all ${
                          currentPage === pageNum
                            ? 'gradient-primary text-white'
                            : 'glass hover:bg-primary/10'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages || loading}
                  className="p-2 rounded-lg glass hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions Footer */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <a
            href="/generator"
            className="glass rounded-xl p-4 hover:bg-primary/10 transition-all duration-300 group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold">Generate New Prompt</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Create a new AI-generated prompt with advanced options
            </p>
          </a>
          
          <button
            onClick={handleSelectAll}
            className="glass rounded-xl p-4 hover:bg-primary/10 transition-all duration-300 group text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Tag className="h-5 w-5 text-green-500" />
              </div>
              <h3 className="font-semibold">Manage Prompts</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Select multiple prompts for bulk actions
            </p>
          </button>
          
          <button
            onClick={fetchHistory}
            disabled={loading}
            className="glass rounded-xl p-4 hover:bg-primary/10 transition-all duration-300 group text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <RefreshCw className={`h-5 w-5 text-blue-500 ${loading ? 'animate-spin' : ''}`} />
              </div>
              <h3 className="font-semibold">
                {loading ? 'Refreshing...' : 'Refresh History'}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Get the latest updates to your prompt history
            </p>
          </button>
        </div>
      </div>

      {/* Loading overlay */}
      {loading && historyItems.length > 0 && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass rounded-2xl p-8 flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>Loading more prompts...</p>
          </div>
        </div>
      )}

      <style jsx>{`
        .line-clamp-1 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 1;
        }
        
        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }
        
        .line-clamp-3 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 3;
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default History;