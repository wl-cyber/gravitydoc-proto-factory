
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UploadedImage } from "./UploadScreens";
import { Badge } from "@/components/ui/badge";
import { Pencil, RotateCw, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Screen } from "@/types/supabase";

interface ImplementationPlansProps {
  images: UploadedImage[];
  documentation: Record<string, string>;
  onPrevious: () => void;
}

type PlanStatus = 'NOT_GENERATED' | 'IN_PROGRESS' | 'COMPLETED';

interface ScreenPlan {
  id: string;
  name: string | null;
  documentation: string;
  status: PlanStatus;
  plan: string | null;
}

const ImplementationPlans = ({ 
  images, 
  documentation, 
  onPrevious 
}: ImplementationPlansProps) => {
  const [screens, setScreens] = useState<ScreenPlan[]>([]);
  const [selectedScreen, setSelectedScreen] = useState<ScreenPlan | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDocumentation, setEditDocumentation] = useState("");
  const [generating, setGenerating] = useState(false);
  const navigate = useNavigate();

  // Initialize screens with AI-generated names (simulated)
  useEffect(() => {
    const initialScreens: ScreenPlan[] = images.map((img) => {
      const doc = documentation[img.id] || "";
      // Extract a screen name from the documentation - simple heuristic
      const docLines = doc.split('\n');
      const firstLine = docLines[0].trim();
      let generatedName = firstLine.length > 30 
        ? firstLine.substring(0, 30) + "..." 
        : firstLine;
      
      // If first line is too short, use a generic name
      if (generatedName.length < 3) {
        generatedName = `Screen ${img.file.name.split('.')[0]}`;
      }

      return {
        id: img.id,
        name: generatedName,
        documentation: doc,
        status: 'NOT_GENERATED' as PlanStatus,
        plan: null
      };
    });
    
    setScreens(initialScreens);
  }, [images, documentation]);

  const handleEditScreen = (screen: ScreenPlan) => {
    setSelectedScreen(screen);
    setEditName(screen.name || "");
    setEditDocumentation(screen.documentation);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedScreen) return;
    
    setScreens(prev => prev.map(s => 
      s.id === selectedScreen.id 
        ? { ...s, name: editName, documentation: editDocumentation } 
        : s
    ));
    
    setEditDialogOpen(false);
    toast.success("Screen details updated successfully");
  };

  const generateMarkdownPlan = async (screen: ScreenPlan) => {
    // Update the status of this screen
    setScreens(prev => prev.map(s => 
      s.id === screen.id ? { ...s, status: 'IN_PROGRESS' } : s
    ));
    
    setSelectedScreen(prev => prev?.id === screen.id ? { ...prev, status: 'IN_PROGRESS' } : prev);
    
    // This would be where you call the OpenAI API in a real implementation
    // For now, we'll simulate generating content with a delay
    try {
      setGenerating(true);
      
      // Simulate API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a plan based on the documentation
      const fakePlan = `# ${screen.name} Implementation Plan

## 1. Overview
This screen represents ${screen.documentation.substring(0, 50)}...

## 2. Component Breakdown
- Header Section
- Main Content Area
- Navigation Elements
- User Interaction Points

## 3. UI Components Needed
- Container Layout
- Typography Elements
- Button Components
- Input Fields
- Card Elements

## 4. Implementation Steps
1. Create the base component structure
2. Implement the layout grid
3. Add typography and static elements
4. Implement interactive elements
5. Connect data sources
6. Add state management
7. Implement event handlers
8. Add animations and transitions
9. Ensure responsive behavior

## 5. Technical Considerations
- Use Flexbox/Grid for responsive layout
- Implement proper accessibility features
- Ensure mobile responsiveness
- Optimize for performance

## 6. Estimated Development Time
- Frontend Implementation: 4-6 hours
- Integration with Backend: 2-3 hours
- Testing and Refinement: 2-3 hours

## 7. Dependencies
- React component library
- State management solution
- API integration for data

## 8. Success Criteria
- Screen matches design specifications
- All interactive elements function correctly
- Screen is fully responsive
- Passes accessibility requirements
`;

      // Update the screen with the generated plan
      setScreens(prev => prev.map(s => 
        s.id === screen.id 
          ? { ...s, status: 'COMPLETED', plan: fakePlan } 
          : s
      ));
      
      // If this was the selected screen, update it
      setSelectedScreen(prev => 
        prev?.id === screen.id 
          ? { ...prev, status: 'COMPLETED', plan: fakePlan } 
          : prev
      );
      
      toast.success(`Plan for "${screen.name}" generated successfully`);
    } catch (error) {
      console.error("Error generating plan:", error);
      toast.error("Failed to generate plan. Please try again.");
      
      // Reset status on error
      setScreens(prev => prev.map(s => 
        s.id === screen.id ? { ...s, status: 'NOT_GENERATED' } : s
      ));
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectScreen = (screen: ScreenPlan) => {
    setSelectedScreen(screen);
  };

  const allPlansCompleted = screens.every(screen => screen.status === 'COMPLETED');

  const handleFinish = () => {
    toast.success("All plans have been generated successfully!");
    navigate("/");
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Screen List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-medium mb-4">
            Screens ({screens.length})
          </h3>

          <ScrollArea className="h-[calc(100vh-300px)]">
            <div className="space-y-4 pr-4">
              {screens.map((screen) => (
                <Card 
                  key={screen.id}
                  className={cn(
                    "overflow-hidden hover:shadow-md transition-shadow border cursor-pointer",
                    selectedScreen?.id === screen.id && "border-indigo-400 shadow-sm"
                  )}
                  onClick={() => handleSelectScreen(screen)}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium line-clamp-1 text-sm">{screen.name}</h4>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditScreen(screen);
                              }}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          
                          <div className="mt-1">
                            {screen.status === 'NOT_GENERATED' && (
                              <Badge variant="outline" className="text-xs bg-gray-50">
                                Not Generated
                              </Badge>
                            )}
                            {screen.status === 'IN_PROGRESS' && (
                              <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                In Progress
                              </Badge>
                            )}
                            {screen.status === 'COMPLETED' && (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                <Check className="h-3 w-3 mr-1" />
                                Completed
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="relative flex-shrink-0 h-16 w-16 rounded overflow-hidden border">
                          <img
                            src={images.find(img => img.id === screen.id)?.preview}
                            alt={screen.name || "Screen"}
                            className="object-cover h-full w-full"
                          />
                        </div>
                      </div>
                      
                      {screen.status !== 'IN_PROGRESS' && (
                        <Button
                          size="sm"
                          className={screen.status === 'COMPLETED' ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100" : "bg-black text-white hover:bg-gray-800"}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (screen.status === 'COMPLETED') {
                              // Regenerate plan if already completed
                              generateMarkdownPlan(screen);
                            } else {
                              // Generate new plan
                              generateMarkdownPlan(screen);
                            }
                          }}
                          disabled={generating}
                        >
                          {screen.status === 'COMPLETED' ? (
                            <>
                              <RotateCw className="h-4 w-4 mr-2" />
                              Regenerate Plan
                            </>
                          ) : (
                            'Generate Plan'
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
        
        {/* Right Panel - Markdown Editor/Viewer */}
        <div className="lg:col-span-2">
          <Card className="h-[calc(100vh-300px)] border">
            <CardContent className="p-0 h-full flex flex-col">
              {selectedScreen ? (
                <>
                  <div className="border-b p-4">
                    <h3 className="text-xl font-semibold">{selectedScreen.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {selectedScreen.documentation}
                    </p>
                  </div>
                  
                  <ScrollArea className="flex-1 p-4">
                    {selectedScreen.status === 'NOT_GENERATED' && (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6">
                        <div className="max-w-md">
                          <h4 className="text-lg font-medium mb-2">No Implementation Plan</h4>
                          <p className="text-muted-foreground mb-6">
                            Click the "Generate Plan" button to create an implementation plan for this screen.
                          </p>
                          <Button 
                            onClick={() => generateMarkdownPlan(selectedScreen)}
                            disabled={generating}
                            className="bg-black text-white hover:bg-gray-800"
                          >
                            Generate Plan
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {selectedScreen.status === 'IN_PROGRESS' && (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6">
                        <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mb-4" />
                        <h4 className="text-lg font-medium mb-2">Generating Plan...</h4>
                        <p className="text-muted-foreground">
                          This might take a moment. We're analyzing the screen and documentation.
                        </p>
                      </div>
                    )}
                    
                    {selectedScreen.status === 'COMPLETED' && selectedScreen.plan && (
                      <div className="prose prose-indigo max-w-none">
                        <ReactMarkdown>{selectedScreen.plan}</ReactMarkdown>
                      </div>
                    )}
                  </ScrollArea>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                  <div className="max-w-md">
                    <h4 className="text-lg font-medium mb-2">Select a Screen</h4>
                    <p className="text-muted-foreground">
                      Click on a screen from the list to view or generate its implementation plan.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Screen Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Screen Details</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Screen Name</Label>
              <Input
                id="name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="documentation">Documentation</Label>
              <Textarea
                id="documentation"
                value={editDocumentation}
                onChange={(e) => setEditDocumentation(e.target.value)}
                rows={5}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Action Buttons */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={onPrevious}
        >
          Back to Documentation
        </Button>
        
        <Button
          onClick={handleFinish}
          className="bg-indigo-600 hover:bg-indigo-700"
          disabled={!allPlansCompleted}
        >
          Finish
        </Button>
      </div>
    </div>
  );
};

export default ImplementationPlans;
