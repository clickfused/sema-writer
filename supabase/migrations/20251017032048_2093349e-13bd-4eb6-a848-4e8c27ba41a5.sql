-- Add settings columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS api_key TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS webhook_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS auto_save_enabled BOOLEAN DEFAULT true;

-- Add FAQ column to blog_posts table
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS faq_content TEXT;

-- Create drafts table for auto-save
CREATE TABLE IF NOT EXISTS public.blog_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  keywords JSONB,
  meta_tags JSONB,
  headings JSONB,
  short_intro TEXT,
  content TEXT,
  faq_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS on drafts
ALTER TABLE public.blog_drafts ENABLE ROW LEVEL SECURITY;

-- RLS policies for drafts
CREATE POLICY "Users can view their own drafts"
  ON public.blog_drafts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own drafts"
  ON public.blog_drafts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own drafts"
  ON public.blog_drafts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own drafts"
  ON public.blog_drafts FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated_at trigger for drafts
CREATE TRIGGER update_blog_drafts_updated_at
  BEFORE UPDATE ON public.blog_drafts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();