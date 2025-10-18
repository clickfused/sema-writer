-- Add WordPress credentials to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS wordpress_url TEXT,
ADD COLUMN IF NOT EXISTS wordpress_username TEXT,
ADD COLUMN IF NOT EXISTS wordpress_app_password TEXT;