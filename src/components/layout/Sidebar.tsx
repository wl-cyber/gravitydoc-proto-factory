
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp, MoreHorizontal, FilePlus2, Plus } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { supabase } from "@/integrations/supabase/client";
import { Project } from "@/types/supabase";
import { useAuth } from "@/components/auth/AuthContext";
import { toast } from "sonner";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isPrototypeOpen, setIsPrototypeOpen] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { user } = useAuth();
  
  // Close prototype dropdown when sidebar collapses
  useEffect(() => {
    if (collapsed) {
      setIsPrototypeOpen(false);
    }
  }, [collapsed]);
  
  // Fetch real projects from Supabase
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        if (!user) return;
        
        setIsLoading(true);
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('updated_at', { ascending: false });
        
        if (error) throw error;
        
        setProjects(data || []);
      } catch (error: any) {
        console.error("Error fetching projects for sidebar:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [user]);

  // Handler for project deletion
  const handleDeleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);
      
      if (error) throw error;
      
      // Update local state after successful deletion
      setProjects(projects.filter(p => p.id !== projectId));
      toast.success("Project deleted successfully");
    } catch (error: any) {
      toast.error("Failed to delete project");
      console.error("Error deleting project:", error);
    }
  };

  // Handler for quick access icon click when sidebar is collapsed
  const handleCollapsedToolClick = () => {
    // We removed the auto-expand functionality
    // Now it just navigates without expanding the sidebar
  };

  return (
    <div 
      className={`bg-sidebar-background text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 flex flex-col h-screen ${
        collapsed ? "w-[60px]" : "w-[250px]"
      }`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 h-14">
        {!collapsed && <span className="font-bold text-lg">GravityDoc</span>}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
        >
          <img 
            src="/lovable-uploads/d5a5c8ee-1864-47aa-8063-24faf62e2be0.png" 
            alt="Toggle Sidebar" 
            className="w-5 h-5" 
          />
        </Button>
      </div>
      
      <Separator />
      
      {/* Sidebar Content */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {!collapsed && <p className="text-sidebar-foreground/70 text-xs font-medium px-2 py-1">TOOLS</p>}
          
          {/* Prototype Builder section */}
          <div className="space-y-1">
            {/* Tool header with dropdown control */}
            <div className="flex items-center px-2 py-1">
              {!collapsed ? (
                <Collapsible 
                  open={isPrototypeOpen && !collapsed} 
                  onOpenChange={setIsPrototypeOpen}
                  className="w-full"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        asChild
                        className="h-8 flex justify-start items-center"
                      >
                        <Link to="/">Prototype Builder</Link>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 ml-1"
                        asChild
                      >
                        <Link to="/projects/new">
                          <Plus size={16} />
                        </Link>
                      </Button>
                    </div>
                    
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        {isPrototypeOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  
                  {/* Collapsible content with projects list */}
                  <CollapsibleContent>
                    <div className="ml-2 space-y-1 mt-1">
                      {isLoading ? (
                        <div className="flex justify-center py-2">
                          <span className="text-xs text-muted-foreground">Loading...</span>
                        </div>
                      ) : projects.length > 0 ? (
                        projects.map((project) => (
                          <div key={project.id} className="flex items-center justify-between pr-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="w-full justify-start h-8 text-left truncate"
                              asChild
                            >
                              <Link to={`/projects/${project.id}`}>
                                {project.name}
                              </Link>
                            </Button>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                                  <MoreHorizontal size={14} />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem onClick={() => toast.info("Rename coming soon")}>
                                  Rename
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => handleDeleteProject(project.id)}
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        ))
                      ) : (
                        <div className="flex justify-center py-2">
                          <span className="text-xs text-muted-foreground">No projects yet</span>
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 mx-auto"
                  onClick={handleCollapsedToolClick}
                  asChild
                >
                  <Link to="/">
                    <FilePlus2 size={18} />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default Sidebar;
