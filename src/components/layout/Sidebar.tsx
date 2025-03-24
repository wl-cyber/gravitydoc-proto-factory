
import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Plus, MoreVertical, FilePlus2 } from "lucide-react";
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

type Project = {
  id: string;
  name: string;
}

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isPrototypeOpen, setIsPrototypeOpen] = useState(true);
  
  // Mock data for projects - will be replaced with actual data later
  const projects: Project[] = [
    { id: "1", name: "E-commerce App" },
    { id: "2", name: "Dashboard Design" },
    { id: "3", name: "Social Media App" },
  ];

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
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>
      
      <Separator />
      
      {/* Sidebar Content */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {!collapsed && <p className="text-sidebar-foreground/70 text-xs font-medium px-2 py-1">TOOLS</p>}
          
          <Collapsible 
            open={isPrototypeOpen} 
            onOpenChange={setIsPrototypeOpen}
            className="space-y-1"
          >
            <div className="flex items-center px-2 py-1">
              {!collapsed && (
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 flex justify-between items-center w-full">
                    <span>Prototype Builder</span>
                    {isPrototypeOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                  </Button>
                </CollapsibleTrigger>
              )}
              
              {collapsed && (
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <FilePlus2 size={18} />
                </Button>
              )}
            </div>
            
            <CollapsibleContent>
              <div className="ml-2 space-y-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start gap-2 h-8"
                  asChild
                >
                  <Link to="/projects/new">
                    <Plus size={16} />
                    <span>New Prototype</span>
                  </Link>
                </Button>
                
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
        </div>
      </ScrollArea>
    </div>
  );
};

export default Sidebar;
