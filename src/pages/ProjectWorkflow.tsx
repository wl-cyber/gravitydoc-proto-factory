
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import UploadScreens, { UploadedImage } from "@/components/workflow/UploadScreens";
import AddDocumentation from "@/components/workflow/AddDocumentation";
import ImplementationPlaceholder from "@/components/workflow/ImplementationPlaceholder";
import { toast } from "sonner";
import { useMediaQuery } from "@/hooks/useMediaQuery";

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
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const isTabletOrMobile = useMediaQuery("(max-width: 768px)");

  // Simulate loading project data
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [projectId]);

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
    if (loading) {
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
            onPrevious={handlePreviousFromDocs} 
            onNext={handleNextFromDocs} 
          />
        );
      case 3:
        return (
          <ImplementationPlaceholder 
            images={images} 
            documentation={documentation} 
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
        
        <h1 className="text-xl sm:text-2xl font-bold text-indigo-700">Project Workflow</h1>
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
