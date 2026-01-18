-- Create admin_api_keys table for system-wide API key management
CREATE TABLE public.admin_api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL,
  encrypted_key TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_valid BOOLEAN DEFAULT NULL,
  last_validated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(provider)
);

-- Enable Row Level Security
ALTER TABLE public.admin_api_keys ENABLE ROW LEVEL SECURITY;

-- Only admins can view admin API keys
CREATE POLICY "Admins can view admin API keys" 
ON public.admin_api_keys 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can insert admin API keys
CREATE POLICY "Admins can insert admin API keys" 
ON public.admin_api_keys 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update admin API keys
CREATE POLICY "Admins can update admin API keys" 
ON public.admin_api_keys 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete admin API keys
CREATE POLICY "Admins can delete admin API keys" 
ON public.admin_api_keys 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_admin_api_keys_updated_at
BEFORE UPDATE ON public.admin_api_keys
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();