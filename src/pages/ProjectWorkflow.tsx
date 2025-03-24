
import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import UploadScreens, { UploadedImage } from "@/components/workflow/UploadScreens";
import AddDocumentation from "@/components/workflow/AddDocumentation";
import ImplementationPlaceholder from "@/components/workflow/ImplementationPlaceholder";
import { toast } from "sonner";

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

  const handleNextFromUpload = (uploadedImages: UploadedImage[]) => {
    setImages(uploadedImages);
    setCurrentStep(2);
  };

  const handlePreviousFromDocs = () => {
    setCurrentStep(1);
  };

  const handleNextFromDocs = (updatedImages: UploadedImage[], docs: Record<string, string>) => {
    setImages(updatedImages);
    setDocumentation(docs);
    setCurrentStep(3);
    toast.success("Documentation completed successfully!");
  };

  const handlePreviousFromImplementation = () => {
    setCurrentStep(2);
  };

  const renderStepContent = () => {
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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center mb-8">
        <Button asChild variant="ghost" size="sm" className="mr-4">
          <Link to="/">
            <ArrowLeft size={16} className="mr-1" />
            Back to Dashboard
          </Link>
        </Button>
        
        <h1 className="text-2xl font-bold">Project Workflow</h1>
      </div>
      
      {/* Horizontal Stepper */}
      <div className="mb-12">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div 
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 
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
                className={`ml-2 font-medium ${
                  currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {step.name}
              </span>
              
              {index < steps.length - 1 && (
                <div className={`mx-4 h-0.5 w-24 ${
                  currentStep > step.id ? 'bg-indigo-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Step Content */}
      <div className="bg-card p-8 rounded-lg border">
        <h2 className="text-xl font-semibold mb-6">
          Step {currentStep}: {steps.find(s => s.id === currentStep)?.name}
        </h2>
        
        {renderStepContent()}
      </div>
    </div>
  );
};

export default ProjectWorkflow;
