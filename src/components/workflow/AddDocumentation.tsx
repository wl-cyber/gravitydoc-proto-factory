
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { UploadedImage } from "./UploadScreens";
import { useParams } from "react-router-dom";
import { useScreens } from "@/hooks/useScreens";
import { Screen } from "@/types/supabase";

interface AddDocumentationProps {
  images: UploadedImage[];
  screens: Screen[];
  onPrevious: () => void;
  onNext: (images: UploadedImage[], documentation: Record<string, string>) => void;
}

const AddDocumentation = ({ images, screens, onPrevious, onNext }: AddDocumentationProps) => {
  const { projectId } = useParams<{ projectId: string }>();
  const [documentation, setDocumentation] = useState<Record<string, string>>({});
  const { updateScreenDocumentation, isUpdatingDocumentation } = useScreens(projectId || "");
  
  // Initialize documentation from screens
  useEffect(() => {
    if (screens && screens.length > 0) {
      const initialDocumentation: Record<string, string> = {};
      screens.forEach(screen => {
        if (screen.documentation) {
          initialDocumentation[screen.id] = screen.documentation;
        } else {
          initialDocumentation[screen.id] = "";
        }
      });
      setDocumentation(initialDocumentation);
    }
  }, [screens]);

  const handleDocumentationChange = (screenId: string, text: string) => {
    setDocumentation(prev => ({
      ...prev,
      [screenId]: text
    }));
  };

  const handleNext = async () => {
    // Validate that all screens have documentation
    const emptyDocumentation = Object.entries(documentation)
      .filter(([_, text]) => !text.trim())
      .map(([id]) => id);
    
    if (emptyDocumentation.length > 0) {
      toast.error("Please add documentation for all screens");
      return;
    }

    // Update documentation for all screens in Supabase
    const updatePromises = screens.map(screen => 
      updateScreenDocumentation({ 
        screenId: screen.id, 
        documentation: documentation[screen.id] 
      })
    );

    try {
      await Promise.all(updatePromises);
      onNext(images, documentation);
    } catch (error) {
      console.error("Error updating documentation:", error);
      toast.error("Failed to save documentation");
    }
  };

  if (screens.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-muted-foreground mb-4">No screens found. Please go back and upload some screens.</p>
        <Button onClick={onPrevious} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Upload
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-indigo-700 mb-2">Document All Screens ({screens.length})</h3>
        <p className="text-muted-foreground">
          Add detailed documentation for each screen to generate better implementation plans.
        </p>
      </div>
      
      {screens.map((screen, index) => (
        <Card key={screen.id} className="p-6 border border-muted">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="aspect-video bg-muted rounded-md overflow-hidden border">
              <img 
                src={screen.image_path} 
                alt={`Screen ${index + 1}`}
                className="w-full h-full object-contain"
              />
              <div className="p-2 text-xs text-muted-foreground text-center border-t">
                {screen.image_path.split('/').pop() || `Screen ${index + 1}`}
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-medium">Screen {index + 1}</h4>
                <span className="text-xs text-amber-600 font-medium">Required</span>
              </div>
              <Textarea
                value={documentation[screen.id] || ""}
                onChange={(e) => handleDocumentationChange(screen.id, e.target.value)}
                placeholder="Describe this screen's purpose, functionality, and any relevant details..."
                className="flex-1 min-h-[220px] resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Include component details, user interactions, and design specifications.
              </p>
            </div>
          </div>
        </Card>
      ))}
      
      <div className="flex justify-between pt-4">
        <Button onClick={onPrevious} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Upload
        </Button>
        <Button 
          onClick={handleNext} 
          className="bg-indigo-600 hover:bg-indigo-700"
          disabled={isUpdatingDocumentation}
        >
          {isUpdatingDocumentation ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              Next Step
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default AddDocumentation;
