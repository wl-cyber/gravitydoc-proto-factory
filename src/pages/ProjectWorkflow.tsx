
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import UploadScreens, { UploadedImage } from "@/components/workflow/UploadScreens";
import AddDocumentation from "@/components/workflow/AddDocumentation";
import ImplementationPlans from "@/components/workflow/ImplementationPlans";
import { toast } from "sonner";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Project, Screen } from "@/types/supabase";
import { useScreens } from "@/hooks/useScreens";

const steps = [
  { id: 1, name: "Upload Screens" },
  { id: 2, name: "Add Documentation" },
  { id: 3, name: "Create Implementation Plans" },
];

const ProjectWorkflow = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [currentStep, setCurrentStep] = useState(1);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [documentation, setDocumentation] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const isTabletOrMobile = useMediaQuery("(max-width: 768px)");
  const { screens, isLoadingScreens } = useScreens(projectId || "");

  // Fetch project details
  const { data: project, isLoading: isLoadingProject } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      if (!projectId) throw new Error("Project ID is missing");
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
      
      if (error) throw error;
      return data as Project;
    },
    enabled: !!projectId,
  });

  // Automatically advance to the appropriate step based on existing screens
  useEffect(() => {
    if (!isLoadingScreens && screens) {
      // If screens exist, set step 1 as completed
      if (screens.length > 0) {
        // Check if all screens have documentation
        const allHaveDocumentation = screens.every(screen => !!screen.documentation);
        
        if (allHaveDocumentation) {
          // If all screens have documentation, we can show step 3
          if (currentStep === 1) {
            setCurrentStep(3);
          }
        } else {
          // If not all screens have documentation, we should show step 2
          if (currentStep === 1) {
            setCurrentStep(2);
          }
        }
      }
    }
  }, [screens, isLoadingScreens, currentStep]);

  const handleNextFromUpload = (uploadedImages: UploadedImage[]) => {
    setImages(uploadedImages);
    setCurrentStep(2);
    window.scrollTo(0, 0);
  };

  const handlePreviousFromDocs = () => {
    setCurrentStep(1);
    window.scrollTo(0, 0);
  };

  const handleNextFromDocs = (updatedImages: UploadedImage[], docs: Record<string, string>) => {
    setImages(updatedImages);
    setDocumentation(docs);
    setCurrentStep(3);
    window.scrollTo(0, 0);
    toast.success("Documentation completed successfully!");
  };

  const handlePreviousFromImplementation = () => {
    setCurrentStep(2);
    window.scrollTo(0, 0);
  };

  const renderStepContent = () => {
    if (isLoadingProject || isLoadingScreens) {
      return (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
        </div>
      );
    }
    
    switch (currentStep) {
      case 1:
        return <UploadScreens onNext={handleNextFromUpload} />;
      case 2:
        return (
          <AddDocumentation 
            images={images} 
            screens={screens || []}
            onPrevious={handlePreviousFromDocs} 
            onNext={handleNextFromDocs} 
          />
        );
      case 3:
        return (
          <ImplementationPlans 
            images={images} 
            documentation={documentation} 
            screens={screens || []}
            onPrevious={handlePreviousFromImplementation} 
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0 mb-6 sm:mb-8">
        <Button asChild variant="ghost" size="sm" className="mr-0 sm:mr-4 justify-start">
          <Link to="/">
            <ArrowLeft size={16} className="mr-1" />
            Back to Dashboard
          </Link>
        </Button>
        
        <h1 className="text-xl sm:text-2xl font-bold text-indigo-700">
          {project?.name ? `${project.name} - Workflow` : "Project Workflow"}
        </h1>
      </div>
      
      {/* Horizontal Stepper */}
      <div className="mb-8 sm:mb-12 overflow-x-auto pb-2">
        <div className="flex items-center min-w-max">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div 
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all
                  ${currentStep > step.id ? 'bg-indigo-600 border-indigo-600 text-white' : 
                    currentStep === step.id ? 'border-indigo-600 text-indigo-600' : 'border-gray-300 text-gray-300'}`}
              >
                {currentStep > step.id ? (
                  <Check size={16} />
                ) : (
                  <span>{step.id}</span>
                )}
              </div>
              
              <span 
                className={`ml-2 font-medium transition-colors ${
                  currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {step.name}
              </span>
              
              {index < steps.length - 1 && (
                <div className={`mx-4 h-0.5 w-12 sm:w-24 transition-colors ${
                  currentStep > step.id ? 'bg-indigo-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Step Content */}
      <div className="bg-card p-4 sm:p-8 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
        <h2 className="text-lg sm:text-xl font-semibold mb-6 text-indigo-700 flex items-center">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-sm mr-2">
            {currentStep}
          </span>
          {steps.find(s => s.id === currentStep)?.name}
        </h2>
        
        {renderStepContent()}
      </div>
    </div>
  );
};

export default ProjectWorkflow;
