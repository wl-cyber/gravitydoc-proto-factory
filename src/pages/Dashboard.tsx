
import { useState } from "react";
import { Search, Plus, MoreVertical, Clock, ArrowUpDown } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

type Project = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

// Sort options
type SortOption = "name" | "createdAt" | "updatedAt";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("updatedAt");
  
  // Mock data for projects - will be replaced with actual data later
  const projects: Project[] = [
    { id: "1", name: "E-commerce App", createdAt: new Date("2023-05-15"), updatedAt: new Date("2023-06-01") },
    { id: "2", name: "Dashboard Design", createdAt: new Date("2023-04-20"), updatedAt: new Date("2023-05-25") },
    { id: "3", name: "Social Media App", createdAt: new Date("2023-06-10"), updatedAt: new Date("2023-06-15") },
  ];

  // Filter and sort projects
  const filteredProjects = projects
    .filter(project => project.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "createdAt") {
        return b.createdAt.getTime() - a.createdAt.getTime();
      } else {
        return b.updatedAt.getTime() - a.updatedAt.getTime();
      }
    });

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Recent Projects</h1>
        <Button asChild size="lg" className="bg-indigo-600 hover:bg-indigo-700">
          <Link to="/projects/new">
            <Plus className="mr-2" size={20} />
            New Project
          </Link>
        </Button>
      </div>

      <div className="flex justify-between items-center mb-8 gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search projects..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <ArrowUpDown size={16} />
              Sort by
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => setSortBy("name")}>
              Name
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("createdAt")}>
              Date Created
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("updatedAt")}>
              Date Modified
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="overflow-hidden border border-border transition-all hover:shadow-md">
            <Link to={`/projects/${project.id}`} className="block">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-semibold line-clamp-1">{project.name}</h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical size={18} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Rename</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Link>
            <CardFooter className="p-6 pt-0 border-t text-sm text-muted-foreground">
              <div className="flex items-center">
                <Clock size={14} className="mr-1" />
                Updated {formatDate(project.updatedAt)}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
