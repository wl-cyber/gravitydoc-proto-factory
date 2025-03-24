
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp, MoreVertical, FilePlus2, Plus } from "lucide-react";
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

type Project = {
  id: string;
  name: string;
}

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isPrototypeOpen, setIsPrototypeOpen] = useState(true);
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Close prototype dropdown when sidebar collapses
  useEffect(() => {
    if (collapsed) {
      setIsPrototypeOpen(false);
    }
  }, [collapsed]);
  
  // Mock data for projects - will be replaced with actual data later
  const projects: Project[] = [
    { id: "1", name: "E-commerce App" },
    { id: "2", name: "Dashboard Design" },
    { id: "3", name: "Social Media App" },
  ];

  // Handler for quick access icon click when sidebar is collapsed
  const handleCollapsedToolClick = () => {
    if (collapsed) {
      setCollapsed(false); // Expand the sidebar
      setIsPrototypeOpen(true); // Open the dropdown
    }
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
          {collapsed ? <FilePlus2 size={18} /> : <FilePlus2 size={18} />}
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
                      {projects.map((project) => (
                        <div key={project.id} className="flex items-center justify-between pr-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full justify-start h-8"
                            asChild
                          >
                            <Link to={`/projects/${project.id}`}>
                              {project.name}
                            </Link>
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                                <MoreVertical size={14} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem>Rename</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ))}
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
