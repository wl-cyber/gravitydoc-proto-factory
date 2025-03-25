
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb } from "lucide-react";

interface ImplementationPlaceholderProps {
  screenName?: string;
  onPrevious?: () => void;
}

const ImplementationPlaceholder = ({ 
  screenName = "Untitled Screen",
  onPrevious 
}: ImplementationPlaceholderProps) => {
  return (
    <div className="space-y-6">
      <Card className="border-indigo-100 shadow-md">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-transparent">
          <CardTitle className="flex items-center gap-2 text-indigo-700">
            <Lightbulb className="h-5 w-5 text-orange-500" />
            Implementation Plan for {screenName}
          </CardTitle>
          <CardDescription className="text-indigo-600">
            Generate a plan for this screen by clicking the "Generate Plan" button.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="p-8 bg-gradient-to-b from-indigo-50/50 to-white rounded-md border border-indigo-100 flex items-center justify-center transition-all">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4 text-indigo-700">Ready to Generate</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-8">
                Click the "Generate Plan" button to create an AI-powered implementation plan for this screen.
                The plan will include component breakdowns, implementation steps, and technical considerations.
              </p>

              <div className="mb-8">
                <Badge variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50 mb-2">
                  Waiting for Generation
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {onPrevious && (
        <div className="flex justify-start">
          <Button
            variant="outline"
            onClick={onPrevious}
            className="border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
          >
            Back to Documentation
          </Button>
        </div>
      )}
    </div>
  );
};

export default ImplementationPlaceholder;
