
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UploadedImage } from "./UploadScreens";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Check, Loader2 } from "lucide-react";
import { useParams } from "react-router-dom";
import { useScreens } from "@/hooks/useScreens";
import { Screen } from "@/types/supabase";

interface AddDocumentationProps {
  images: UploadedImage[];
  onPrevious: () => void;
  onNext: (images: UploadedImage[], documentation: Record<string, string>) => void;
}

const AddDocumentation = ({ images, onPrevious, onNext }: AddDocumentationProps) => {
  const { projectId } = useParams<{ projectId: string }>();
  const { 
    screens, 
    isLoadingScreens, 
    updateScreenDocumentation,
    isUpdatingDocumentation 
  } = useScreens(projectId || "");

  const [documentation, setDocumentation] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Initialize documentation from database screens
  useEffect(() => {
    if (screens) {
      const initialDocs: Record<string, string> = {};
      screens.forEach(screen => {
        if (screen.documentation) {
          initialDocs[screen.id] = screen.documentation;
        }
      });
      setDocumentation(initialDocs);
    }
  }, [screens]);

  const handleDocChange = (id: string, value: string) => {
    setDocumentation(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSaveDoc = async (id: string, value: string) => {
    if (!projectId) return;
    
    updateScreenDocumentation({ screenId: id, documentation: value });
  };

  const isComplete = () => {
    return screens && screens.every(screen => documentation[screen.id]?.trim().length > 0);
  };

  const handleNext = async () => {
    if (!isComplete()) {
      toast.error("Please add documentation for all screens");
      return;
    }

    // Save all documentation to the database
    setIsSaving(true);
    try {
      const savePromises = screens?.map(screen => 
        handleSaveDoc(screen.id, documentation[screen.id])
      ) || [];
      
      await Promise.all(savePromises);
      
      // Pass the screens with their documentation to the next step
      onNext(images, documentation);
    } catch (error) {
      console.error("Error saving documentation:", error);
      toast.error("Failed to save documentation");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingScreens) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
        <span className="ml-2 text-indigo-600">Loading screens...</span>
      </div>
    );
  }

  if (!screens || screens.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground mb-4">No screen images to document.</p>
        <Button onClick={onPrevious} variant="outline">
          Go Back to Upload Screens
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="text-lg font-medium">
          Document All Screens ({screens.length})
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Add detailed documentation for each screen to generate better implementation plans.
        </p>
      </div>

      <div className="space-y-6">
        {screens.map((screen, index) => (
          <Card key={screen.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1 border-r border-border p-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="cursor-pointer relative group">
                        <img
                          src={screen.image_path}
                          alt={`Screen ${index + 1}`}
                          className="w-full h-auto max-h-[180px] object-contain"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white text-sm bg-black/50 px-2 py-1 rounded">Click to enlarge</span>
                        </div>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <img
                        src={screen.image_path}
                        alt={`Screen ${index + 1}`}
                        className="w-full h-auto max-h-[80vh] object-contain"
                      />
                    </DialogContent>
                  </Dialog>
                  <p className="text-sm text-muted-foreground mt-2 truncate">
                    Screen {index + 1}
                  </p>
                </div>
                
                <div className="md:col-span-2 p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`documentation-${screen.id}`} className="text-base font-medium">
                        Screen {index + 1}
                      </Label>
                      {documentation[screen.id]?.trim() ? (
                        <span className="text-green-600 flex items-center text-xs">
                          <Check size={14} className="mr-1" /> Documented
                        </span>
                      ) : (
                        <span className="text-amber-600 text-xs">Required</span>
                      )}
                    </div>
                    <Textarea
                      id={`documentation-${screen.id}`}
                      placeholder="Describe this screen's purpose, functionality, and any relevant details..."
                      rows={4}
                      value={documentation[screen.id] || ''}
                      onChange={(e) => handleDocChange(screen.id, e.target.value)}
                      onBlur={(e) => handleSaveDoc(screen.id, e.target.value)}
                      className="resize-none"
                      disabled={isUpdatingDocumentation}
                    />
                    <p className="text-xs text-muted-foreground">
                      Include component details, user interactions, and design specifications.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={isSaving}
        >
          Back to Upload
        </Button>
        
        <Button
          onClick={handleNext}
          className="bg-indigo-600 hover:bg-indigo-700"
          disabled={!isComplete() || isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Next Step'
          )}
        </Button>
      </div>
    </div>
  );
};

export default AddDocumentation;
