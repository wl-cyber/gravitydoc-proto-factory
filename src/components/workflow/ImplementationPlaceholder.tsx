
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadedImage } from "./UploadScreens";

interface ImplementationPlaceholderProps {
  images: UploadedImage[];
  documentation: Record<string, string>;
  onPrevious: () => void;
}

const ImplementationPlaceholder = ({ 
  images, 
  documentation, 
  onPrevious 
}: ImplementationPlaceholderProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Implementation Plans</CardTitle>
          <CardDescription>
            This feature will be implemented in the next phase.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-8 bg-muted rounded-md flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4">Coming Soon</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                In the next phase, this section will use AI to analyze your screens and 
                documentation to generate detailed implementation plans.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
                <div className="p-4 bg-background rounded-md border">
                  <h4 className="font-medium">Uploaded Screens</h4>
                  <p className="text-2xl font-bold">{images.length}</p>
                </div>
                <div className="p-4 bg-background rounded-md border">
                  <h4 className="font-medium">Documentation</h4>
                  <p className="text-2xl font-bold">{Object.keys(documentation).length}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-start">
        <Button
          variant="outline"
          onClick={onPrevious}
        >
          Back to Documentation
        </Button>
      </div>
    </div>
  );
};

export default ImplementationPlaceholder;
