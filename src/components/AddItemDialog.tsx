import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Upload, Loader2, X, Camera, MapPin, Clock } from 'lucide-react';
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
  const {
    teacher
  } = useAuth();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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
        const {
          error: uploadError,
          data
        } = await supabase.storage.from('lost-items').upload(fileName, formData.image);
        if (uploadError) throw uploadError;

        // Get public URL
        const {
          data: urlData
        } = supabase.storage.from('lost-items').getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
      }

      // Insert item into database
      const {
        data: item,
        error
      } = await supabase.from('lost_items').insert({
        description: formData.description,
        location_found: formData.location_found,
        collection_location: formData.collection_location,
        image_url: imageUrl,
        teacher_id: teacher?.id,
        status: 'available'
      }).select().single();
      if (error) throw error;
      toast({
        title: "Success!",
        description: "Lost item added successfully"
      });
      onItemAdded(item);
      handleClose();
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
      setFormData(prev => ({
        ...prev,
        image: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = e => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      image: null
    }));
    setImagePreview(null);
  };
  const handleClose = () => {
    setFormData({
      description: '',
      location_found: '',
      collection_location: '',
      image: null
    });
    setImagePreview(null);
    onOpenChange(false);
  };
  return <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] border-0 shadow-xl bg-white/95 backdrop-blur-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Add Lost Item</DialogTitle>
          <DialogDescription>
            Add a new item to the lost and found system with all the details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Item Photo</Label>
            
            {!imagePreview ? <Card className="border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer bg-muted/30">
                <CardContent className="p-8">
                  <label htmlFor="image-upload" className="cursor-pointer block text-center">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
                      <Camera className="h-8 w-8 text-white" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Click to upload photo</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG, WEBP up to 1MB</p>
                    </div>
                  </label>
                  <Input id="image-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </CardContent>
              </Card> : <Card className="overflow-hidden border-0 shadow-soft">
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                  <Button type="button" variant="outline" size="sm" onClick={removeImage} className="absolute top-2 right-2 w-8 h-8 p-0 bg-white/90 backdrop-blur-sm">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Item Description *</Label>
            <Textarea id="description" placeholder="Describe the lost item in detail (e.g., Red backpack with school logo, contains math textbook)" value={formData.description} onChange={e => setFormData(prev => ({
            ...prev,
            description: e.target.value
          }))} className="border-0 shadow-soft bg-white/50 min-h-[100px]" required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Location Found */}
            <div className="space-y-2">
              <Label htmlFor="location_found" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Where was it found? *
              </Label>
              <Input id="location_found" placeholder="e.g., Library, Cafeteria, Gym" value={formData.location_found} onChange={e => setFormData(prev => ({
              ...prev,
              location_found: e.target.value
            }))} className="border-0 shadow-soft bg-white/50" required />
            </div>

            {/* Collection Location */}
            <div className="space-y-2">
              <Label htmlFor="collection_location" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Where to collect it? *
              </Label>
              <Input id="collection_location" placeholder="e.g., Main Office, Teachers' Lounge" value={formData.collection_location} onChange={e => setFormData(prev => ({
              ...prev,
              collection_location: e.target.value
            }))} className="border-0 shadow-soft bg-white/50" required />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1 shadow-soft" disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-glow" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Adding...' : 'Add Item'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>;
};