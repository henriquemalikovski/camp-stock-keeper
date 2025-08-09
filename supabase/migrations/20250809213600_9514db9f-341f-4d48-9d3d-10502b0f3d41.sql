-- Create a function to check if a user is admin by role
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