-- Make clickfused@gmail.com an admin
INSERT INTO public.user_roles (user_id, role) 
VALUES ('cf2d71f8-8e19-4482-ab05-53508bf35b92', 'admin') 
ON CONFLICT (user_id, role) DO NOTHING;