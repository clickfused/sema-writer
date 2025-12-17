-- Create table for user AI API keys (encrypted storage)
CREATE TABLE public.user_api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'openrouter', 'gemini'
  encrypted_key TEXT NOT NULL,
  is_valid BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, provider)
);

-- Create table for brand voices
CREATE TABLE public.brand_voices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  tone TEXT, -- 'professional', 'conversational', 'friendly', etc.
  style_guidelines TEXT,
  vocabulary_preferences TEXT,
  example_content TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for sitemap collections
CREATE TABLE public.sitemap_collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sitemap_url TEXT NOT NULL,
  discovered_urls JSONB DEFAULT '[]'::jsonb,
  last_crawled_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending', -- 'pending', 'crawling', 'completed', 'error'
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_voices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sitemap_collections ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_api_keys
CREATE POLICY "Users can view their own API keys"
ON public.user_api_keys FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own API keys"
ON public.user_api_keys FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own API keys"
ON public.user_api_keys FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own API keys"
ON public.user_api_keys FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for brand_voices
CREATE POLICY "Users can view their own brand voices"
ON public.brand_voices FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own brand voices"
ON public.brand_voices FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own brand voices"
ON public.brand_voices FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own brand voices"
ON public.brand_voices FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for sitemap_collections
CREATE POLICY "Users can view their own sitemaps"
ON public.sitemap_collections FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sitemaps"
ON public.sitemap_collections FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sitemaps"
ON public.sitemap_collections FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sitemaps"
ON public.sitemap_collections FOR DELETE
USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_user_api_keys_updated_at
BEFORE UPDATE ON public.user_api_keys
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_brand_voices_updated_at
BEFORE UPDATE ON public.brand_voices
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sitemap_collections_updated_at
BEFORE UPDATE ON public.sitemap_collections
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();