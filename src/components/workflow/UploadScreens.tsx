
import { useState, useCallback } from "react";
import { Upload, Image as ImageIcon, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface UploadScreensProps {
  onNext: (uploadedImages: UploadedImage[]) => void;
}

export interface UploadedImage {
  id: string;
  file: File;
  preview: string;
}

const UploadScreens = ({ onNext }: UploadScreensProps) => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileDrop = useCallback((acceptedFiles: File[]) => {
    const imageFiles = acceptedFiles.filter(file => 
      file.type.startsWith('image/')
    );
    
    if (imageFiles.length === 0) {
      toast.error("Please upload image files only");
      return;
    }

    const newImages = imageFiles.map(file => ({
      id: Math.random().toString(36).substring(2, 11),
      file,
      preview: URL.createObjectURL(file)
    }));

    setUploadedImages(prev => [...prev, ...newImages]);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileDrop(Array.from(e.dataTransfer.files));
    }
  }, [handleFileDrop]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileDrop(Array.from(e.target.files));
    }
  };

  const removeImage = (id: string) => {
    setUploadedImages(prev => {
      const filtered = prev.filter(img => img.id !== id);
      return filtered;
    });
  };

  const handleNext = () => {
    if (uploadedImages.length === 0) {
      toast.error("Please upload at least one screen image");
      return;
    }
    onNext(uploadedImages);
  };

  return (
    <div className="space-y-6">
      <div 
        className={`border-2 border-dashed rounded-lg p-10 text-center ${
          isDragging ? 'border-indigo-500 bg-indigo-50/50' : 'border-gray-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="bg-indigo-100 p-4 rounded-full">
            <Upload className="h-10 w-10 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium">Drag and drop your screen images</h3>
            <p className="text-muted-foreground mt-1">
              or click to browse files (PNG, JPG, GIF)
            </p>
          </div>
          <input
            id="file-upload"
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            onClick={() => document.getElementById('file-upload')?.click()}
            variant="outline"
            className="mt-2"
          >
            <ImageIcon className="mr-2 h-4 w-4" />
            Add Screens
          </Button>
        </div>
      </div>

      {uploadedImages.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Uploaded Screens ({uploadedImages.length})</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedImages.map((image) => (
              <Card key={image.id} className="relative group overflow-hidden">
                <img 
                  src={image.preview} 
                  alt={image.file.name}
                  className="w-full h-32 object-cover"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button 
                    size="icon" 
                    variant="destructive"
                    onClick={() => removeImage(image.id)}
                  >
                    <XCircle className="h-5 w-5" />
                  </Button>
                </div>
                <div className="p-2 text-xs truncate">
                  {image.file.name}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          onClick={handleNext}
          className="bg-indigo-600 hover:bg-indigo-700"
          disabled={uploadedImages.length === 0}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default UploadScreens;
