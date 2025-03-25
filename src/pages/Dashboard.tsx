
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, ArrowUpDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import ProjectCard from "@/components/projects/ProjectCard";
import { supabase } from "@/integrations/supabase/client";
import { Project } from "@/types/supabase";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthContext";

type SortOption = "name" | "created_at" | "updated_at";

const Dashboard = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("updated_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Fetch projects from Supabase
  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      
      if (!user) return;
      
      let query = supabase
        .from('projects')
        .select('*')
        .order(sortBy, { ascending: sortOrder === 'asc' });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setProjects(data || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to load projects");
      console.error("Error fetching projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch projects when component mounts or dependencies change
  useEffect(() => {
    fetchProjects();
  }, [user, sortBy, sortOrder]);

  // Filter projects by search query
  const filteredProjects = projects.filter(
    project => 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Toggle sort order
  const handleSort = (option: SortOption) => {
    if (sortBy === option) {
      // Toggle order if same option clicked
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Set new sort option with default desc order
      setSortBy(option);
      setSortOrder("desc");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-2xl font-bold">Prototype Builder</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search projects..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <ArrowUpDown size={16} />
                <span>Sort</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleSort("name")}>
                By Name
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("created_at")}>
                By Date Created
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("updated_at")}>
                By Date Modified
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* New Project Button */}
          <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
            <Link to="/projects/new" className="flex items-center gap-2">
              <Plus size={16} />
              <span>New Project</span>
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Recent Projects Heading */}
      <h2 className="text-xl font-semibold mb-4">Recent Projects</h2>
      
      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
        </div>
      ) : (
        /* Projects Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} onUpdate={fetchProjects} />
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <p>No projects found. Create a new project to get started.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
