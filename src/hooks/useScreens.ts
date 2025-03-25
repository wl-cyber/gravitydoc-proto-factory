
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UploadedImage } from "@/components/workflow/UploadScreens";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import { Screen } from "@/types/supabase";

export const useScreens = (projectId: string) => {
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  // Fetch screens for a project
  const { data: screens, isLoading: isLoadingScreens, error: screensError } = useQuery({
    queryKey: ['screens', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('screens')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as Screen[];
    },
    enabled: !!projectId,
  });

  // Upload image to Supabase storage
  const uploadImage = async (image: File): Promise<string> => {
    const fileExt = image.name.split('.').pop();
    const fileName = `${nanoid()}.${fileExt}`;
    const filePath = `${projectId}/${fileName}`;
    
    const { error } = await supabase.storage
      .from('screen_images')
      .upload(filePath, image, {
        cacheControl: '3600',
        upsert: false,
        onUploadProgress: (progress) => {
          setUploadProgress(prev => ({
            ...prev,
            [fileName]: Math.round((progress.loaded / progress.total) * 100)
          }));
        }
      });
    
    if (error) {
      throw error;
    }

    const { data } = supabase.storage
      .from('screen_images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  // Create screens in Supabase
  const createScreensMutation = useMutation({
    mutationFn: async (images: UploadedImage[]) => {
      const uploadPromises = images.map(async (image) => {
        try {
          const imagePath = await uploadImage(image.file);
          const { data, error } = await supabase
            .from('screens')
            .insert({
              project_id: projectId,
              image_path: imagePath,
              screen_name: null,
              documentation: null,
              plan_status: 'NOT_GENERATED',
              implementation_plan: null,
            })
            .select()
            .single();
          
          if (error) throw error;
          return { ...data, localId: image.id };
        } catch (error) {
          console.error("Error uploading screen:", error);
          toast.error(`Failed to upload ${image.file.name}`);
          return null;
        }
      });

      const results = await Promise.all(uploadPromises);
      return results.filter(Boolean) as (Screen & { localId: string })[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['screens', projectId] });
      toast.success("Screens uploaded successfully");
    },
    onError: (error) => {
      console.error("Error creating screens:", error);
      toast.error("Failed to create screens");
    }
  });

  // Update screen documentation
  const updateScreenDocumentation = useMutation({
    mutationFn: async ({ 
      screenId, 
      documentation 
    }: { 
      screenId: string; 
      documentation: string 
    }) => {
      const { data, error } = await supabase
        .from('screens')
        .update({ documentation })
        .eq('id', screenId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['screens', projectId] });
    },
    onError: (error) => {
      console.error("Error updating screen documentation:", error);
      toast.error("Failed to update documentation");
    }
  });

  // Update screen name and documentation
  const updateScreenDetails = useMutation({
    mutationFn: async ({ 
      screenId, 
      screenName, 
      documentation 
    }: { 
      screenId: string; 
      screenName: string; 
      documentation: string 
    }) => {
      const { data, error } = await supabase
        .from('screens')
        .update({ 
          screen_name: screenName,
          documentation 
        })
        .eq('id', screenId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['screens', projectId] });
      toast.success("Screen details updated");
    },
    onError: (error) => {
      console.error("Error updating screen details:", error);
      toast.error("Failed to update screen details");
    }
  });

  // Update screen plan and status
  const updateScreenPlan = useMutation({
    mutationFn: async ({ 
      screenId, 
      plan, 
      status = 'COMPLETED' 
    }: { 
      screenId: string; 
      plan: string; 
      status?: 'NOT_GENERATED' | 'IN_PROGRESS' | 'COMPLETED' 
    }) => {
      const { data, error } = await supabase
        .from('screens')
        .update({ 
          implementation_plan: plan,
          plan_status: status
        })
        .eq('id', screenId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['screens', projectId] });
    },
    onError: (error) => {
      console.error("Error updating screen plan:", error);
      toast.error("Failed to update implementation plan");
    }
  });

  // Update screen plan status
  const updateScreenStatus = useMutation({
    mutationFn: async ({ 
      screenId, 
      status 
    }: { 
      screenId: string; 
      status: 'NOT_GENERATED' | 'IN_PROGRESS' | 'COMPLETED' 
    }) => {
      const { data, error } = await supabase
        .from('screens')
        .update({ plan_status: status })
        .eq('id', screenId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['screens', projectId] });
    },
    onError: (error) => {
      console.error("Error updating screen status:", error);
      toast.error("Failed to update status");
    }
  });

  return {
    screens,
    isLoadingScreens,
    screensError,
    createScreens: createScreensMutation.mutate,
    isCreatingScreens: createScreensMutation.isPending,
    updateScreenDocumentation: updateScreenDocumentation.mutate,
    isUpdatingDocumentation: updateScreenDocumentation.isPending,
    updateScreenDetails: updateScreenDetails.mutate,
    isUpdatingDetails: updateScreenDetails.isPending,
    updateScreenPlan: updateScreenPlan.mutate,
    isUpdatingPlan: updateScreenPlan.isPending,
    updateScreenStatus: updateScreenStatus.mutate,
    isUpdatingStatus: updateScreenStatus.isPending,
    uploadProgress
  };
};
