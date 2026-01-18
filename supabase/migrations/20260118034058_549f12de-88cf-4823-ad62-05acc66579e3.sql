-- Make user an admin
INSERT INTO public.user_roles (user_id, role) 
VALUES ('8c8edaab-96fc-4c60-a6a7-3cef3d06cd87', 'admin') 
ON CONFLICT (user_id, role) DO NOTHING;