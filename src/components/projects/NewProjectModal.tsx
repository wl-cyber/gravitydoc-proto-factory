
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthContext";

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewProjectModal = ({ isOpen, onClose }: NewProjectModalProps) => {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleCreateProject = async () => {
    if (!projectName.trim() || !user) return;

    try {
      setIsSubmitting(true);
      
      const { data, error } = await supabase
        .from('projects')
        .insert([
          { 
            name: projectName,
            description: description || null,
            user_id: user.id
          }
        ])
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success("Project created successfully");
      onClose();
      
      // Navigate to the project workflow page
      navigate(`/projects/${data.id}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to create project");
      console.error("Error creating project:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Enter the details for your new prototype project.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="project-name">Project Name <span className="text-destructive">*</span></Label>
            <Input
              id="project-name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="My Awesome Prototype"
              autoFocus
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description <span className="text-muted-foreground">(optional)</span></Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of your prototype"
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateProject} 
            disabled={!projectName.trim() || isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Project"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewProjectModal;
