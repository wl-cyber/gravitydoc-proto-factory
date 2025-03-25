
import { useState, useEffect } from "react";
import { ArrowLeft, AlertTriangle, FileText, CheckCircle, Clock, Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useParams, useNavigate } from "react-router-dom";
import { UploadedImage } from "./UploadScreens";
import { Screen } from "@/types/supabase";
import { useScreens } from "@/hooks/useScreens";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";
import ImplementationPlaceholder from "./ImplementationPlaceholder";
import { generateScreenPlan } from "@/services/openai";

type PlanStatus = "NOT_GENERATED" | "IN_PROGRESS" | "COMPLETED";

interface ImplementationPlansProps {
  images: UploadedImage[];
  documentation: Record<string, string>;
  screens: Screen[];
  onPrevious: () => void;
}

const ImplementationPlans = ({ images, documentation, screens, onPrevious }: ImplementationPlansProps) => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [selectedScreenId, setSelectedScreenId] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editData, setEditData] = useState<{ screenId: string; screenName: string; documentation: string; }>({
    screenId: "",
    screenName: "",
    documentation: ""
  });
  
  const { 
    updateScreenPlan,
    updateScreenStatus,
    updateScreenDetails,
    isUpdatingPlan,
    isUpdatingStatus,
    isUpdatingDetails
  } = useScreens(projectId || "");

  // Select the first screen by default when screens are loaded
  useEffect(() => {
    if (screens?.length > 0 && !selectedScreenId) {
      setSelectedScreenId(screens[0].id);
    }
  }, [screens, selectedScreenId]);

  const handleEditScreen = (screenId: string) => {
    const screen = screens.find(s => s.id === screenId);
    if (screen) {
      setEditData({
        screenId: screen.id,
        screenName: screen.screen_name || "",
        documentation: screen.documentation || ""
      });
      setEditDialogOpen(true);
    }
  };

  const handleUpdateScreenDetails = async () => {
    if (!editData.screenName.trim()) {
      toast.error("Screen name is required");
      return;
    }

    if (!editData.documentation.trim()) {
      toast.error("Documentation is required");
      return;
    }

    try {
      await updateScreenDetails({
        screenId: editData.screenId,
        screenName: editData.screenName,
        documentation: editData.documentation
      });
      
      setEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating screen details:", error);
    }
  };

  const generatePlan = async (screenId: string) => {
    try {
      const screen = screens.find(s => s.id === screenId);
      if (!screen) return;
      
      // Set status to IN_PROGRESS
      await updateScreenStatus({ screenId, status: "IN_PROGRESS" });
      
      // Call OpenAI API to generate plan (handled by the backend)
      // This would typically be an API call, but we're mocking it for now
      // Set a timeout to simulate API call delay
      setTimeout(async () => {
        try {
          // Generate a plan using our mock service
          const plan = await generateScreenPlan(screen);

          // Update the plan in Supabase
          await updateScreenPlan({ 
            screenId, 
            plan, 
            status: "COMPLETED"
          });
          
          toast.success(`Plan for "${screen.screen_name || 'Screen'}" has been generated`);
        } catch (error) {
          console.error("Error generating plan content:", error);
          toast.error("Failed to generate plan content");
          await updateScreenStatus({ screenId, status: "NOT_GENERATED" });
        }
      }, 2000); // Simulate 2 second delay
      
    } catch (error) {
      console.error("Error generating plan:", error);
      toast.error("Failed to generate implementation plan");
      await updateScreenStatus({ screenId, status: "NOT_GENERATED" });
    }
  };

  const renderStatus = (status: PlanStatus) => {
    switch (status) {
      case "NOT_GENERATED":
        return (
          <Badge variant="outline" className="flex gap-1 items-center">
            <AlertTriangle size={12} className="text-amber-500" />
            <span>Not Generated</span>
          </Badge>
        );
      case "IN_PROGRESS":
        return (
          <Badge variant="outline" className="flex gap-1 items-center">
            <Clock size={12} className="text-blue-500" />
            <span>In Progress</span>
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge variant="outline" className="flex gap-1 items-center bg-green-50">
            <CheckCircle size={12} className="text-green-500" />
            <span className="text-green-600">Completed</span>
          </Badge>
        );
      default:
        return null;
    }
  };

  const getSelectedScreen = () => {
    return screens.find(screen => screen.id === selectedScreenId);
  };

  const handleFinish = () => {
    toast.success("Workflow completed successfully!");
    navigate("/");
  };

  if (!screens || screens.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-muted-foreground mb-4">No screens found. Please go back and upload some screens.</p>
        <Button onClick={onPrevious} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Documentation
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground mb-6">
        Review and generate implementation plans for each screen.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left side - Screen list */}
        <div className="md:col-span-1 space-y-4">
          <h3 className="text-lg font-medium mb-2">Screens</h3>
          <div className="space-y-4 overflow-auto max-h-[70vh]">
            {screens.map((screen, index) => (
              <Card 
                key={screen.id} 
                className={`p-4 cursor-pointer transition-all hover:shadow ${
                  selectedScreenId === screen.id ? 'ring-2 ring-indigo-500' : ''
                }`}
                onClick={() => setSelectedScreenId(screen.id)}
              >
                <div className="flex flex-col space-y-3">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium truncate">
                      {screen.screen_name || `Screen ${index + 1}`}
                    </h4>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditScreen(screen.id);
                      }}
                    >
                      <Pencil size={14} />
                    </Button>
                  </div>
                  
                  <div className="aspect-video bg-muted rounded-md overflow-hidden">
                    <img 
                      src={screen.image_path} 
                      alt={screen.screen_name || `Screen ${index + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    {renderStatus(screen.plan_status as PlanStatus)}
                    
                    {screen.plan_status !== "IN_PROGRESS" && (
                      <Button
                        size="sm"
                        variant={screen.plan_status === "COMPLETED" ? "outline" : "default"}
                        className={screen.plan_status === "COMPLETED" ? "" : "bg-indigo-600 hover:bg-indigo-700"}
                        onClick={(e) => {
                          e.stopPropagation();
                          generatePlan(screen.id);
                        }}
                        disabled={isUpdatingPlan || isUpdatingStatus}
                      >
                        {screen.plan_status === "COMPLETED" ? (
                          <>
                            <FileText size={14} className="mr-1" />
                            View Plan
                          </>
                        ) : (
                          "Generate Plan"
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
        
        {/* Right side - Plan preview */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-medium mb-4">Implementation Plan</h3>
          <Card className="p-4 sm:p-6 min-h-[60vh] max-h-[70vh] overflow-auto">
            {selectedScreenId ? (
              getSelectedScreen()?.implementation_plan ? (
                <ReactMarkdown className="prose prose-sm max-w-none">
                  {getSelectedScreen()?.implementation_plan || ""}
                </ReactMarkdown>
              ) : (
                <ImplementationPlaceholder screenName={getSelectedScreen()?.screen_name} />
              )
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Select a screen to view or generate an implementation plan
              </div>
            )}
          </Card>
        </div>
      </div>
      
      <div className="flex justify-between pt-4">
        <Button onClick={onPrevious} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Documentation
        </Button>
        
        <Button 
          onClick={handleFinish}
          className="bg-indigo-600 hover:bg-indigo-700"
          disabled={!screens.every(screen => screen.plan_status === "COMPLETED")}
        >
          Finish
        </Button>
      </div>
      
      {/* Edit Screen Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Screen Details</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="screen-name">Screen Name</Label>
              <Input
                id="screen-name"
                value={editData.screenName}
                onChange={(e) => setEditData({ ...editData, screenName: e.target.value })}
                placeholder="e.g., Login Screen, User Dashboard"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="documentation">Documentation</Label>
              <Textarea
                id="documentation"
                value={editData.documentation}
                onChange={(e) => setEditData({ ...editData, documentation: e.target.value })}
                placeholder="Describe this screen in detail..."
                rows={5}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateScreenDetails}
              disabled={isUpdatingDetails}
            >
              {isUpdatingDetails ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImplementationPlans;
