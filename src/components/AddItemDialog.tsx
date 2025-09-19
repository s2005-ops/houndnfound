import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Upload, Loader2 } from 'lucide-react';

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onItemAdded: (item: any) => void;
}

export const AddItemDialog: React.FC<AddItemDialogProps> = ({
  open,
  onOpenChange,
  onItemAdded
}) => {
  const { teacher } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    location_found: '',
    collection_location: '',
    image: null as File | null
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.location_found || !formData.collection_location) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      let imageUrl = null;

      // Upload image if provided
      if (formData.image) {
        const fileExt = formData.image.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('lost-items')
          .upload(fileName, formData.image);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('lost-items')
          .getPublicUrl(fileName);
        
        imageUrl = urlData.publicUrl;
      }

      // Insert item into database
      const { data: item, error } = await supabase
        .from('lost_items')
        .insert({
          description: formData.description,
          location_found: formData.location_found,
          collection_location: formData.collection_location,
          image_url: imageUrl,
          teacher_id: teacher?.id,
          status: 'available'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Lost item added successfully"
      });

      onItemAdded(item);
      setFormData({
        description: '',
        location_found: '',
        collection_location: '',
        image: null
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: "Error",
        description: "Failed to add item. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image size must be less than 5MB",
          variant: "destructive"
        });
        return;
      }
      setFormData(prev => ({ ...prev, image: file }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Lost Item</DialogTitle>
          <DialogDescription>
            Add a new item to the lost and found system
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Item Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe the lost item (e.g., Red backpack with school logo)"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location_found">Where was it found? *</Label>
            <Input
              id="location_found"
              placeholder="e.g., Library, Cafeteria, Gym"
              value={formData.location_found}
              onChange={(e) => setFormData(prev => ({ ...prev, location_found: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="collection_location">Where to collect it? *</Label>
            <Input
              id="collection_location"
              placeholder="e.g., Main Office, Teachers' Lounge"
              value={formData.collection_location}
              onChange={(e) => setFormData(prev => ({ ...prev, collection_location: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Item Photo</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="flex-1"
              />
              {formData.image && (
                <span className="text-sm text-muted-foreground">
                  {formData.image.name}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Optional. Max file size: 5MB
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Adding...' : 'Add Item'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};