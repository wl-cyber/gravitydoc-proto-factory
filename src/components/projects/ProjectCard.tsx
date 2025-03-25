
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { MoreVertical, Loader2 } from "lucide-react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Project } from "@/types/supabase";

interface ProjectCardProps {
  project: Project;
  onUpdate: () => void;
}

const ProjectCard = ({ project, onUpdate }: ProjectCardProps) => {
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newName, setNewName] = useState(project.name);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRename = async () => {
    if (!newName.trim() || newName === project.name) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('projects')
        .update({ name: newName, updated_at: new Date().toISOString() })
        .eq('id', project.id);
      
      if (error) throw error;
      
      toast.success("Project renamed successfully");
      setIsRenameDialogOpen(false);
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || "Failed to rename project");
      console.error("Error renaming project:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id);
      
      if (error) throw error;
      
      toast.success("Project deleted successfully");
      setIsDeleteDialogOpen(false);
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete project");
      console.error("Error deleting project:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="transition-all hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <Link to={`/projects/${project.id}`} className="hover:underline">
              <CardTitle>{project.name}</CardTitle>
            </Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical size={16} />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsRenameDialogOpen(true)}>
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive" 
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardDescription>{project.description}</CardDescription>
        </CardHeader>
        
        <CardContent>
          <Link 
            to={`/projects/${project.id}`} 
            className="block h-32 bg-muted rounded-md border border-border flex items-center justify-center hover:bg-muted/80 transition-colors"
          >
            <span className="text-muted-foreground">Preview</span>
          </Link>
        </CardContent>
        
        <CardFooter className="text-xs text-muted-foreground pt-2">
          <div className="flex justify-between w-full">
            <span>Created {formatDistanceToNow(new Date(project.created_at))} ago</span>
            <span>Updated {formatDistanceToNow(new Date(project.updated_at))} ago</span>
          </div>
        </CardFooter>
      </Card>

      {/* Rename Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Project</DialogTitle>
            <DialogDescription>
              Enter a new name for your project.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Project name"
            className="my-4"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              onClick={handleRename}
              disabled={!newName.trim() || newName === project.name || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{project.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProjectCard;
