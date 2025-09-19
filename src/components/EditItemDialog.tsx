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
import { Loader2 } from 'lucide-react';

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
  
  const form = useForm<FormData>({
    defaultValues: {
      description: item.description,
      location_found: item.location_found,
      collection_location: item.collection_location,
      status: item.status as 'available' | 'collected' | 'archived',
      image_url: item.image_url || ''
    }
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      const updateData: any = {
        description: data.description,
        location_found: data.location_found,
        collection_location: data.collection_location,
        status: data.status,
        updated_at: new Date().toISOString()
      };

      if (data.image_url) {
        updateData.image_url = data.image_url;
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

            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL (optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/image.jpg"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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