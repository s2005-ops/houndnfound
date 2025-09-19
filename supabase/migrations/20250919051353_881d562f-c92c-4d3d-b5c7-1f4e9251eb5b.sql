-- Create teachers table for admin authentication
CREATE TABLE public.teachers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security for teachers
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

-- Create lost_items table
CREATE TABLE public.lost_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT NOT NULL,
  location_found TEXT NOT NULL,
  collection_location TEXT NOT NULL,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'collected', 'archived')),
  teacher_id UUID REFERENCES public.teachers(id),
  collected_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security for lost_items
ALTER TABLE public.lost_items ENABLE ROW LEVEL SECURITY;

-- Create storage bucket for lost item images
INSERT INTO storage.buckets (id, name, public) VALUES ('lost-items', 'lost-items', true);

-- Create policies for teachers table
CREATE POLICY "Teachers can view their own data" 
ON public.teachers 
FOR SELECT 
USING (true);

CREATE POLICY "Teachers can update their own data" 
ON public.teachers 
FOR UPDATE 
USING (true);

-- Create policies for lost_items table
CREATE POLICY "Anyone can view lost items" 
ON public.lost_items 
FOR SELECT 
USING (true);

CREATE POLICY "Teachers can insert lost items" 
ON public.lost_items 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Teachers can update lost items" 
ON public.lost_items 
FOR UPDATE 
USING (true);

-- Create policies for storage
CREATE POLICY "Anyone can view lost item images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'lost-items');

CREATE POLICY "Teachers can upload lost item images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'lost-items');

CREATE POLICY "Teachers can update lost item images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'lost-items');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_teachers_updated_at
  BEFORE UPDATE ON public.teachers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lost_items_updated_at
  BEFORE UPDATE ON public.lost_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to auto-archive old items (for cron job)
CREATE OR REPLACE FUNCTION public.auto_archive_old_items()
RETURNS void AS $$
BEGIN
  UPDATE public.lost_items 
  SET status = 'archived', updated_at = now()
  WHERE status = 'available' 
    AND created_at < (now() - INTERVAL '1 month');
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Insert a default teacher account (username: admin, password: admin123)
-- Password hash for 'admin123' using bcrypt
INSERT INTO public.teachers (username, password_hash, full_name, email)
VALUES ('admin', '$2a$10$8K1p/a0dqbZ89iXBFATK2eQnlFTFJBJj0qBmSuXtZ0J6jXZRdZb6G', 'Admin Teacher', 'admin@school.edu');