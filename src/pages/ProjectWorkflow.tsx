
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const steps = [
  { id: 1, name: "Upload Screens" },
  { id: 2, name: "Add Documentation" },
  { id: 3, name: "Create Implementation Plans" },
];

const ProjectWorkflow = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [currentStep, setCurrentStep] = useState(1);
  
  // For now, this is a placeholder implementation
  // We'll add the actual step content in the next phase

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
      
      {/* Step Content (Placeholder) */}
      <div className="bg-card p-8 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">
          Step {currentStep}: {steps.find(s => s.id === currentStep)?.name}
        </h2>
        <p className="text-muted-foreground mb-6">
          This is a placeholder for step {currentStep} content. We'll implement the actual functionality in the next phase.
        </p>
        
        <div className="flex justify-end gap-4">
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={() => setCurrentStep(prev => Math.max(prev - 1, 1))}
            >
              Previous
            </Button>
          )}
          
          {currentStep < steps.length && (
            <Button
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={() => setCurrentStep(prev => Math.min(prev + 1, steps.length))}
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectWorkflow;
