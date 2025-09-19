-- Make email required and unique, remove username requirement
ALTER TABLE public.teachers ALTER COLUMN email SET NOT NULL;
ALTER TABLE public.teachers ADD CONSTRAINT teachers_email_unique UNIQUE (email);

-- Update the existing admin user to have a proper email
UPDATE public.teachers SET email = 'admin@school.edu' WHERE username = 'admin';

-- We'll keep username for now but make it optional for backwards compatibility
-- In the future, username can be removed entirely