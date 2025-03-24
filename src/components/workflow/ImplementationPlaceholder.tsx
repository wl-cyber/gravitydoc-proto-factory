
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadedImage } from "./UploadScreens";
import { Badge } from "@/components/ui/badge";
import { Lightbulb } from "lucide-react";

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
      <Card className="border-indigo-100 shadow-md">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-transparent">
          <CardTitle className="flex items-center gap-2 text-indigo-700">
            <Lightbulb className="h-5 w-5 text-orange-500" />
            Implementation Plans
          </CardTitle>
          <CardDescription className="text-indigo-600">
            This feature will be implemented in the next phase.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="p-8 bg-gradient-to-b from-indigo-50/50 to-white rounded-md border border-indigo-100 flex items-center justify-center transition-all">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4 text-indigo-700">Coming Soon</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-8">
                In the next phase, this section will use AI to analyze your screens and 
                documentation to generate detailed implementation plans.
              </p>

              <div className="mb-8">
                <Badge variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50 mb-2">
                  Ready for AI Analysis
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
                <div className="p-4 bg-background rounded-md border border-indigo-100 shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="font-medium text-gray-700">Uploaded Screens</h4>
                  <p className="text-2xl font-bold text-indigo-600">{images.length}</p>
                </div>
                <div className="p-4 bg-background rounded-md border border-indigo-100 shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="font-medium text-gray-700">Documentation</h4>
                  <p className="text-2xl font-bold text-indigo-600">{Object.keys(documentation).length}</p>
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
          className="border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
        >
          Back to Documentation
        </Button>
      </div>
    </div>
  );
};

export default ImplementationPlaceholder;
