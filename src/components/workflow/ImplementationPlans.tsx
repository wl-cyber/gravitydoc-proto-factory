
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
import { useNavigate, useParams } from "react-router-dom";
import { Screen } from "@/types/supabase";
import { useScreens } from "@/hooks/useScreens";
import { generateScreenName, generateScreenPlan } from "@/services/openai";

interface ImplementationPlansProps {
  images: UploadedImage[];
  documentation: Record<string, string>;
  onPrevious: () => void;
}

const ImplementationPlans = ({ 
  images, 
  documentation, 
  onPrevious 
}: ImplementationPlansProps) => {
  const { projectId } = useParams<{ projectId: string }>();
  const { 
    screens, 
    isLoadingScreens,
    updateScreenDetails,
    isUpdatingDetails,
    updateScreenPlan,
    isUpdatingPlan,
    updateScreenStatus,
    isUpdatingStatus
  } = useScreens(projectId || "");

  const [selectedScreen, setSelectedScreen] = useState<Screen | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDocumentation, setEditDocumentation] = useState("");
  const [generating, setGenerating] = useState(false);
  const navigate = useNavigate();

  // Set up screen names from AI (if not already set)
  useEffect(() => {
    const setupScreenNames = async () => {
      if (!screens) return;
      
      // Find screens that don't have names yet
      const screensWithoutNames = screens.filter(screen => !screen.screen_name);
      
      if (screensWithoutNames.length === 0) return;
      
      // Generate names for each screen
      for (const screen of screensWithoutNames) {
        if (!screen.documentation) continue;
        
        try {
          const generatedName = await generateScreenName(screen.documentation);
          updateScreenDetails({
            screenId: screen.id,
            screenName: generatedName,
            documentation: screen.documentation
          });
        } catch (error) {
          console.error("Error generating screen name:", error);
        }
      }
    };
    
    setupScreenNames();
  }, [screens]);

  const handleEditScreen = (screen: Screen) => {
    setSelectedScreen(screen);
    setEditName(screen.screen_name || "");
    setEditDocumentation(screen.documentation || "");
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedScreen) return;
    
    updateScreenDetails({
      screenId: selectedScreen.id,
      screenName: editName,
      documentation: editDocumentation
    });
    
    setEditDialogOpen(false);
  };

  const handleGeneratePlan = async (screen: Screen) => {
    if (!screen.documentation) {
      toast.error("Screen needs documentation before generating a plan");
      return;
    }
    
    // Update the status of this screen to IN_PROGRESS
    updateScreenStatus({ screenId: screen.id, status: 'IN_PROGRESS' });
    
    // Update the selected screen if it's currently selected
    if (selectedScreen?.id === screen.id) {
      setSelectedScreen({
        ...selectedScreen,
        plan_status: 'IN_PROGRESS'
      });
    }
    
    try {
      setGenerating(true);
      
      // Call the OpenAI service to generate the plan
      const plan = await generateScreenPlan(screen);
      
      // Update the screen with the generated plan
      updateScreenPlan({
        screenId: screen.id,
        plan,
        status: 'COMPLETED'
      });
      
      // Update the selected screen if it's currently selected
      if (selectedScreen?.id === screen.id) {
        setSelectedScreen({
          ...selectedScreen,
          implementation_plan: plan,
          plan_status: 'COMPLETED'
        });
      }
      
      toast.success(`Plan for "${screen.screen_name}" generated successfully`);
    } catch (error) {
      console.error("Error generating plan:", error);
      toast.error("Failed to generate plan. Please try again.");
      
      // Reset status on error
      updateScreenStatus({ screenId: screen.id, status: 'NOT_GENERATED' });
      
      // Update the selected screen if it's currently selected
      if (selectedScreen?.id === screen.id) {
        setSelectedScreen({
          ...selectedScreen,
          plan_status: 'NOT_GENERATED'
        });
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectScreen = (screen: Screen) => {
    setSelectedScreen(screen);
  };

  const allPlansCompleted = screens?.every(screen => screen.plan_status === 'COMPLETED') || false;

  const handleFinish = () => {
    toast.success("All plans have been generated successfully!");
    navigate("/");
  };

  if (isLoadingScreens) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
        <span className="ml-2 text-indigo-600">Loading implementation plans...</span>
      </div>
    );
  }

  if (!screens || screens.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground mb-4">No screens found to generate plans for.</p>
        <Button onClick={onPrevious} variant="outline">
          Go Back to Documentation
        </Button>
      </div>
    );
  }

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
                            <h4 className="font-medium line-clamp-1 text-sm">{screen.screen_name || "Loading..."}</h4>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditScreen(screen);
                              }}
                              disabled={isUpdatingDetails}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          
                          <div className="mt-1">
                            {screen.plan_status === 'NOT_GENERATED' && (
                              <Badge variant="outline" className="text-xs bg-gray-50">
                                Not Generated
                              </Badge>
                            )}
                            {screen.plan_status === 'IN_PROGRESS' && (
                              <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                In Progress
                              </Badge>
                            )}
                            {screen.plan_status === 'COMPLETED' && (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                <Check className="h-3 w-3 mr-1" />
                                Completed
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="relative flex-shrink-0 h-16 w-16 rounded overflow-hidden border">
                          <img
                            src={screen.image_path}
                            alt={screen.screen_name || "Screen"}
                            className="object-cover h-full w-full"
                          />
                        </div>
                      </div>
                      
                      {screen.plan_status !== 'IN_PROGRESS' && (
                        <Button
                          size="sm"
                          className={screen.plan_status === 'COMPLETED' ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100" : "bg-black text-white hover:bg-gray-800"}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGeneratePlan(screen);
                          }}
                          disabled={generating || isUpdatingPlan || isUpdatingStatus}
                        >
                          {screen.plan_status === 'COMPLETED' ? (
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
                    <h3 className="text-xl font-semibold">{selectedScreen.screen_name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {selectedScreen.documentation}
                    </p>
                  </div>
                  
                  <ScrollArea className="flex-1 p-4">
                    {selectedScreen.plan_status === 'NOT_GENERATED' && (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6">
                        <div className="max-w-md">
                          <h4 className="text-lg font-medium mb-2">No Implementation Plan</h4>
                          <p className="text-muted-foreground mb-6">
                            Click the "Generate Plan" button to create an implementation plan for this screen.
                          </p>
                          <Button 
                            onClick={() => handleGeneratePlan(selectedScreen)}
                            disabled={generating || isUpdatingPlan || isUpdatingStatus}
                            className="bg-black text-white hover:bg-gray-800"
                          >
                            Generate Plan
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {selectedScreen.plan_status === 'IN_PROGRESS' && (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6">
                        <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mb-4" />
                        <h4 className="text-lg font-medium mb-2">Generating Plan...</h4>
                        <p className="text-muted-foreground">
                          This might take a moment. We're analyzing the screen and documentation.
                        </p>
                      </div>
                    )}
                    
                    {selectedScreen.plan_status === 'COMPLETED' && selectedScreen.implementation_plan && (
                      <div className="prose prose-indigo max-w-none">
                        <ReactMarkdown>{selectedScreen.implementation_plan}</ReactMarkdown>
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
                disabled={isUpdatingDetails}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="documentation">Documentation</Label>
              <Textarea
                id="documentation"
                value={editDocumentation}
                onChange={(e) => setEditDocumentation(e.target.value)}
                rows={5}
                disabled={isUpdatingDetails}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={isUpdatingDetails}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isUpdatingDetails}>
              {isUpdatingDetails ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
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
