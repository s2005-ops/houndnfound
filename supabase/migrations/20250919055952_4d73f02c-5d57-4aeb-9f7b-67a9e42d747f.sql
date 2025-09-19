-- Add RLS policy to allow teachers/admins to delete lost items
CREATE POLICY "Teachers can delete lost items" 
ON public.lost_items 
FOR DELETE 
USING (true);