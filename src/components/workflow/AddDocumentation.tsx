
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UploadedImage } from "./UploadScreens";
import { toast } from "sonner";

interface AddDocumentationProps {
  images: UploadedImage[];
  onPrevious: () => void;
  onNext: (images: UploadedImage[], documentation: Record<string, string>) => void;
}

const AddDocumentation = ({ images, onPrevious, onNext }: AddDocumentationProps) => {
  const [documentation, setDocumentation] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);

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

  const goToNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
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
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">
          Screen {currentIndex + 1} of {images.length}
        </h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPrevious}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={goToNext}
            disabled={currentIndex === images.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-4">
            <img
              src={images[currentIndex].preview}
              alt={`Screen ${currentIndex + 1}`}
              className="w-full h-auto max-h-[400px] object-contain"
            />
            <p className="text-sm text-muted-foreground mt-2">
              {images[currentIndex].file.name}
            </p>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div>
            <Label htmlFor={`documentation-${images[currentIndex].id}`} className="mb-2 block">
              Documentation <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id={`documentation-${images[currentIndex].id}`}
              placeholder="Describe this screen's purpose, functionality, and any relevant details..."
              rows={10}
              value={documentation[images[currentIndex].id] || ''}
              onChange={(e) => handleDocChange(images[currentIndex].id, e.target.value)}
              className="resize-none"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Include component details, user interactions, and design specifications.
            </p>
          </div>

          <div className="flex justify-end gap-2">
            {currentIndex < images.length - 1 ? (
              <Button
                onClick={goToNext}
                className="bg-indigo-600 hover:bg-indigo-700"
                disabled={!documentation[images[currentIndex].id]?.trim()}
              >
                Next Screen
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="bg-indigo-600 hover:bg-indigo-700"
                disabled={!isComplete()}
              >
                Complete Documentation
              </Button>
            )}
          </div>
        </div>
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
