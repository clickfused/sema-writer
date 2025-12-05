-- Add admin role for user code99chennai@gmail.com
INSERT INTO public.user_roles (user_id, role)
VALUES ('9bc9c149-a7da-4d6d-825b-e897f8c7736a', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;