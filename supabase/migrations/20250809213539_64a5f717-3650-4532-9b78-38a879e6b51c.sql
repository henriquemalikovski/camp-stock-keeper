-- Update the profiles table to ensure all users have a default role
UPDATE public.profiles 
SET role = 'user' 
WHERE role IS NULL;

-- Make role column NOT NULL with default value
ALTER TABLE public.profiles 
ALTER COLUMN role SET NOT NULL,
ALTER COLUMN role SET DEFAULT 'user';

-- Create a function to check if a user is admin
CREATE OR REPLACE FUNCTION public.is_admin_user(user_email text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE email = user_email AND role = 'admin'
  );
$function$

-- Update existing admin user role if it exists
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'hmalikovski@gmail.com';