-- Add access_level column to teachers table
ALTER TABLE public.teachers ADD COLUMN access_level TEXT NOT NULL DEFAULT 'admin' CHECK (access_level IN ('super_admin', 'admin'));

-- Update the existing admin user to be a super admin
UPDATE public.teachers SET access_level = 'super_admin' WHERE username = 'admin';

-- Create function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(teacher_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.teachers 
    WHERE id = teacher_id AND access_level = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create RLS policy for teachers management
CREATE POLICY "Super admins can view all teachers" 
ON public.teachers 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.teachers 
    WHERE username = current_setting('request.jwt.claims', true)::json->>'username' 
    AND access_level = 'super_admin'
  ) OR 
  username = current_setting('request.jwt.claims', true)::json->>'username'
);

CREATE POLICY "Super admins can update teacher access levels" 
ON public.teachers 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.teachers 
    WHERE username = current_setting('request.jwt.claims', true)::json->>'username' 
    AND access_level = 'super_admin'
  )
);