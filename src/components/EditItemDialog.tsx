import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { LostItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Loader2, Upload, X } from 'lucide-react';

interface EditItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: LostItem;
  onItemUpdated: (updatedItem: LostItem) => void;
}

interface FormData {
  description: string;
  location_found: string;
  collection_location: string;
  status: 'available' | 'collected' | 'archived';
  image_url?: string;
}

export const EditItemDialog = ({ open, onOpenChange, item, onItemUpdated }: EditItemDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(item.image_url || null);
  
  const form = useForm<FormData>({
    defaultValues: {
      description: item.description,
      location_found: item.location_found,
      collection_location: item.collection_location,
      status: item.status as 'available' | 'collected' | 'archived',
      image_url: item.image_url || ''
    }
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setUploadedImage(null);
    setImagePreview(null);
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      let imageUrl = item.image_url;

      // Upload new image if one was selected
      if (uploadedImage) {
        const fileName = `${Date.now()}-${uploadedImage.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('lost-items')
          .upload(fileName, uploadedImage);

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('lost-items')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      const updateData: any = {
        description: data.description,
        location_found: data.location_found,
        collection_location: data.collection_location,
        status: data.status,
        updated_at: new Date().toISOString()
      };

      if (imageUrl) {
        updateData.image_url = imageUrl;
      }

      // If marking as collected, add collected_at timestamp
      if (data.status === 'collected' && item.status !== 'collected') {
        updateData.collected_at = new Date().toISOString();
      }

      const { data: updatedItem, error } = await supabase
        .from('lost_items')
        .update(updateData)
        .eq('id', item.id)
        .select()
        .single();

      if (error) throw error;

      onItemUpdated(updatedItem);
      onOpenChange(false);
      
      toast({
        title: "Success",
        description: "Item updated successfully"
      });
    } catch (error) {
      console.error('Error updating item:', error);
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Lost Item</DialogTitle>
          <DialogDescription>
            Update the details of this lost item
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the item..."
                      {...field}
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location_found"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Found *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Where was it found?"
                      {...field}
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="collection_location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Collection Location *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Where can it be collected?"
                      {...field}
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="collected">Collected</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Image (optional)</FormLabel>
              {imagePreview ? (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full max-w-xs h-32 object-cover rounded-md border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={removeImage}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Upload an image</p>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="max-w-xs"
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Item
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};