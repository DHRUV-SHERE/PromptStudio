// src/pages/History.jsx
import { useAuth } from "../context/authContext";
import { Clock, Copy, Download, Trash2, Filter } from "lucide-react";

const History = () => {
  const { user } = useAuth();

  // Mock history data
  const historyItems = [
    { id: 1, prompt: "Write a story about a magical forest", date: "2024-01-15", type: "Creative Writing" },
    { id: 2, prompt: "Generate marketing copy for a new SaaS product", date: "2024-01-14", type: "Marketing" },
    { id: 3, prompt: "Create a workout plan for beginners", date: "2024-01-13", type: "Health & Fitness" },
    { id: 4, prompt: "Write Python code for a login system", date: "2024-01-12", type: "Programming" },
    { id: 5, prompt: "Design thinking workshop agenda", date: "2024-01-11", type: "Business" },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Prompt History</h1>
        <p className="text-muted-foreground">
          View and manage all your previously generated prompts
        </p>
      </div>

      <div className="glass rounded-2xl p-6">
        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 p-4 rounded-xl bg-secondary/30">
          <div className="flex items-center gap-3">
            <Filter className="h-5 w-5 text-primary" />
            <span className="font-medium">Filter by:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="px-3 py-1 rounded-lg glass hover:bg-primary/10 transition-colors text-sm">
              All
            </button>
            <button className="px-3 py-1 rounded-lg glass hover:bg-primary/10 transition-colors text-sm">
              Creative Writing
            </button>
            <button className="px-3 py-1 rounded-lg glass hover:bg-primary/10 transition-colors text-sm">
              Marketing
            </button>
            <button className="px-3 py-1 rounded-lg glass hover:bg-primary/10 transition-colors text-sm">
              Programming
            </button>
            <button className="px-3 py-1 rounded-lg glass hover:bg-primary/10 transition-colors text-sm">
              Business
            </button>
          </div>
        </div>

        {/* History List */}
        <div className="space-y-4">
          {historyItems.map((item) => (
            <div 
              key={item.id} 
              className="p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 group"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {new Date(item.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                    <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      {item.type}
                    </span>
                  </div>
                  <p className="text-lg font-medium">{item.prompt}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg glass hover:bg-primary/10 transition-colors group-hover:opacity-100 opacity-0 md:opacity-100">
                    <Copy className="h-4 w-4" />
                  </button>
                  <button className="p-2 rounded-lg glass hover:bg-green-500/10 text-green-500 transition-colors group-hover:opacity-100 opacity-0 md:opacity-100">
                    <Download className="h-4 w-4" />
                  </button>
                  <button className="p-2 rounded-lg glass hover:bg-red-500/10 text-red-500 transition-colors group-hover:opacity-100 opacity-0 md:opacity-100">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/50">
          <div className="text-sm text-muted-foreground">
            Showing 1-5 of 24 prompts
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-2 rounded-lg glass hover:bg-primary/10 transition-colors text-sm">
              Previous
            </button>
            <button className="px-3 py-2 rounded-lg gradient-primary text-sm">
              1
            </button>
            <button className="px-3 py-2 rounded-lg glass hover:bg-primary/10 transition-colors text-sm">
              2
            </button>
            <button className="px-3 py-2 rounded-lg glass hover:bg-primary/10 transition-colors text-sm">
              3
            </button>
            <button className="px-3 py-2 rounded-lg glass hover:bg-primary/10 transition-colors text-sm">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;