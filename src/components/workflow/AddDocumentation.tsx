
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UploadedImage } from "./UploadScreens";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Check } from "lucide-react";

interface AddDocumentationProps {
  images: UploadedImage[];
  onPrevious: () => void;
  onNext: (images: UploadedImage[], documentation: Record<string, string>) => void;
}

const AddDocumentation = ({ images, onPrevious, onNext }: AddDocumentationProps) => {
  const [documentation, setDocumentation] = useState<Record<string, string>>({});

  // Initialize documentation for all images
  useEffect(() => {
    const initialDocs: Record<string, string> = {};
    images.forEach(img => {
      initialDocs[img.id] = documentation[img.id] || '';
    });
    setDocumentation(initialDocs);
  }, [images]);

  const handleDocChange = (id: string, value: string) => {
    setDocumentation(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const isComplete = () => {
    return images.every(img => documentation[img.id]?.trim().length > 0);
  };

  const handleNext = () => {
    if (!isComplete()) {
      toast.error("Please add documentation for all screens");
      return;
    }
    onNext(images, documentation);
  };

  if (images.length === 0) {
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
          Document All Screens ({images.length})
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Add detailed documentation for each screen to generate better implementation plans.
        </p>
      </div>

      <div className="space-y-6">
        {images.map((image, index) => (
          <Card key={image.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1 border-r border-border p-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="cursor-pointer relative group">
                        <img
                          src={image.preview}
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
                        src={image.preview}
                        alt={`Screen ${index + 1}`}
                        className="w-full h-auto max-h-[80vh] object-contain"
                      />
                    </DialogContent>
                  </Dialog>
                  <p className="text-sm text-muted-foreground mt-2 truncate">
                    {image.file.name}
                  </p>
                </div>
                
                <div className="md:col-span-2 p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`documentation-${image.id}`} className="text-base font-medium">
                        Screen {index + 1}
                      </Label>
                      {documentation[image.id]?.trim() ? (
                        <span className="text-green-600 flex items-center text-xs">
                          <Check size={14} className="mr-1" /> Documented
                        </span>
                      ) : (
                        <span className="text-amber-600 text-xs">Required</span>
                      )}
                    </div>
                    <Textarea
                      id={`documentation-${image.id}`}
                      placeholder="Describe this screen's purpose, functionality, and any relevant details..."
                      rows={4}
                      value={documentation[image.id] || ''}
                      onChange={(e) => handleDocChange(image.id, e.target.value)}
                      className="resize-none"
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
        >
          Back to Upload
        </Button>
        
        <Button
          onClick={handleNext}
          className="bg-indigo-600 hover:bg-indigo-700"
          disabled={!isComplete()}
        >
          Next Step
        </Button>
      </div>
    </div>
  );
};

export default AddDocumentation;
