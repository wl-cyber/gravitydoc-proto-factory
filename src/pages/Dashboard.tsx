
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import ProjectCard from "@/components/projects/ProjectCard";

// Mock project data - to be replaced with actual data later
const mockProjects = [
  { id: "1", name: "E-commerce App", description: "Online shopping platform", createdAt: "2023-09-15", updatedAt: "2023-10-25" },
  { id: "2", name: "Dashboard Design", description: "Admin dashboard UI", createdAt: "2023-08-21", updatedAt: "2023-10-15" },
  { id: "3", name: "Social Media App", description: "Connect and share with friends", createdAt: "2023-10-01", updatedAt: "2023-10-10" },
  { id: "4", name: "Travel Planner", description: "Plan your next vacation", createdAt: "2023-09-05", updatedAt: "2023-09-20" },
];

type SortOption = "name" | "createdAt" | "updatedAt";

const Dashboard = () => {
  const [projects, setProjects] = useState(mockProjects);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("updatedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Filter and sort projects whenever search query or sort options change
  useEffect(() => {
    let filteredProjects = [...mockProjects];
    
    // Filter by search query
    if (searchQuery) {
      filteredProjects = filteredProjects.filter(
        project => project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  project.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Sort projects
    filteredProjects.sort((a, b) => {
      if (sortBy === "name") {
        return sortOrder === "asc" 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      } else {
        // For dates
        const dateA = new Date(a[sortBy]);
        const dateB = new Date(b[sortBy]);
        return sortOrder === "asc" 
          ? dateA.getTime() - dateB.getTime() 
          : dateB.getTime() - dateA.getTime();
      }
    });
    
    setProjects(filteredProjects);
  }, [searchQuery, sortBy, sortOrder]);

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
              <DropdownMenuItem onClick={() => handleSort("createdAt")}>
                By Date Created
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("updatedAt")}>
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
      
      {/* Projects Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length > 0 ? (
          projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <p>No projects found. Create a new project to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
